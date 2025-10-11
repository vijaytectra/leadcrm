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
