import { z } from "zod";

// Lead scoring configuration
export interface LeadScoringConfig {
  formType: {
    [key: string]: number; // Form type weights
  };
  fieldCompleteness: {
    required: number; // Weight for required fields
    optional: number; // Weight for optional fields
  };
  responseTime: {
    immediate: number; // Within 1 hour
    fast: number; // Within 24 hours
    normal: number; // Within 72 hours
    slow: number; // More than 72 hours
  };
  source: {
    [key: string]: number; // Source weights
  };
  courseInterest: {
    [key: string]: number; // Course interest weights
  };
  budget: {
    high: number; // High budget
    medium: number; // Medium budget
    low: number; // Low budget
  };
}

// Default scoring configuration
export const DEFAULT_SCORING_CONFIG: LeadScoringConfig = {
  formType: {
    admission: 25,
    inquiry: 20,
    application: 30,
    registration: 35,
    scholarship: 15,
    default: 10,
  },
  fieldCompleteness: {
    required: 20,
    optional: 10,
  },
  responseTime: {
    immediate: 25,
    fast: 20,
    lead: 15,
    slow: 5,
  },
  source: {
    website: 15,
    google_ads: 20,
    facebook_ads: 18,
    referral: 25,
    walk_in: 30,
    phone: 20,
    email: 15,
    social_media: 12,
    default: 10,
  },
  courseInterest: {
    engineering: 20,
    medicine: 25,
    management: 18,
    arts: 12,
    science: 15,
    commerce: 10,
    default: 8,
  },
  budget: {
    high: 25,
    medium: 15,
    low: 5,
  },
};

// Lead scoring data interface
export interface LeadScoringData {
  formType: string;
  formData: Record<string, any>;
  submissionTime: Date;
  source: string;
  courseInterest?: string;
  budget?: string;
  responseTime?: number; // in minutes
}

// Lead scoring result
export interface LeadScoringResult {
  score: number;
  maxScore: number;
  percentage: number;
  breakdown: {
    formType: number;
    completeness: number;
    responseTime: number;
    source: number;
    courseInterest: number;
    budget: number;
  };
  factors: string[];
  recommendations: string[];
}

// Lead scoring service
export class LeadScoringService {
  private config: LeadScoringConfig;

  constructor(config: LeadScoringConfig = DEFAULT_SCORING_CONFIG) {
    this.config = config;
  }

  /**
   * Calculate lead score based on various factors
   */
  calculateScore(data: LeadScoringData): LeadScoringResult {
    const breakdown = {
      formType: this.calculateFormTypeScore(data.formType),
      completeness: this.calculateCompletenessScore(data.formData),
      responseTime: this.calculateResponseTimeScore(data.responseTime),
      source: this.calculateSourceScore(data.source),
      courseInterest: this.calculateCourseInterestScore(data.courseInterest),
      budget: this.calculateBudgetScore(data.budget),
    };

    const totalScore = Object.values(breakdown).reduce(
      (sum, score) => sum + score,
      0
    );
    const maxScore = this.calculateMaxScore();
    const percentage = Math.round((totalScore / maxScore) * 100);

    const factors = this.identifyScoringFactors(breakdown, data);
    const recommendations = this.generateRecommendations(breakdown, data);

    return {
      score: totalScore,
      maxScore,
      percentage,
      breakdown,
      factors,
      recommendations,
    };
  }

  /**
   * Calculate form type score
   */
  private calculateFormTypeScore(formType: string): number {
    const normalizedType = formType.toLowerCase().replace(/[_\s-]/g, "");

    for (const [type, score] of Object.entries(this.config.formType)) {
      if (
        normalizedType.includes(type.toLowerCase()) ||
        type.toLowerCase().includes(normalizedType)
      ) {
        return score;
      }
    }

    return this.config.formType.default || 10;
  }

  /**
   * Calculate completeness score
   */
  private calculateCompletenessScore(formData: Record<string, any>): number {
    const requiredFields = ["name", "email", "phone"];
    const optionalFields = [
      "course",
      "qualification",
      "address",
      "city",
      "state",
      "pincode",
      "dateOfBirth",
      "gender",
      "parentName",
      "parentPhone",
      "parentEmail",
      "source",
      "interest",
      "budget",
      "experience",
      "notes",
    ];

    let score = 0;

    // Check required fields
    for (const field of requiredFields) {
      if (formData[field] && formData[field].toString().trim() !== "") {
        score += this.config.fieldCompleteness.required;
      }
    }

    // Check optional fields
    for (const field of optionalFields) {
      if (formData[field] && formData[field].toString().trim() !== "") {
        score += this.config.fieldCompleteness.optional;
      }
    }

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Calculate response time score
   */
  private calculateResponseTimeScore(responseTime?: number): number {
    if (!responseTime) {
      return this.config.responseTime.normal;
    }

    const hours = responseTime / 60;

    if (hours <= 1) {
      return this.config.responseTime.immediate;
    } else if (hours <= 24) {
      return this.config.responseTime.fast;
    } else if (hours <= 72) {
      return this.config.responseTime.normal;
    } else {
      return this.config.responseTime.slow;
    }
  }

  /**
   * Calculate source score
   */
  private calculateSourceScore(source: string): number {
    const normalizedSource = source.toLowerCase().replace(/[_\s-]/g, "");

    for (const [sourceType, score] of Object.entries(this.config.source)) {
      if (
        normalizedSource.includes(sourceType.toLowerCase()) ||
        sourceType.toLowerCase().includes(normalizedSource)
      ) {
        return score;
      }
    }

    return this.config.source.default || 10;
  }

  /**
   * Calculate course interest score
   */
  private calculateCourseInterestScore(courseInterest?: string): number {
    if (!courseInterest) {
      return 0;
    }

    const normalizedInterest = courseInterest
      .toLowerCase()
      .replace(/[_\s-]/g, "");

    for (const [course, score] of Object.entries(this.config.courseInterest)) {
      if (
        normalizedInterest.includes(course.toLowerCase()) ||
        course.toLowerCase().includes(normalizedInterest)
      ) {
        return score;
      }
    }

    return this.config.courseInterest.default || 8;
  }

  /**
   * Calculate budget score
   */
  private calculateBudgetScore(budget?: string): number {
    if (!budget) {
      return 0;
    }

    const normalizedBudget = budget.toLowerCase();

    if (
      normalizedBudget.includes("high") ||
      normalizedBudget.includes("premium") ||
      normalizedBudget.includes("expensive")
    ) {
      return this.config.budget.high;
    } else if (
      normalizedBudget.includes("medium") ||
      normalizedBudget.includes("moderate") ||
      normalizedBudget.includes("average")
    ) {
      return this.config.budget.medium;
    } else if (
      normalizedBudget.includes("low") ||
      normalizedBudget.includes("budget") ||
      normalizedBudget.includes("affordable")
    ) {
      return this.config.budget.low;
    }

    return 0;
  }

  /**
   * Calculate maximum possible score
   */
  private calculateMaxScore(): number {
    const maxFormType = Math.max(...Object.values(this.config.formType));
    const maxCompleteness =
      3 * this.config.fieldCompleteness.required +
      16 * this.config.fieldCompleteness.optional;
    const maxResponseTime = Math.max(
      ...Object.values(this.config.responseTime)
    );
    const maxSource = Math.max(...Object.values(this.config.source));
    const maxCourseInterest = Math.max(
      ...Object.values(this.config.courseInterest)
    );
    const maxBudget = Math.max(...Object.values(this.config.budget));

    return (
      maxFormType +
      maxCompleteness +
      maxResponseTime +
      maxSource +
      maxCourseInterest +
      maxBudget
    );
  }

  /**
   * Identify scoring factors
   */
  private identifyScoringFactors(
    breakdown: any,
    data: LeadScoringData
  ): string[] {
    const factors: string[] = [];

    if (breakdown.formType > 20) {
      factors.push(`High-value form type: ${data.formType}`);
    }

    if (breakdown.completeness > 50) {
      factors.push("Complete form submission");
    }

    if (breakdown.responseTime > 20) {
      factors.push("Quick response time");
    }

    if (breakdown.source > 20) {
      factors.push(`High-quality source: ${data.source}`);
    }

    if (breakdown.courseInterest > 15) {
      factors.push(`High-demand course: ${data.courseInterest}`);
    }

    if (breakdown.budget > 20) {
      factors.push("High budget capacity");
    }

    return factors;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    breakdown: any,
    data: LeadScoringData
  ): string[] {
    const recommendations: string[] = [];

    if (breakdown.completeness < 30) {
      recommendations.push("Follow up to collect missing information");
    }

    if (breakdown.responseTime > 20) {
      recommendations.push("Prioritize immediate contact - high engagement");
    }

    if (breakdown.source > 20) {
      recommendations.push(
        "High-quality lead - assign to experienced telecaller"
      );
    }

    if (breakdown.courseInterest > 15) {
      recommendations.push("Course-specific follow-up strategy");
    }

    if (breakdown.budget > 20) {
      recommendations.push("Premium service offering");
    }

    if (data.formType === "admission" || data.formType === "application") {
      recommendations.push("Admission-focused follow-up");
    }

    return recommendations;
  }

  /**
   * Update scoring configuration
   */
  updateConfig(newConfig: Partial<LeadScoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): LeadScoringConfig {
    return { ...this.config };
  }
}

// Lead scoring validation schema
export const leadScoringDataSchema = z.object({
  formType: z.string().min(1, "Form type is required"),
  formData: z.record(z.any()),
  submissionTime: z.date(),
  source: z.string().min(1, "Source is required"),
  courseInterest: z.string().optional(),
  budget: z.string().optional(),
  responseTime: z.number().optional(),
});

export type LeadScoringDataInput = z.infer<typeof leadScoringDataSchema>;

// Export default instance
export const leadScoringService = new LeadScoringService();
