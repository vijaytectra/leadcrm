import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { formBuilderService } from "../lib/form-builder";
import { formValidationService } from "../lib/form-validation";
import { conditionalLogicEngine } from "../lib/conditional-logic";
import { prisma } from "../lib/prisma";
import {
  CreateFormRequest,
  CreateFieldRequest,
  FormField,
  FieldType,
} from "../types/form-builder";

describe("Form Builder System", () => {
  const testTenantId = "test-tenant-123";
  const testFormData: CreateFormRequest = {
    title: "Test Form",
    description: "A test form for validation",
    requiresPayment: false,
    allowMultipleSubmissions: true,
    maxSubmissions: 100,
  };

  beforeEach(async () => {
    // Clean up test data
    await prisma.formSubmission.deleteMany();
    await prisma.formField.deleteMany();
    await prisma.form.deleteMany();
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.formSubmission.deleteMany();
    await prisma.formField.deleteMany();
    await prisma.form.deleteMany();
  });

  describe("Form Management", () => {
    it("should create a new form", async () => {
      const form = await formBuilderService.createForm(
        testTenantId,
        testFormData
      );

      expect(form).toBeDefined();
      expect(form.title).toBe(testFormData.title);
      expect(form.tenantId).toBe(testTenantId);
      expect(form.isActive).toBe(true);
    });

    it("should get a form by ID", async () => {
      const createdForm = await formBuilderService.createForm(
        testTenantId,
        testFormData
      );
      const retrievedForm = await formBuilderService.getForm(
        createdForm.id,
        testTenantId
      );

      expect(retrievedForm.id).toBe(createdForm.id);
      expect(retrievedForm.title).toBe(createdForm.title);
    });

    it("should update a form", async () => {
      const createdForm = await formBuilderService.createForm(
        testTenantId,
        testFormData
      );
      const updatedForm = await formBuilderService.updateForm(
        createdForm.id,
        testTenantId,
        {
          title: "Updated Form Title",
          isActive: false,
        }
      );

      expect(updatedForm.title).toBe("Updated Form Title");
      expect(updatedForm.isActive).toBe(false);
    });

    it("should delete a form", async () => {
      const createdForm = await formBuilderService.createForm(
        testTenantId,
        testFormData
      );
      await formBuilderService.deleteForm(createdForm.id, testTenantId);

      await expect(
        formBuilderService.getForm(createdForm.id, testTenantId)
      ).rejects.toThrow();
    });

    it("should list forms with pagination", async () => {
      // Create multiple forms
      await formBuilderService.createForm(testTenantId, {
        ...testFormData,
        title: "Form 1",
      });
      await formBuilderService.createForm(testTenantId, {
        ...testFormData,
        title: "Form 2",
      });
      await formBuilderService.createForm(testTenantId, {
        ...testFormData,
        title: "Form 3",
      });

      const result = await formBuilderService.listForms(testTenantId, 1, 2);

      expect(result.forms).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.hasMore).toBe(true);
    });
  });

  describe("Field Management", () => {
    let formId: string;

    beforeEach(async () => {
      const form = await formBuilderService.createForm(
        testTenantId,
        testFormData
      );
      formId = form.id;
    });

    it("should create a text field", async () => {
      const fieldData: CreateFieldRequest = {
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        order: 1,
        width: "full",
        validation: {
          required: true,
          minLength: 2,
          maxLength: 100,
          errorMessage: "Name must be between 2 and 100 characters",
        },
      };

      const field = await formBuilderService.createField(
        formId,
        testTenantId,
        fieldData
      );

      expect(field).toBeDefined();
      expect(field.type).toBe("text");
      expect(field.label).toBe("Full Name");
      expect(field.required).toBe(true);
    });

    it("should create an email field with validation", async () => {
      const fieldData: CreateFieldRequest = {
        type: "email",
        label: "Email Address",
        required: true,
        order: 2,
        width: "full",
      };

      const field = await formBuilderService.createField(
        formId,
        testTenantId,
        fieldData
      );

      expect(field.type).toBe("email");
      expect(field.required).toBe(true);
    });

    it("should create a select field with options", async () => {
      const fieldData: CreateFieldRequest = {
        type: "select",
        label: "Country",
        required: true,
        order: 3,
        width: "half",
        options: {
          choices: [
            { id: "1", label: "India", value: "india" },
            { id: "2", label: "USA", value: "usa" },
            { id: "3", label: "UK", value: "uk" },
          ],
        },
      };

      const field = await formBuilderService.createField(
        formId,
        testTenantId,
        fieldData
      );

      expect(field.type).toBe("select");
      expect(field.options?.choices).toHaveLength(3);
    });

    it("should update a field", async () => {
      const field = await formBuilderService.createField(formId, testTenantId, {
        type: "text",
        label: "Original Label",
        required: false,
        order: 1,
      });

      const updatedField = await formBuilderService.updateField(
        field.id,
        formId,
        testTenantId,
        {
          label: "Updated Label",
          required: true,
        }
      );

      expect(updatedField.label).toBe("Updated Label");
      expect(updatedField.required).toBe(true);
    });

    it("should delete a field", async () => {
      const field = await formBuilderService.createField(formId, testTenantId, {
        type: "text",
        label: "Test Field",
        required: false,
        order: 1,
      });

      await formBuilderService.deleteField(field.id, formId, testTenantId);

      const fields = await formBuilderService.getFormFields(
        formId,
        testTenantId
      );
      expect(fields).toHaveLength(0);
    });
  });

  describe("Form Validation", () => {
    it("should validate required fields", () => {
      const fields: FormField[] = [
        {
          id: "field1",
          formId: "form1",
          type: "text",
          label: "Name",
          required: true,
          order: 1,
          width: "full",
          validation: { required: true },
          conditionalLogic: { enabled: false, conditions: [], actions: [] },
          options: {},
          styling: {},
          advanced: {},
        },
      ];

      const validData = { field1: "John Doe" };
      const invalidData = { field1: "" };

      const validResult = formValidationService.validateFormData(
        fields,
        validData
      );
      const invalidResult = formValidationService.validateFormData(
        fields,
        invalidData
      );

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toHaveLength(1);
      expect(invalidResult.errors[0].type).toBe("required");
    });

    it("should validate email format", () => {
      const fields: FormField[] = [
        {
          id: "email",
          formId: "form1",
          type: "email",
          label: "Email",
          required: true,
          order: 1,
          width: "full",
          validation: { required: true },
          conditionalLogic: { enabled: false, conditions: [], actions: [] },
          options: {},
          styling: {},
          advanced: {},
        },
      ];

      const validData = { email: "test@example.com" };
      const invalidData = { email: "invalid-email" };

      const validResult = formValidationService.validateFormData(
        fields,
        validData
      );
      const invalidResult = formValidationService.validateFormData(
        fields,
        invalidData
      );

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });

    it("should validate phone format", () => {
      const fields: FormField[] = [
        {
          id: "phone",
          formId: "form1",
          type: "phone",
          label: "Phone",
          required: true,
          order: 1,
          width: "full",
          validation: { required: true },
          conditionalLogic: { enabled: false, conditions: [], actions: [] },
          options: {},
          styling: {},
          advanced: {},
        },
      ];

      const validData = { phone: "1234567890" };
      const invalidData = { phone: "abc" };

      const validResult = formValidationService.validateFormData(
        fields,
        validData
      );
      const invalidResult = formValidationService.validateFormData(
        fields,
        invalidData
      );

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });
  });

  describe("Conditional Logic", () => {
    it("should evaluate simple conditions", () => {
      const formData = { student_type: "international" };
      const allFields: FormField[] = [
        {
          id: "student_type",
          formId: "form1",
          type: "select",
          label: "Student Type",
          required: true,
          order: 1,
          width: "full",
          validation: { required: true },
          conditionalLogic: { enabled: false, conditions: [], actions: [] },
          options: {},
          styling: {},
          advanced: {},
        },
      ];

      const logic = {
        enabled: true,
        conditions: [
          {
            id: "cond1",
            fieldId: "student_type",
            operator: "equals",
            value: "international",
            logic: "and",
          },
        ],
        actions: [],
      };

      const result = conditionalLogicEngine.evaluateConditions(
        logic,
        formData,
        allFields
      );
      expect(result).toBe(true);
    });

    it("should handle multiple conditions with AND logic", () => {
      const formData = {
        student_type: "international",
        age: 25,
      };
      const allFields: FormField[] = [
        {
          id: "student_type",
          formId: "form1",
          type: "select",
          label: "Student Type",
          required: true,
          order: 1,
          width: "full",
          validation: { required: true },
          conditionalLogic: { enabled: false, conditions: [], actions: [] },
          options: {},
          styling: {},
          advanced: {},
        },
        {
          id: "age",
          formId: "form1",
          type: "number",
          label: "Age",
          required: true,
          order: 2,
          width: "full",
          validation: { required: true },
          conditionalLogic: { enabled: false, conditions: [], actions: [] },
          options: {},
          styling: {},
          advanced: {},
        },
      ];

      const logic = {
        enabled: true,
        conditions: [
          {
            id: "cond1",
            fieldId: "student_type",
            operator: "equals",
            value: "international",
            logic: "and",
          },
          {
            id: "cond2",
            fieldId: "age",
            operator: "greater_than",
            value: 18,
            logic: "and",
          },
        ],
        actions: [],
      };

      const result = conditionalLogicEngine.evaluateConditions(
        logic,
        formData,
        allFields
      );
      expect(result).toBe(true);
    });

    it("should validate conditional logic configuration", () => {
      const allFields: FormField[] = [
        {
          id: "field1",
          formId: "form1",
          type: "text",
          label: "Field 1",
          required: true,
          order: 1,
          width: "full",
          validation: { required: true },
          conditionalLogic: { enabled: false, conditions: [], actions: [] },
          options: {},
          styling: {},
          advanced: {},
        },
      ];

      const validLogic = {
        enabled: true,
        conditions: [
          {
            id: "cond1",
            fieldId: "field1",
            operator: "equals",
            value: "test",
            logic: "and",
          },
        ],
        actions: [
          {
            id: "action1",
            type: "show",
            targetFieldId: "field1",
          },
        ],
      };

      const invalidLogic = {
        enabled: true,
        conditions: [
          {
            id: "cond1",
            fieldId: "nonexistent",
            operator: "equals",
            value: "test",
            logic: "and",
          },
        ],
        actions: [
          {
            id: "action1",
            type: "show",
            targetFieldId: "nonexistent",
          },
        ],
      };

      const validResult = conditionalLogicEngine.validateLogic(
        validLogic,
        allFields
      );
      const invalidResult = conditionalLogicEngine.validateLogic(
        invalidLogic,
        allFields
      );

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Form Submission", () => {
    let formId: string;

    beforeEach(async () => {
      const form = await formBuilderService.createForm(
        testTenantId,
        testFormData
      );
      formId = form.id;

      // Add a field to the form
      await formBuilderService.createField(formId, testTenantId, {
        type: "text",
        label: "Name",
        required: true,
        order: 1,
      });
    });

    it("should submit form with valid data", async () => {
      const submissionData = {
        data: { field1: "John Doe" },
        metadata: { source: "website" },
      };

      const submission = await formBuilderService.submitForm(
        formId,
        submissionData,
        {
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          sessionId: "test-session",
          deviceType: "desktop",
          browser: "Chrome",
          os: "Windows",
        }
      );

      expect(submission).toBeDefined();
      expect(submission.formId).toBe(formId);
      expect(submission.status).toBe("submitted");
    });

    it("should reject submission with missing required fields", async () => {
      const submissionData = {
        data: {},
        metadata: { source: "website" },
      };

      await expect(
        formBuilderService.submitForm(formId, submissionData, {
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          sessionId: "test-session",
          deviceType: "desktop",
          browser: "Chrome",
          os: "Windows",
        })
      ).rejects.toThrow();
    });

    it("should get form submissions", async () => {
      // Submit a form first
      await formBuilderService.submitForm(
        formId,
        {
          data: { field1: "John Doe" },
          metadata: { source: "website" },
        },
        {
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          sessionId: "test-session",
          deviceType: "desktop",
          browser: "Chrome",
          os: "Windows",
        }
      );

      const result = await formBuilderService.getFormSubmissions(
        formId,
        testTenantId
      );

      expect(result.submissions).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe("Data Sanitization", () => {
    it("should sanitize form data to prevent XSS", () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>John Doe',
        email: "test@example.com",
        message: 'Hello <img src=x onerror=alert("xss")>',
      };

      const sanitized = formValidationService.sanitizeFormData(maliciousData);

      expect(sanitized.name).not.toContain("<script>");
      expect(sanitized.name).not.toContain("alert");
      expect(sanitized.email).toBe("test@example.com");
      expect(sanitized.message).not.toContain("onerror");
    });
  });
});
