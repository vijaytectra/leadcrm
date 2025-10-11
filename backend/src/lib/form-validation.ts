import {
  FormField,
  FieldValidation,
  FormSubmissionValue,
  FormBuilderError,
  FormBuilderErrorCode,
  FieldType,
} from "../types/form-builder";

export class FormValidationService {
  /**
   * Validate form submission data against form fields
   * @param fields - Array of form fields with validation rules
   * @param data - Form submission data
   * @returns Validation result with errors if any
   */
  static validateFormData(
    fields: FormField[],
    data: Record<string, FormSubmissionValue>
  ): { isValid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const fieldMap = new Map(fields.map((field) => [field.id, field]));

    for (const field of fields) {
      const value = data[field.id];
      const fieldErrors = this.validateField(field, value, data);

      if (fieldErrors.length > 0) {
        errors.push(...fieldErrors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate a single field
   * @param field - Form field configuration
   * @param value - Field value to validate
   * @param allData - All form data for cross-field validation
   * @returns Array of validation errors
   */
  static validateField(
    field: FormField,
    value: FormSubmissionValue,
    allData: Record<string, FormSubmissionValue>
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required field validation
    if (field.required && this.isEmpty(value)) {
      errors.push({
        fieldId: field.id,
        fieldLabel: field.label,
        type: "required",
        message: field.validation?.errorMessage || `${field.label} is required`,
      });
      return errors; // Don't validate other rules if required field is empty
    }

    // Skip validation if field is empty and not required
    if (this.isEmpty(value)) {
      return errors;
    }

    // Type-specific validation
    const typeErrors = this.validateFieldType(field, value);
    errors.push(...typeErrors);

    // Custom validation rules
    if (field.validation) {
      const customErrors = this.validateCustomRules(field, value, allData);
      errors.push(...customErrors);
    }

    return errors;
  }

  /**
   * Validate field based on its type
   * @param field - Form field configuration
   * @param value - Field value to validate
   * @returns Array of validation errors
   */
  private static validateFieldType(
    field: FormField,
    value: FormSubmissionValue
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    switch (field.type) {
      case "email":
        if (!this.isValidEmail(String(value))) {
          errors.push({
            fieldId: field.id,
            fieldLabel: field.label,
            type: "email",
            message: "Please enter a valid email address",
          });
        }
        break;

      case "phone":
        if (!this.isValidPhone(String(value))) {
          errors.push({
            fieldId: field.id,
            fieldLabel: field.label,
            type: "phone",
            message: "Please enter a valid phone number",
          });
        }
        break;

      case "number":
        if (!this.isValidNumber(value)) {
          errors.push({
            fieldId: field.id,
            fieldLabel: field.label,
            type: "number",
            message: "Please enter a valid number",
          });
        } else {
          const numValue = Number(value);
          const validation = field.validation;

          if (validation?.min !== undefined && numValue < validation.min) {
            errors.push({
              fieldId: field.id,
              fieldLabel: field.label,
              type: "min",
              message: `Value must be at least ${validation.min}`,
            });
          }

          if (validation?.max !== undefined && numValue > validation.max) {
            errors.push({
              fieldId: field.id,
              fieldLabel: field.label,
              type: "max",
              message: `Value must be at most ${validation.max}`,
            });
          }
        }
        break;

      case "url":
        if (!this.isValidUrl(String(value))) {
          errors.push({
            fieldId: field.id,
            fieldLabel: field.label,
            type: "url",
            message: "Please enter a valid URL",
          });
        }
        break;

      case "date":
        if (!this.isValidDate(String(value))) {
          errors.push({
            fieldId: field.id,
            fieldLabel: field.label,
            type: "date",
            message: "Please enter a valid date",
          });
        }
        break;

      case "file":
        if (!this.isValidFile(value, field.options)) {
          errors.push({
            fieldId: field.id,
            fieldLabel: field.label,
            type: "file",
            message: "Please upload a valid file",
          });
        }
        break;

      case "select":
      case "radio":
        if (!this.isValidSelectOption(value, field.options)) {
          errors.push({
            fieldId: field.id,
            fieldLabel: field.label,
            type: "select",
            message: "Please select a valid option",
          });
        }
        break;

      case "multiselect":
      case "checkbox":
        if (!this.isValidMultiSelect(value, field.options)) {
          errors.push({
            fieldId: field.id,
            fieldLabel: field.label,
            type: "multiselect",
            message: "Please select valid options",
          });
        }
        break;
    }

    return errors;
  }

  /**
   * Validate custom validation rules
   * @param field - Form field configuration
   * @param value - Field value to validate
   * @param allData - All form data for cross-field validation
   * @returns Array of validation errors
   */
  private static validateCustomRules(
    field: FormField,
    value: FormSubmissionValue,
    allData: Record<string, FormSubmissionValue>
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const validation = field.validation;

    if (!validation) return errors;

    // Length validation for text fields
    if (typeof value === "string") {
      if (validation.minLength && value.length < validation.minLength) {
        errors.push({
          fieldId: field.id,
          fieldLabel: field.label,
          type: "minLength",
          message: `Must be at least ${validation.minLength} characters`,
        });
      }

      if (validation.maxLength && value.length > validation.maxLength) {
        errors.push({
          fieldId: field.id,
          fieldLabel: field.label,
          type: "maxLength",
          message: `Must be no more than ${validation.maxLength} characters`,
        });
      }

      // Pattern validation
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          errors.push({
            fieldId: field.id,
            fieldLabel: field.label,
            type: "pattern",
            message: validation.errorMessage || "Invalid format",
          });
        }
      }
    }

    // Custom validation function
    if (validation.customValidation) {
      try {
        const customFunction = new Function(
          "value",
          "allData",
          validation.customValidation
        );
        const isValid = customFunction(value, allData);

        if (!isValid) {
          errors.push({
            fieldId: field.id,
            fieldLabel: field.label,
            type: "custom",
            message: validation.errorMessage || "Invalid value",
          });
        }
      } catch (error) {
        console.error("Custom validation function error:", error);
        errors.push({
          fieldId: field.id,
          fieldLabel: field.label,
          type: "custom",
          message: "Validation error occurred",
        });
      }
    }

    return errors;
  }

  // Validation helper methods
  private static isEmpty(value: FormSubmissionValue): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "boolean") return false;
    return false;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhone(phone: string): boolean {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");
    // Check if it's a valid phone number (7-15 digits)
    return cleaned.length >= 7 && cleaned.length <= 15;
  }

  private static isValidNumber(value: FormSubmissionValue): boolean {
    if (typeof value === "number") return !isNaN(value);
    if (typeof value === "string") return !isNaN(Number(value));
    return false;
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  private static isValidFile(
    value: FormSubmissionValue,
    options?: any
  ): boolean {
    if (!Array.isArray(value)) return false;

    // Check file count limit
    if (options?.maxFiles && value.length > options.maxFiles) {
      return false;
    }

    // Check file size limit
    if (options?.maxFileSize) {
      for (const file of value) {
        if (typeof file === "object" && file !== null && "fileSize" in file) {
          if ((file as any).fileSize > options.maxFileSize) {
            return false;
          }
        }
      }
    }

    // Check allowed file types
    if (options?.allowedTypes && options.allowedTypes.length > 0) {
      for (const file of value) {
        if (typeof file === "object" && file !== null && "fileType" in file) {
          if (!options.allowedTypes.includes((file as any).fileType)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private static isValidSelectOption(
    value: FormSubmissionValue,
    options?: any
  ): boolean {
    if (!options?.choices) return true;

    const validValues = options.choices.map((choice: any) => choice.value);
    return validValues.includes(value);
  }

  private static isValidMultiSelect(
    value: FormSubmissionValue,
    options?: any
  ): boolean {
    if (!Array.isArray(value)) return false;
    if (!options?.choices) return true;

    const validValues = options.choices.map((choice: any) => choice.value);
    return value.every((v) => validValues.includes(v));
  }

  /**
   * Sanitize form data to prevent XSS attacks
   * @param data - Form submission data
   * @returns Sanitized data
   */
  static sanitizeFormData(
    data: Record<string, FormSubmissionValue>
  ): Record<string, FormSubmissionValue> {
    const sanitized: Record<string, FormSubmissionValue> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        // Basic XSS prevention - remove script tags and dangerous attributes
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+\s*=/gi, "");
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Validate form configuration
   * @param fields - Array of form fields
   * @returns Validation result with errors if any
   */
  static validateFormConfiguration(fields: FormField[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check for duplicate field IDs
    const fieldIds = fields.map((field) => field.id);
    const duplicateIds = fieldIds.filter(
      (id, index) => fieldIds.indexOf(id) !== index
    );
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate field IDs found: ${duplicateIds.join(", ")}`);
    }

    // Check for duplicate field orders
    const orders = fields.map((field) => field.order);
    const duplicateOrders = orders.filter(
      (order, index) => orders.indexOf(order) !== index
    );
    if (duplicateOrders.length > 0) {
      errors.push(
        `Duplicate field orders found: ${duplicateOrders.join(", ")}`
      );
    }

    // Validate each field
    for (const field of fields) {
      const fieldErrors = this.validateFieldConfiguration(field);
      errors.push(...fieldErrors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate individual field configuration
   * @param field - Form field to validate
   * @returns Array of validation errors
   */
  private static validateFieldConfiguration(field: FormField): string[] {
    const errors: string[] = [];

    // Required fields
    if (!field.id)
      errors.push(`Field ${field.id || "unknown"}: ID is required`);
    if (!field.type) errors.push(`Field ${field.id}: Type is required`);
    if (!field.label) errors.push(`Field ${field.id}: Label is required`);
    if (field.order < 0)
      errors.push(`Field ${field.id}: Order must be non-negative`);

    // Type-specific validation
    if (["select", "radio", "multiselect", "checkbox"].includes(field.type)) {
      if (!field.options?.choices || field.options.choices.length === 0) {
        errors.push(
          `Field ${field.id}: Choices are required for ${field.type} fields`
        );
      }
    }

    // Validation rules
    if (field.validation) {
      const validation = field.validation;

      if (
        validation.minLength &&
        validation.maxLength &&
        validation.minLength > validation.maxLength
      ) {
        errors.push(
          `Field ${field.id}: minLength cannot be greater than maxLength`
        );
      }

      if (validation.min && validation.max && validation.min > validation.max) {
        errors.push(`Field ${field.id}: min cannot be greater than max`);
      }
    }

    return errors;
  }
}

// Validation error interface
export interface ValidationError {
  fieldId: string;
  fieldLabel: string;
  type: string;
  message: string;
}

export const formValidationService = new FormValidationService();
