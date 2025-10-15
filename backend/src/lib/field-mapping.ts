import { z } from "zod";

// Field mapping configuration
export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: (value: any) => any;
  required?: boolean;
}

// Common field name patterns for mapping
export const COMMON_FIELD_PATTERNS = {
  // Name fields
  name: [
    "name",
    "full_name",
    "fullname",
    "fullName",
    "student_name",
    "studentName",
    "applicant_name",
    "applicantName",
    "candidate_name",
    "first_name",
    "firstName",
    "last_name",
    "lastName",
  ],

  // Email fields
  email: [
    "email",
    "email_address",
    "emailAddress",
    "student_email",
    "studentEmail",
    "applicant_email",
    "applicantEmail",
    "contact_email",
    "contactEmail",
    "primary_email",
    "primaryEmail",
  ],

  // Phone fields
  phone: [
    "phone",
    "phone_number",
    "phoneNumber",
    "mobile",
    "mobile_number",
    "mobileNumber",
    "contact_number",
    "contactNumber",
    "telephone",
    "student_phone",
    "studentPhone",
    "applicant_phone",
    "applicantPhone",
  ],

  // Course fields
  course: [
    "course",
    "course_name",
    "courseName",
    "program",
    "program_name",
    "programName",
    "degree",
    "degree_name",
    "degreeName",
    "stream",
    "specialization",
    "field_of_study",
    "fieldOfStudy",
  ],

  // Qualification fields
  qualification: [
    "qualification",
    "education",
    "educational_background",
    "educationalBackground",
    "highest_qualification",
    "highestQualification",
    "degree_held",
    "degreeHeld",
    "academic_qualification",
    "academicQualification",
  ],

  // Address fields
  address: [
    "address",
    "full_address",
    "fullAddress",
    "permanent_address",
    "permanentAddress",
    "residential_address",
    "residentialAddress",
    "home_address",
    "homeAddress",
    "current_address",
    "currentAddress",
  ],

  // City fields
  city: [
    "city",
    "location",
    "residence_city",
    "residenceCity",
    "current_city",
    "currentCity",
    "hometown",
    "home_town",
    "homeTown",
  ],

  // State fields
  state: [
    "state",
    "province",
    "region",
    "residence_state",
    "residenceState",
    "current_state",
    "currentState",
  ],

  // Pincode fields
  pincode: [
    "pincode",
    "pin_code",
    "pinCode",
    "postal_code",
    "postalCode",
    "zip_code",
    "zipCode",
    "zip",
  ],

  // Date of birth fields
  dateOfBirth: [
    "date_of_birth",
    "dateOfBirth",
    "dob",
    "birth_date",
    "birthDate",
    "birthday",
    "birth_day",
    "birthDay",
  ],

  // Gender fields
  gender: ["gender", "sex", "title", "salutation"],

  // Parent fields
  parentName: [
    "parent_name",
    "parentName",
    "father_name",
    "fatherName",
    "mother_name",
    "motherName",
    "guardian_name",
    "guardianName",
    "emergency_contact",
    "emergencyContact",
  ],

  parentPhone: [
    "parent_phone",
    "parentPhone",
    "father_phone",
    "fatherPhone",
    "mother_phone",
    "motherPhone",
    "guardian_phone",
    "guardianPhone",
    "emergency_phone",
    "emergencyPhone",
  ],

  parentEmail: [
    "parent_email",
    "parentEmail",
    "father_email",
    "fatherEmail",
    "mother_email",
    "motherEmail",
    "guardian_email",
    "guardianEmail",
    "emergency_email",
    "emergencyEmail",
  ],

  // Source fields
  source: [
    "source",
    "lead_source",
    "leadSource",
    "referral_source",
    "referralSource",
    "how_did_you_hear",
    "howDidYouHear",
    "marketing_source",
    "marketingSource",
    "utm_source",
    "utmSource",
    "campaign",
    "medium",
  ],

  // Interest fields
  interest: [
    "interest",
    "area_of_interest",
    "areaOfInterest",
    "preferred_course",
    "preferredCourse",
    "course_interest",
    "courseInterest",
    "program_interest",
    "programInterest",
  ],

  // Budget fields
  budget: [
    "budget",
    "budget_range",
    "budgetRange",
    "fee_budget",
    "feeBudget",
    "affordability",
    "financial_capacity",
    "financialCapacity",
  ],

  // Experience fields
  experience: [
    "experience",
    "work_experience",
    "workExperience",
    "professional_experience",
    "professionalExperience",
    "years_of_experience",
    "yearsOfExperience",
  ],

  // Notes fields
  notes: [
    "notes",
    "comments",
    "remarks",
    "additional_info",
    "additionalInfo",
    "message",
    "feedback",
    "requirements",
    "special_requirements",
    "specialRequirements",
  ],
};

// Field mapping service
export class FieldMappingService {
  /**
   * Map form data to standardized lead fields
   */
  static mapFormDataToLead(formData: Record<string, any>): {
    mappedData: Record<string, any>;
    unmappedFields: Record<string, any>;
    mappingLog: string[];
  } {
    const mappedData: Record<string, any> = {};
    const unmappedFields: Record<string, any> = { ...formData };
    const mappingLog: string[] = [];

    // Process each field in the form data
    for (const [fieldName, fieldValue] of Object.entries(formData)) {
      if (
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === ""
      ) {
        continue; // Skip empty values
      }

      const mappedField = this.findMappedField(fieldName);
      if (mappedField) {
        mappedData[mappedField] = this.transformValue(fieldValue, mappedField);
        delete unmappedFields[fieldName];
        mappingLog.push(`"${fieldName}" -> "${mappedField}"`);
      }
    }

    return { mappedData, unmappedFields, mappingLog };
  }

  /**
   * Find the mapped field for a given source field name
   */
  private static findMappedField(sourceField: string): string | null {
    const normalizedField = sourceField.toLowerCase().replace(/[_\s-]/g, "");

    // Check each pattern category
    for (const [targetField, patterns] of Object.entries(
      COMMON_FIELD_PATTERNS
    )) {
      for (const pattern of patterns) {
        const normalizedPattern = pattern.toLowerCase().replace(/[_\s-]/g, "");
        if (
          normalizedField === normalizedPattern ||
          normalizedField.includes(normalizedPattern) ||
          normalizedPattern.includes(normalizedField)
        ) {
          return targetField;
        }
      }
    }

    return null;
  }

  /**
   * Transform field value based on target field type
   */
  private static transformValue(value: any, targetField: string): any {
    switch (targetField) {
      case "email":
        return this.normalizeEmail(value);
      case "phone":
        return this.normalizePhone(value);
      case "dateOfBirth":
        return this.normalizeDate(value);
      case "pincode":
        return this.normalizePincode(value);
      case "name":
        return this.normalizeName(value);
      default:
        return value;
    }
  }

  /**
   * Normalize email address
   */
  private static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Normalize phone number
   */
  private static normalizePhone(phone: string): string {
    // Remove all non-digit characters except +
    let normalized = phone.replace(/[^\d+]/g, "");

    // Add country code if missing (assuming India +91)
    if (normalized.length === 10 && !normalized.startsWith("+")) {
      normalized = "+91" + normalized;
    } else if (normalized.length === 12 && normalized.startsWith("91")) {
      normalized = "+" + normalized;
    }

    return normalized;
  }

  /**
   * Normalize date
   */
  private static normalizeDate(date: any): string {
    if (date instanceof Date) {
      return date.toISOString().split("T")[0];
    }

    if (typeof date === "string") {
      // Try to parse the date
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split("T")[0];
      }
    }

    return String(date);
  }

  /**
   * Normalize pincode
   */
  private static normalizePincode(pincode: any): string {
    return String(pincode).replace(/\D/g, "").slice(0, 6);
  }

  /**
   * Normalize name
   */
  private static normalizeName(name: string): string {
    return name.trim().replace(/\s+/g, " ");
  }

  /**
   * Extract lead source from form data
   */
  static extractLeadSource(formData: Record<string, any>): string {
    const sourceFields = [
      "source",
      "lead_source",
      "referral_source",
      "utm_source",
      "campaign",
    ];

    for (const field of sourceFields) {
      if (formData[field]) {
        return String(formData[field]);
      }
    }

    return "Website Form";
  }

  /**
   * Extract course interest from form data
   */
  static extractCourseInterest(formData: Record<string, any>): string | null {
    const interestFields = [
      "course",
      "program",
      "interest",
      "area_of_interest",
      "preferred_course",
    ];

    for (const field of interestFields) {
      if (formData[field]) {
        return String(formData[field]);
      }
    }

    return null;
  }

  /**
   * Validate mapped data completeness
   */
  static validateMappedData(mappedData: Record<string, any>): {
    isValid: boolean;
    missingFields: string[];
    score: number;
  } {
    const requiredFields = ["name", "email", "phone"];
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!mappedData[field] || mappedData[field].toString().trim() === "") {
        missingFields.push(field);
      }
    }

    const completenessScore =
      ((requiredFields.length - missingFields.length) / requiredFields.length) *
      100;

    return {
      isValid: missingFields.length === 0,
      missingFields,
      score: Math.round(completenessScore),
    };
  }

  /**
   * Generate field mapping suggestions
   */
  static generateMappingSuggestions(formData: Record<string, any>): {
    suggestions: Array<{
      sourceField: string;
      suggestedTarget: string;
      confidence: number;
      reason: string;
    }>;
  } {
    const suggestions: Array<{
      sourceField: string;
      suggestedTarget: string;
      confidence: number;
      reason: string;
    }> = [];

    for (const [fieldName, fieldValue] of Object.entries(formData)) {
      if (
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === ""
      ) {
        continue;
      }

      const suggestion = this.suggestFieldMapping(fieldName, fieldValue);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    return { suggestions };
  }

  /**
   * Suggest field mapping for a given field
   */
  private static suggestFieldMapping(
    fieldName: string,
    fieldValue: any
  ): {
    sourceField: string;
    suggestedTarget: string;
    confidence: number;
    reason: string;
  } | null {
    const normalizedField = fieldName.toLowerCase().replace(/[_\s-]/g, "");

    // Check for exact matches
    for (const [targetField, patterns] of Object.entries(
      COMMON_FIELD_PATTERNS
    )) {
      for (const pattern of patterns) {
        const normalizedPattern = pattern.toLowerCase().replace(/[_\s-]/g, "");
        if (normalizedField === normalizedPattern) {
          return {
            sourceField: fieldName,
            suggestedTarget: targetField,
            confidence: 100,
            reason: `Exact match with pattern: ${pattern}`,
          };
        }
      }
    }

    // Check for partial matches
    for (const [targetField, patterns] of Object.entries(
      COMMON_FIELD_PATTERNS
    )) {
      for (const pattern of patterns) {
        const normalizedPattern = pattern.toLowerCase().replace(/[_\s-]/g, "");
        if (
          normalizedField.includes(normalizedPattern) ||
          normalizedPattern.includes(normalizedField)
        ) {
          return {
            sourceField: fieldName,
            suggestedTarget: targetField,
            confidence: 80,
            reason: `Partial match with pattern: ${pattern}`,
          };
        }
      }
    }

    // Check for semantic matches based on value type
    if (typeof fieldValue === "string") {
      if (fieldValue.includes("@") && fieldValue.includes(".")) {
        return {
          sourceField: fieldName,
          suggestedTarget: "email",
          confidence: 70,
          reason: "Contains email-like format",
        };
      }

      if (/^\d{10}$/.test(fieldValue.replace(/\D/g, ""))) {
        return {
          sourceField: fieldName,
          suggestedTarget: "phone",
          confidence: 70,
          reason: "Contains 10-digit number (likely phone)",
        };
      }
    }

    return null;
  }
}

// Validation schema for mapped lead data
export const mappedLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format").optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional(),
  course: z.string().optional(),
  qualification: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  parentEmail: z.string().email().optional(),
  source: z.string().optional(),
  interest: z.string().optional(),
  budget: z.string().optional(),
  experience: z.string().optional(),
  notes: z.string().optional(),
});

export type MappedLeadData = z.infer<typeof mappedLeadSchema>;
