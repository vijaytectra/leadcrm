interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface UserCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  institutionName: string;
  loginUrl: string;
}

interface InstitutionCredentials {
  institutionName: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
  loginUrl: string;
  features: string[];
  supportEmail: string;
  supportPhone: string;
}

/**
 * Generate user credentials email template
 */
export function generateUserCredentialsEmail(
  credentials: UserCredentials
): EmailTemplate {
  const {
    email,
    password,
    firstName,
    lastName,
    role,
    institutionName,
    loginUrl,
  } = credentials;

  const roleDisplayName = getRoleDisplayName(role);

  const subject = `Welcome to ${institutionName} - Your Account Credentials`;

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${institutionName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { background: #e8f4fd; padding: 15px; border-radius: 6px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to ${institutionName}!</h1>
            <p>Your account has been created successfully</p>
        </div>
        
        <div class="content">
            <h2>Hello ${firstName} ${lastName},</h2>
            
            <p>Welcome to ${institutionName}! Your account has been created with the role of <strong>${roleDisplayName}</strong>.</p>
            
            <div class="credentials">
                <h3>Your Login Credentials:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p><strong>Role:</strong> ${roleDisplayName}</p>
            </div>
            
            <div class="highlight">
                <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
            </div>
            
            <p>You can now access your account using the following link:</p>
            <a href="${loginUrl}" class="button">Login to Your Account</a>
            
            <h3>What's Next?</h3>
            <ul>
                <li>Log in using your credentials above</li>
                <li>Complete your profile setup</li>
                <li>Explore the features available to your role</li>
                <li>Change your password for security</li>
            </ul>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>
            The ${institutionName} Team</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} ${institutionName}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

  const text = `
Welcome to ${institutionName}!

Hello ${firstName} ${lastName},

Your account has been created successfully with the role of ${roleDisplayName}.

Your Login Credentials:
Email: ${email}
Password: ${password}
Role: ${roleDisplayName}

Important: Please change your password after your first login for security purposes.

Login URL: ${loginUrl}

What's Next?
- Log in using your credentials above
- Complete your profile setup
- Explore the features available to your role
- Change your password for security

If you have any questions or need assistance, please don't hesitate to contact our support team.

Best regards,
The ${institutionName} Team

This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} ${institutionName}. All rights reserved.
`;

  return { subject, html, text };
}

/**
 * Generate institution credentials email template
 */
export function generateInstitutionCredentialsEmail(
  credentials: InstitutionCredentials
): EmailTemplate {
  const {
    institutionName,
    adminEmail,
    adminPassword,
    adminFirstName,
    adminLastName,
    loginUrl,
    features,
    supportEmail,
    supportPhone,
  } = credentials;

  const subject = `Welcome to LEAD101 - ${institutionName} Account Setup Complete`;

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to LEAD101 - ${institutionName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { background: #e8f4fd; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-item { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to LEAD101!</h1>
            <p>Your institution account has been set up successfully</p>
        </div>
        
        <div class="content">
            <h2>Hello ${adminFirstName} ${adminLastName},</h2>
            
            <p>Congratulations! Your institution <strong>${institutionName}</strong> has been successfully onboarded to the LEAD101 platform.</p>
            
            <div class="credentials">
                <h3>Your Admin Account Credentials:</h3>
                <p><strong>Email:</strong> ${adminEmail}</p>
                <p><strong>Password:</strong> ${adminPassword}</p>
                <p><strong>Role:</strong> Institution Administrator</p>
            </div>
            
            <div class="highlight">
                <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
            </div>
            
            <p>You can now access your institution dashboard using the following link:</p>
            <a href="${loginUrl}" class="button">Access Your Dashboard</a>
            
            <div class="features">
                <h3>Available Features:</h3>
                ${features
                  .map(
                    (feature) => `<div class="feature-item">✓ ${feature}</div>`
                  )
                  .join("")}
            </div>
            
            <h3>Getting Started:</h3>
            <ol>
                <li>Log in using your admin credentials</li>
                <li>Complete your institution profile</li>
                <li>Set up your team members and their roles</li>
                <li>Configure your lead capture forms</li>
                <li>Start managing your leads and applications</li>
            </ol>
            
            <h3>Support & Assistance:</h3>
            <p>If you need any help getting started or have questions about the platform:</p>
            <ul>
                <li><strong>Email:</strong> ${supportEmail}</li>
                <li><strong>Phone:</strong> ${supportPhone}</li>
            </ul>
            
            <p>We're excited to have you on board and look forward to helping you streamline your lead management process!</p>
            
            <p>Best regards,<br>
            The LEAD101 Team</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} LEAD101. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

  const text = `
Welcome to LEAD101 - ${institutionName} Account Setup Complete!

Hello ${adminFirstName} ${adminLastName},

Congratulations! Your institution ${institutionName} has been successfully onboarded to the LEAD101 platform.

Your Admin Account Credentials:
Email: ${adminEmail}
Password: ${adminPassword}
Role: Institution Administrator

Important: Please change your password after your first login for security purposes.

Login URL: ${loginUrl}

Available Features:
${features.map((feature) => `✓ ${feature}`).join("\n")}

Getting Started:
1. Log in using your admin credentials
2. Complete your institution profile
3. Set up your team members and their roles
4. Configure your lead capture forms
5. Start managing your leads and applications

Support & Assistance:
If you need any help getting started or have questions about the platform:
Email: ${supportEmail}
Phone: ${supportPhone}

We're excited to have you on board and look forward to helping you streamline your lead management process!

Best regards,
The LEAD101 Team

This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} LEAD101. All rights reserved.
`;

  return { subject, html, text };
}

/**
 * Generate password reset email template
 */
export function generatePasswordResetEmail(
  email: string,
  resetUrl: string,
  institutionName: string
): EmailTemplate {
  const subject = `Password Reset Request - ${institutionName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - ${institutionName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
            <p>Reset your password for ${institutionName}</p>
        </div>
        
        <div class="content">
            <h2>Password Reset Request</h2>
            
            <p>We received a request to reset your password for your ${institutionName} account.</p>
            
            <p>If you requested this password reset, please click the button below to set a new password:</p>
            
            <a href="${resetUrl}" class="button">Reset My Password</a>
            
            <div class="highlight">
                <p><strong>Security Notice:</strong> This link will expire in 24 hours for security reasons. If you didn't request this password reset, please ignore this email.</p>
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <p>Best regards,<br>
            The ${institutionName} Team</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} ${institutionName}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

  const text = `
Password Reset Request - ${institutionName}

Password Reset Request

We received a request to reset your password for your ${institutionName} account.

If you requested this password reset, please click the link below to set a new password:

${resetUrl}

Security Notice: This link will expire in 24 hours for security reasons. If you didn't request this password reset, please ignore this email.

If you have any questions or need assistance, please contact our support team.

Best regards,
The ${institutionName} Team

This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} ${institutionName}. All rights reserved.
`;

  return { subject, html, text };
}

/**
 * Get display name for role
 */
function getRoleDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    SUPER_ADMIN: "Super Administrator",
    INSTITUTION_ADMIN: "Institution Administrator",
    TELECALLER: "Telecaller",
    DOCUMENT_VERIFIER: "Document Verifier",
    FINANCE_TEAM: "Finance Team Member",
    ADMISSION_TEAM: "Admission Team Member",
    ADMISSION_HEAD: "Admission Head",
    STUDENT: "Student",
    PARENT: "Parent",
  };
  return roleMap[role] || role;
}
