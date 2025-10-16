import { z } from "zod";

// Email template variable types
export const EmailTemplateVariableSchema = z.object({
  name: z.string(),
  type: z.enum(["string", "number", "date", "boolean", "object"]),
  required: z.boolean().default(false),
  description: z.string().optional(),
  defaultValue: z.any().optional(),
});

export type EmailTemplateVariable = z.infer<typeof EmailTemplateVariableSchema>;

// Email template categories
export enum EmailTemplateCategory {
  GENERAL = "GENERAL",
  LEAD = "LEAD",
  PAYMENT = "PAYMENT",
  NOTIFICATION = "NOTIFICATION",
  SYSTEM = "SYSTEM",
  ADMISSION = "ADMISSION",
  DOCUMENT = "DOCUMENT",
  FINANCE = "FINANCE",
}

// Template variable substitution
export interface TemplateVariables {
  [key: string]: string | number | Date | boolean | object;
}

// System email templates with predefined variables
export const SYSTEM_EMAIL_TEMPLATES = {
  WELCOME_LEAD: {
    name: "Welcome New Lead",
    subject: "Welcome to {{institutionName}} - Your Application Journey Begins",
    category: EmailTemplateCategory.LEAD,
    variables: [
      {
        name: "leadName",
        type: "string",
        required: true,
        description: "Lead's full name",
      },
      {
        name: "institutionName",
        type: "string",
        required: true,
        description: "Institution name",
      },
      {
        name: "courseName",
        type: "string",
        required: false,
        description: "Course of interest",
      },
      {
        name: "nextSteps",
        type: "string",
        required: false,
        description: "Next steps information",
      },
      {
        name: "contactInfo",
        type: "object",
        required: false,
        description: "Contact information",
      },
    ],
  },
  PAYMENT_CONFIRMATION: {
    name: "Payment Confirmation",
    subject: "Payment Confirmed - {{institutionName}}",
    category: EmailTemplateCategory.PAYMENT,
    variables: [
      {
        name: "studentName",
        type: "string",
        required: true,
        description: "Student's name",
      },
      {
        name: "institutionName",
        type: "string",
        required: true,
        description: "Institution name",
      },
      {
        name: "amount",
        type: "number",
        required: true,
        description: "Payment amount",
      },
      {
        name: "transactionId",
        type: "string",
        required: true,
        description: "Transaction ID",
      },
      {
        name: "paymentDate",
        type: "date",
        required: true,
        description: "Payment date",
      },
      {
        name: "receiptUrl",
        type: "string",
        required: false,
        description: "Receipt download URL",
      },
    ],
  },
  DOCUMENT_REQUEST: {
    name: "Document Request",
    subject: "Required Documents - {{institutionName}}",
    category: EmailTemplateCategory.DOCUMENT,
    variables: [
      {
        name: "studentName",
        type: "string",
        required: true,
        description: "Student's name",
      },
      {
        name: "institutionName",
        type: "string",
        required: true,
        description: "Institution name",
      },
      {
        name: "requiredDocuments",
        type: "object",
        required: true,
        description: "List of required documents",
      },
      {
        name: "deadline",
        type: "date",
        required: false,
        description: "Document submission deadline",
      },
      {
        name: "uploadUrl",
        type: "string",
        required: false,
        description: "Document upload URL",
      },
    ],
  },
  ADMISSION_OFFER: {
    name: "Admission Offer",
    subject: "Congratulations! Admission Offer from {{institutionName}}",
    category: EmailTemplateCategory.ADMISSION,
    variables: [
      {
        name: "studentName",
        type: "string",
        required: true,
        description: "Student's name",
      },
      {
        name: "institutionName",
        type: "string",
        required: true,
        description: "Institution name",
      },
      {
        name: "courseName",
        type: "string",
        required: true,
        description: "Course name",
      },
      {
        name: "offerDetails",
        type: "object",
        required: true,
        description: "Offer details",
      },
      {
        name: "acceptanceDeadline",
        type: "date",
        required: true,
        description: "Acceptance deadline",
      },
      {
        name: "nextSteps",
        type: "string",
        required: false,
        description: "Next steps information",
      },
    ],
  },
  FOLLOW_UP_REMINDER: {
    name: "Follow-up Reminder",
    subject: "Follow-up Reminder - {{institutionName}}",
    category: EmailTemplateCategory.LEAD,
    variables: [
      {
        name: "leadName",
        type: "string",
        required: true,
        description: "Lead's name",
      },
      {
        name: "institutionName",
        type: "string",
        required: true,
        description: "Institution name",
      },
      {
        name: "lastContact",
        type: "date",
        required: false,
        description: "Last contact date",
      },
      {
        name: "nextAction",
        type: "string",
        required: false,
        description: "Next action required",
      },
      {
        name: "contactInfo",
        type: "object",
        required: false,
        description: "Contact information",
      },
    ],
  },
  ADMISSION_FORM_ACCESS: {
    name: "Admission Form Access",
    subject: "Complete Your Application - {{institutionName}}",
    category: EmailTemplateCategory.ADMISSION,
    variables: [
      {
        name: "studentName",
        type: "string",
        required: true,
        description: "Student's name",
      },
      {
        name: "institutionName",
        type: "string",
        required: true,
        description: "Institution name",
      },
      {
        name: "formTitle",
        type: "string",
        required: true,
        description: "Admission form title",
      },
      {
        name: "formUrl",
        type: "string",
        required: true,
        description: "Form access URL",
      },
      {
        name: "deadline",
        type: "date",
        required: false,
        description: "Form submission deadline",
      },
      {
        name: "instructions",
        type: "string",
        required: false,
        description: "Additional instructions",
      },
    ],
  },
  ADMISSION_FORM_REMINDER: {
    name: "Admission Form Reminder",
    subject: "Reminder: Complete Your Application - {{institutionName}}",
    category: EmailTemplateCategory.ADMISSION,
    variables: [
      {
        name: "studentName",
        type: "string",
        required: true,
        description: "Student's name",
      },
      {
        name: "institutionName",
        type: "string",
        required: true,
        description: "Institution name",
      },
      {
        name: "formTitle",
        type: "string",
        required: true,
        description: "Admission form title",
      },
      {
        name: "formUrl",
        type: "string",
        required: true,
        description: "Form access URL",
      },
      {
        name: "deadline",
        type: "date",
        required: false,
        description: "Form submission deadline",
      },
      {
        name: "progressPercentage",
        type: "number",
        required: false,
        description: "Form completion percentage",
      },
      {
        name: "remainingFields",
        type: "object",
        required: false,
        description: "List of remaining fields to complete",
      },
    ],
  },
  ADMISSION_FORM_SUBMITTED: {
    name: "Admission Form Submitted",
    subject: "Application Submitted Successfully - {{institutionName}}",
    category: EmailTemplateCategory.ADMISSION,
    variables: [
      {
        name: "studentName",
        type: "string",
        required: true,
        description: "Student's name",
      },
      {
        name: "institutionName",
        type: "string",
        required: true,
        description: "Institution name",
      },
      {
        name: "formTitle",
        type: "string",
        required: true,
        description: "Admission form title",
      },
      {
        name: "submissionId",
        type: "string",
        required: true,
        description: "Form submission ID",
      },
      {
        name: "submissionDate",
        type: "date",
        required: true,
        description: "Submission date",
      },
      {
        name: "nextSteps",
        type: "string",
        required: false,
        description: "Next steps information",
      },
      {
        name: "contactInfo",
        type: "object",
        required: false,
        description: "Contact information for follow-up",
      },
    ],
  },
} as const;

// Template variable substitution utility
// Email template generators for specific use cases
export function generatePasswordResetEmail(
  userName: string,
  resetToken: string,
  resetUrl: string
): { subject: string; html: string; text: string } {
  return {
    subject: "Password Reset Request",
    html: `
      <h2>Password Reset Request</h2>
      <p>Hello ${userName},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    text: `Password Reset Request\n\nHello ${userName},\n\nYou requested a password reset. Visit: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
  };
}

export function generateInstitutionCredentialsEmail(
  institutionName: string,
  adminName: string,
  adminEmail: string,
  adminPassword: string,
  loginUrl: string
): { subject: string; html: string; text: string } {
  return {
    subject: "Your Institution Account Credentials",
    html: `
      <h2>Welcome to LEAD101!</h2>
      <p>Hello ${adminName},</p>
      <p>Your institution "${institutionName}" has been successfully set up on LEAD101.</p>
      <p><strong>Login Credentials:</strong></p>
      <ul>
        <li>Email: ${adminEmail}</li>
        <li>Password: ${adminPassword}</li>
      </ul>
      <p><a href="${loginUrl}">Login to your account</a></p>
      <p>Please change your password after first login.</p>
    `,
    text: `Welcome to LEAD101!\n\nHello ${adminName},\n\nYour institution "${institutionName}" has been successfully set up.\n\nLogin Credentials:\nEmail: ${adminEmail}\nPassword: ${adminPassword}\n\nLogin: ${loginUrl}\n\nPlease change your password after first login.`,
  };
}

export function generateUserCredentialsEmail(
  userName: string,
  userEmail: string,
  userPassword: string,
  institutionName: string,
  loginUrl: string
): { subject: string; html: string; text: string } {
  return {
    subject: "Your User Account Credentials",
    html: `
      <h2>Welcome to ${institutionName}!</h2>
      <p>Hello ${userName},</p>
      <p>Your user account has been created for ${institutionName}.</p>
      <p><strong>Login Credentials:</strong></p>
      <ul>
        <li>Email: ${userEmail}</li>
        <li>Password: ${userPassword}</li>
      </ul>
      <p><a href="${loginUrl}">Login to your account</a></p>
      <p>Please change your password after first login.</p>
    `,
    text: `Welcome to ${institutionName}!\n\nHello ${userName},\n\nYour user account has been created.\n\nLogin Credentials:\nEmail: ${userEmail}\nPassword: ${userPassword}\n\nLogin: ${loginUrl}\n\nPlease change your password after first login.`,
  };
}

export function generateAdmissionFormAccessEmail(
  studentName: string,
  institutionName: string,
  formTitle: string,
  formUrl: string,
  deadline?: Date,
  instructions?: string
): { subject: string; html: string; text: string } {
  const deadlineText = deadline
    ? `<p><strong>Deadline:</strong> ${deadline.toLocaleDateString()}</p>`
    : "";

  const instructionsText = instructions
    ? `<div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
         <h3>Important Instructions:</h3>
         <p>${instructions}</p>
       </div>`
    : "";

  return {
    subject: `Complete Your Application - ${institutionName}`,
    html: `
      <h2>Complete Your Application</h2>
      <p>Hello ${studentName},</p>
      <p>Thank you for your interest in <strong>${institutionName}</strong>!</p>
      <p>You can now complete your admission application using the form below:</p>
      
      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3>${formTitle}</h3>
        <p>Click the button below to access your application form:</p>
        <a href="${formUrl}" style="background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
          Complete Application Form
        </a>
      </div>
      
      ${deadlineText}
      ${instructionsText}
      
      <p><strong>Important:</strong> Please complete all required fields and submit your application before the deadline.</p>
      <p>If you have any questions, please don't hesitate to contact our admissions team.</p>
    `,
    text: `Complete Your Application\n\nHello ${studentName},\n\nThank you for your interest in ${institutionName}!\n\nYou can now complete your admission application:\n\nForm: ${formTitle}\nAccess: ${formUrl}\n${
      deadline ? `Deadline: ${deadline.toLocaleDateString()}` : ""
    }\n\n${
      instructions ? `Instructions: ${instructions}` : ""
    }\n\nPlease complete all required fields and submit your application before the deadline.\n\nIf you have any questions, please don't hesitate to contact our admissions team.`,
  };
}

export function generateAdmissionFormReminderEmail(
  studentName: string,
  institutionName: string,
  formTitle: string,
  formUrl: string,
  deadline?: Date,
  progressPercentage?: number,
  remainingFields?: string[]
): { subject: string; html: string; text: string } {
  const deadlineText = deadline
    ? `<p><strong>Deadline:</strong> ${deadline.toLocaleDateString()}</p>`
    : "";

  const progressText =
    progressPercentage !== undefined
      ? `<p><strong>Progress:</strong> ${progressPercentage}% complete</p>`
      : "";

  const remainingFieldsText =
    remainingFields && remainingFields.length > 0
      ? `<div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
         <h4>Remaining Fields to Complete:</h4>
         <ul>
           ${remainingFields.map((field) => `<li>${field}</li>`).join("")}
         </ul>
       </div>`
      : "";

  return {
    subject: `Reminder: Complete Your Application - ${institutionName}`,
    html: `
      <h2>Application Reminder</h2>
      <p>Hello ${studentName},</p>
      <p>This is a friendly reminder that your admission application for <strong>${institutionName}</strong> is still pending completion.</p>
      
      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3>${formTitle}</h3>
        <p>Continue where you left off:</p>
        <a href="${formUrl}" style="background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
          Continue Application
        </a>
      </div>
      
      ${progressText}
      ${deadlineText}
      ${remainingFieldsText}
      
      <p><strong>Don't miss out!</strong> Complete your application to secure your spot.</p>
    `,
    text: `Application Reminder\n\nHello ${studentName},\n\nThis is a friendly reminder that your admission application for ${institutionName} is still pending completion.\n\nForm: ${formTitle}\nAccess: ${formUrl}\n${
      progressPercentage !== undefined
        ? `Progress: ${progressPercentage}% complete`
        : ""
    }\n${deadline ? `Deadline: ${deadline.toLocaleDateString()}` : ""}\n\n${
      remainingFields && remainingFields.length > 0
        ? `Remaining fields: ${remainingFields.join(", ")}`
        : ""
    }\n\nDon't miss out! Complete your application to secure your spot.`,
  };
}

export function generateAdmissionFormSubmittedEmail(
  studentName: string,
  institutionName: string,
  formTitle: string,
  submissionId: string,
  submissionDate: Date,
  nextSteps?: string,
  contactInfo?: { phone?: string; email?: string; address?: string }
): { subject: string; html: string; text: string } {
  const nextStepsText = nextSteps
    ? `<div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
         <h3>Next Steps:</h3>
         <p>${nextSteps}</p>
       </div>`
    : "";

  const contactInfoText = contactInfo
    ? `<div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
         <h3>Contact Information:</h3>
         ${
           contactInfo.phone
             ? `<p><strong>Phone:</strong> ${contactInfo.phone}</p>`
             : ""
         }
         ${
           contactInfo.email
             ? `<p><strong>Email:</strong> <a href="mailto:${contactInfo.email}">${contactInfo.email}</a></p>`
             : ""
         }
         ${
           contactInfo.address
             ? `<p><strong>Address:</strong> ${contactInfo.address}</p>`
             : ""
         }
       </div>`
    : "";

  return {
    subject: `Application Submitted Successfully - ${institutionName}`,
    html: `
      <h2>Application Submitted Successfully!</h2>
      <p>Hello ${studentName},</p>
      <p>Congratulations! Your admission application for <strong>${institutionName}</strong> has been successfully submitted.</p>
      
      <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Submission Details</h3>
        <p><strong>Form:</strong> ${formTitle}</p>
        <p><strong>Submission ID:</strong> ${submissionId}</p>
        <p><strong>Date Submitted:</strong> ${submissionDate.toLocaleDateString()}</p>
      </div>
      
      ${nextStepsText}
      ${contactInfoText}
      
      <p>We will review your application and get back to you soon. Thank you for choosing ${institutionName}!</p>
    `,
    text: `Application Submitted Successfully!\n\nHello ${studentName},\n\nCongratulations! Your admission application for ${institutionName} has been successfully submitted.\n\nSubmission Details:\nForm: ${formTitle}\nSubmission ID: ${submissionId}\nDate Submitted: ${submissionDate.toLocaleDateString()}\n\n${
      nextSteps ? `Next Steps:\n${nextSteps}` : ""
    }\n\n${
      contactInfo
        ? `Contact Information:\n${
            contactInfo.phone ? `Phone: ${contactInfo.phone}` : ""
          }\n${contactInfo.email ? `Email: ${contactInfo.email}` : ""}\n${
            contactInfo.address ? `Address: ${contactInfo.address}` : ""
          }`
        : ""
    }\n\nWe will review your application and get back to you soon. Thank you for choosing ${institutionName}!`,
  };
}

export class TemplateEngine {
  /**
   * Replace variables in template content
   */
  static substituteVariables(
    template: string,
    variables: TemplateVariables
  ): string {
    let result = template;

    // Replace {{variable}} patterns
    result = result.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
      const value = variables[variableName];
      if (value === undefined || value === null) {
        console.warn(`Template variable '${variableName}' not found`);
        return match; // Keep original if variable not found
      }
      return String(value);
    });

    // Replace {{object.property}} patterns
    result = result.replace(
      /\{\{(\w+)\.(\w+)\}\}/g,
      (match, objectName, propertyName) => {
        const obj = variables[objectName];
        if (obj && typeof obj === "object" && propertyName in obj) {
          return String((obj as any)[propertyName]);
        }
        console.warn(
          `Template variable '${objectName}.${propertyName}' not found`
        );
        return match;
      }
    );

    return result;
  }

  /**
   * Validate template variables against schema
   */
  static validateVariables(
    variables: TemplateVariables,
    schema: EmailTemplateVariable[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const variable of schema) {
      if (variable.required && !(variable.name in variables)) {
        errors.push(`Required variable '${variable.name}' is missing`);
        continue;
      }

      const value = variables[variable.name];
      if (value !== undefined) {
        const typeCheck = this.validateVariableType(value, variable.type);
        if (!typeCheck.valid) {
          errors.push(
            `Variable '${variable.name}' type mismatch: expected ${variable.type}, got ${typeCheck.actualType}`
          );
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate variable type
   */
  private static validateVariableType(
    value: any,
    expectedType: string
  ): { valid: boolean; actualType: string } {
    const actualType = typeof value;

    switch (expectedType) {
      case "string":
        return { valid: actualType === "string", actualType };
      case "number":
        return { valid: actualType === "number" && !isNaN(value), actualType };
      case "boolean":
        return { valid: actualType === "boolean", actualType };
      case "date":
        return {
          valid: value instanceof Date || !isNaN(Date.parse(value)),
          actualType,
        };
      case "object":
        return { valid: actualType === "object" && value !== null, actualType };
      default:
        return { valid: false, actualType };
    }
  }

  /**
   * Extract variables from template content
   */
  static extractVariables(template: string): string[] {
    const variables = new Set<string>();

    // Extract {{variable}} patterns
    const simpleMatches = template.match(/\{\{(\w+)\}\}/g);
    if (simpleMatches) {
      simpleMatches.forEach((match) => {
        const variable = match.replace(/\{\{|\}\}/g, "");
        variables.add(variable);
      });
    }

    // Extract {{object.property}} patterns
    const objectMatches = template.match(/\{\{(\w+)\.(\w+)\}\}/g);
    if (objectMatches) {
      objectMatches.forEach((match) => {
        const variable = match.replace(/\{\{|\}\}/g, "");
        variables.add(variable);
      });
    }

    return Array.from(variables);
  }
}

// Email template builder utility
export class EmailTemplateBuilder {
  /**
   * Create HTML email template with modern styling
   */
  static createHTMLTemplate(
    title: string,
    content: string,
    institutionName: string,
    supportEmail?: string
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #1f2937;
            margin-top: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content p {
            margin-bottom: 20px;
            font-size: 16px;
            line-height: 1.7;
        }
        .highlight {
            background: #f0f9ff;
            border-left: 4px solid #0ea5e9;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 30px 0;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${institutionName}</h1>
            <p>Your Education Partner</p>
        </div>
        
        <div class="content">
            ${content}
        </div>
        
        <div class="footer">
            <p>This email was sent by <strong>${institutionName}</strong></p>
            ${
              supportEmail
                ? `<p>Need help? Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></p>`
                : ""
            }
            <p>© ${new Date().getFullYear()} ${institutionName}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Create plain text version of email
   */
  static createTextTemplate(
    title: string,
    content: string,
    institutionName: string,
    supportEmail?: string
  ): string {
    const textContent = content.replace(/<[^>]*>/g, ""); // Strip HTML tags

    return `
${title}

${textContent}

---
This email was sent by ${institutionName}
${supportEmail ? `Need help? Contact us at ${supportEmail}` : ""}
© ${new Date().getFullYear()} ${institutionName}. All rights reserved.
`;
  }
}
