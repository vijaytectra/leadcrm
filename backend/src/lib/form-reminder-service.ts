import { prisma } from "./prisma";
import { emailService } from "./email";
import { generateAdmissionFormReminderEmail } from "./email-templates";
import { StudentFormAccessService } from "./student-form-access";

export interface ReminderConfig {
  enabled: boolean;
  intervals: number[]; // Days between reminders [1, 3, 7, 14]
  maxReminders: number;
  excludeWeekends: boolean;
  businessHoursOnly: boolean;
  businessStartHour: number; // 9 AM
  businessEndHour: number; // 5 PM
}

export interface ReminderStats {
  totalScheduled: number;
  totalSent: number;
  totalSkipped: number;
  byInterval: Record<number, number>;
}

export class FormReminderService {
  private static defaultConfig: ReminderConfig = {
    enabled: true,
    intervals: [1, 3, 7, 14], // 1 day, 3 days, 1 week, 2 weeks
    maxReminders: 4,
    excludeWeekends: true,
    businessHoursOnly: false,
    businessStartHour: 9,
    businessEndHour: 17,
  };

  /**
   * Schedule reminders for incomplete forms
   */
  static async scheduleReminders(
    tenantId: string,
    config: Partial<ReminderConfig> = {}
  ): Promise<{ scheduled: number; skipped: number }> {
    const finalConfig = { ...this.defaultConfig, ...config };

    if (!finalConfig.enabled) {
      return { scheduled: 0, skipped: 0 };
    }

    // Get incomplete form accesses
    const incompleteAccesses = await prisma.studentFormAccess.findMany({
      where: {
        tenantId,
        status: { in: ["NOT_STARTED", "IN_PROGRESS"] },
      },
      include: {
        lead: {
          select: {
            name: true,
            email: true,
          },
        },
        admissionForm: {
          select: {
            title: true,
            submissionDeadline: true,
          },
        },
        tenant: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    let scheduled = 0;
    let skipped = 0;

    for (const access of incompleteAccesses) {
      // Check if we should skip this access
      if (this.shouldSkipReminder(access, finalConfig)) {
        skipped++;
        continue;
      }

      // Calculate next reminder time
      const nextReminderTime = this.calculateNextReminderTime(
        access.createdAt,
        finalConfig
      );

      if (!nextReminderTime) {
        skipped++;
        continue;
      }

      // Create or update reminder log
      await this.createOrUpdateReminderLog(access.id, nextReminderTime);
      scheduled++;
    }

    return { scheduled, skipped };
  }

  /**
   * Process pending reminders
   */
  static async processPendingReminders(): Promise<ReminderStats> {
    const now = new Date();

    // Get reminders that are due
    const dueReminders = await prisma.formReminderLog.findMany({
      where: {
        nextReminderAt: {
          lte: now,
        },
      },
      include: {
        // Note: We need to get the access details through a separate query
        // since FormReminderLog doesn't have direct relations
      },
    });

    const stats: ReminderStats = {
      totalScheduled: dueReminders.length,
      totalSent: 0,
      totalSkipped: 0,
      byInterval: {},
    };

    for (const reminder of dueReminders) {
      try {
        // Get the form access details
        const access = await prisma.studentFormAccess.findUnique({
          where: { id: reminder.accessId },
          include: {
            lead: {
              select: {
                name: true,
                email: true,
              },
            },
            admissionForm: {
              select: {
                title: true,
                submissionDeadline: true,
              },
            },
            tenant: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        });

        if (!access || access.status === "SUBMITTED") {
          // Skip if access no longer exists or form is already submitted
          stats.totalSkipped++;
          await this.deleteReminderLog(reminder.id);
          continue;
        }

        // Check if we should send the reminder
        if (this.shouldSendReminder(access, reminder)) {
          await this.sendReminderEmail(access, reminder);
          stats.totalSent++;
          stats.byInterval[reminder.reminderCount] =
            (stats.byInterval[reminder.reminderCount] || 0) + 1;

          // Schedule next reminder or mark as complete
          await this.scheduleNextReminder(access, reminder);
        } else {
          stats.totalSkipped++;
        }
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
        stats.totalSkipped++;
      }
    }

    return stats;
  }

  /**
   * Send reminder email
   */
  private static async sendReminderEmail(
    access: any,
    reminder: any
  ): Promise<void> {
    const formUrl = `${process.env.FRONTEND_URL}/student/form/${access.accessToken}`;

    // Calculate progress percentage if form has progress data
    let progressPercentage: number | undefined;
    let remainingFields: string[] | undefined;

    if (access.progressData && typeof access.progressData === "object") {
      // This would need to be implemented based on your form structure
      // For now, we'll just show a basic progress indicator
      progressPercentage = access.status === "IN_PROGRESS" ? 50 : 0;
    }

    const emailContent = generateAdmissionFormReminderEmail(
      access.lead.name,
      access.tenant.name,
      access.admissionForm.title,
      formUrl,
      access.admissionForm.submissionDeadline,
      progressPercentage,
      remainingFields
    );

    await emailService.sendEmail(
      access.lead.email,
      emailContent.subject,
      emailContent.html,
      emailContent.text
    );
  }

  /**
   * Schedule next reminder
   */
  private static async scheduleNextReminder(
    access: any,
    currentReminder: any
  ): Promise<void> {
    const reminderCount = currentReminder.reminderCount + 1;
    const maxReminders = 4; // Default max reminders

    if (reminderCount >= maxReminders) {
      // No more reminders
      await this.deleteReminderLog(currentReminder.id);
      return;
    }

    // Calculate next reminder time (1, 3, 7, 14 days)
    const intervals = [1, 3, 7, 14];
    const nextInterval = intervals[reminderCount] || 14;
    const nextReminderTime = new Date();
    nextReminderTime.setDate(nextReminderTime.getDate() + nextInterval);

    await prisma.formReminderLog.update({
      where: { id: currentReminder.id },
      data: {
        reminderCount,
        lastReminderAt: new Date(),
        nextReminderAt: nextReminderTime,
      },
    });
  }

  /**
   * Check if we should skip sending a reminder
   */
  private static shouldSkipReminder(
    access: any,
    config: ReminderConfig
  ): boolean {
    // Skip if form is already submitted
    if (access.status === "SUBMITTED") {
      return true;
    }

    // Skip if deadline has passed
    if (
      access.admissionForm.submissionDeadline &&
      new Date() > access.admissionForm.submissionDeadline
    ) {
      return true;
    }

    // Skip if it's weekend and we exclude weekends
    if (config.excludeWeekends) {
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Sunday or Saturday
        return true;
      }
    }

    // Skip if outside business hours
    if (config.businessHoursOnly) {
      const hour = new Date().getHours();
      if (hour < config.businessStartHour || hour >= config.businessEndHour) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if we should send a specific reminder
   */
  private static shouldSendReminder(access: any, reminder: any): boolean {
    // Don't send if form is submitted
    if (access.status === "SUBMITTED") {
      return false;
    }

    // Don't send if deadline has passed
    if (
      access.admissionForm.submissionDeadline &&
      new Date() > access.admissionForm.submissionDeadline
    ) {
      return false;
    }

    return true;
  }

  /**
   * Calculate next reminder time
   */
  private static calculateNextReminderTime(
    createdAt: Date,
    config: ReminderConfig
  ): Date | null {
    const now = new Date();
    const daysSinceCreation = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Find the next appropriate interval
    for (const interval of config.intervals) {
      if (daysSinceCreation >= interval) {
        const nextTime = new Date(createdAt);
        nextTime.setDate(nextTime.getDate() + interval);

        // Check if it's in the future
        if (nextTime > now) {
          return nextTime;
        }
      }
    }

    return null;
  }

  /**
   * Create or update reminder log
   */
  private static async createOrUpdateReminderLog(
    accessId: string,
    nextReminderAt: Date
  ): Promise<void> {
    const existingReminder = await prisma.formReminderLog.findFirst({
      where: { accessId },
    });

    if (existingReminder) {
      await prisma.formReminderLog.update({
        where: { id: existingReminder.id },
        data: {
          nextReminderAt,
          lastReminderAt: new Date(),
        },
      });
    } else {
      await prisma.formReminderLog.create({
        data: {
          accessId,
          nextReminderAt,
          lastReminderAt: new Date(),
          reminderCount: 0,
        },
      });
    }
  }

  /**
   * Delete reminder log
   */
  private static async deleteReminderLog(reminderId: string): Promise<void> {
    await prisma.formReminderLog.delete({
      where: { id: reminderId },
    });
  }

  /**
   * Get reminder statistics
   */
  static async getReminderStats(tenantId: string): Promise<{
    totalReminders: number;
    pendingReminders: number;
    sentToday: number;
    completionRate: number;
  }> {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const [totalReminders, pendingReminders, sentToday, completedAccesses] =
      await Promise.all([
        prisma.formReminderLog.count({
          where: {
            access: {
              tenantId,
            },
          },
        }),
        prisma.formReminderLog.count({
          where: {
            access: {
              tenantId,
            },
            nextReminderAt: {
              lte: now,
            },
          },
        }),
        prisma.formReminderLog.count({
          where: {
            access: {
              tenantId,
            },
            lastReminderAt: {
              gte: startOfDay,
            },
          },
        }),
        prisma.studentFormAccess.count({
          where: {
            tenantId,
            status: "SUBMITTED",
          },
        }),
      ]);

    const totalAccesses = await prisma.studentFormAccess.count({
      where: { tenantId },
    });

    const completionRate =
      totalAccesses > 0 ? (completedAccesses / totalAccesses) * 100 : 0;

    return {
      totalReminders,
      pendingReminders,
      sentToday,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }

  /**
   * Cancel all reminders for a form access
   */
  static async cancelReminders(accessId: string): Promise<void> {
    await prisma.formReminderLog.deleteMany({
      where: { accessId },
    });
  }

  /**
   * Clean up old reminder logs
   */
  static async cleanupOldReminders(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.formReminderLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        access: {
          status: "SUBMITTED",
        },
      },
    });

    return result.count;
  }
}
