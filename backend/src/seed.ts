import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./lib/password";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create Permissions
  console.log("🔐 Creating permissions...");
  const permissions = [
    // Super Admin permissions
    {
      name: "platform:manage",
      description: "Manage entire platform",
      resource: "platform",
      action: "manage",
    },
    {
      name: "institutions:create",
      description: "Create institutions",
      resource: "institutions",
      action: "create",
    },
    {
      name: "institutions:read",
      description: "View institutions",
      resource: "institutions",
      action: "read",
    },
    {
      name: "institutions:update",
      description: "Update institutions",
      resource: "institutions",
      action: "update",
    },
    {
      name: "institutions:delete",
      description: "Delete institutions",
      resource: "institutions",
      action: "delete",
    },
    {
      name: "subscriptions:manage",
      description: "Manage subscriptions",
      resource: "subscriptions",
      action: "manage",
    },
    {
      name: "analytics:view",
      description: "View platform analytics",
      resource: "analytics",
      action: "read",
    },

    // Institution Admin permissions
    {
      name: "users:create",
      description: "Create users",
      resource: "users",
      action: "create",
    },
    {
      name: "users:read",
      description: "View users",
      resource: "users",
      action: "read",
    },
    {
      name: "users:update",
      description: "Update users",
      resource: "users",
      action: "update",
    },
    {
      name: "users:delete",
      description: "Delete users",
      resource: "users",
      action: "delete",
    },
    {
      name: "leads:manage",
      description: "Manage leads",
      resource: "leads",
      action: "manage",
    },
    {
      name: "forms:manage",
      description: "Manage forms",
      resource: "forms",
      action: "manage",
    },
    {
      name: "applications:manage",
      description: "Manage applications",
      resource: "applications",
      action: "manage",
    },
    {
      name: "documents:manage",
      description: "Manage documents",
      resource: "documents",
      action: "manage",
    },
    {
      name: "payments:manage",
      description: "Manage payments",
      resource: "payments",
      action: "manage",
    },
    {
      name: "reports:view",
      description: "View reports",
      resource: "reports",
      action: "read",
    },

    // Telecaller permissions
    {
      name: "leads:read",
      description: "View leads",
      resource: "leads",
      action: "read",
    },
    {
      name: "leads:update",
      description: "Update leads",
      resource: "leads",
      action: "update",
    },
    {
      name: "leads:assign",
      description: "Assign leads",
      resource: "leads",
      action: "assign",
    },
    {
      name: "communications:create",
      description: "Send communications",
      resource: "communications",
      action: "create",
    },
    {
      name: "appointments:manage",
      description: "Manage appointments",
      resource: "appointments",
      action: "manage",
    },

    // Document Verifier permissions
    {
      name: "documents:read",
      description: "View documents",
      resource: "documents",
      action: "read",
    },
    {
      name: "documents:verify",
      description: "Verify documents",
      resource: "documents",
      action: "verify",
    },
    {
      name: "documents:reject",
      description: "Reject documents",
      resource: "documents",
      action: "reject",
    },

    // Finance Team permissions
    {
      name: "payments:read",
      description: "View payments",
      resource: "payments",
      action: "read",
    },
    {
      name: "payments:process",
      description: "Process payments",
      resource: "payments",
      action: "process",
    },
    {
      name: "payments:refund",
      description: "Process refunds",
      resource: "payments",
      action: "refund",
    },
    {
      name: "finance:reports",
      description: "View finance reports",
      resource: "finance",
      action: "read",
    },

    // Admission Team permissions
    {
      name: "applications:read",
      description: "View applications",
      resource: "applications",
      action: "read",
    },
    {
      name: "applications:update",
      description: "Update applications",
      resource: "applications",
      action: "update",
    },
    {
      name: "applications:approve",
      description: "Approve applications",
      resource: "applications",
      action: "approve",
    },
    {
      name: "applications:reject",
      description: "Reject applications",
      resource: "applications",
      action: "reject",
    },

    // Student/Parent permissions
    {
      name: "profile:read",
      description: "View own profile",
      resource: "profile",
      action: "read",
    },
    {
      name: "profile:update",
      description: "Update own profile",
      resource: "profile",
      action: "update",
    },
    {
      name: "applications:create",
      description: "Create applications",
      resource: "applications",
      action: "create",
    },
    {
      name: "documents:upload",
      description: "Upload documents",
      resource: "documents",
      action: "upload",
    },
    {
      name: "payments:create",
      description: "Make payments",
      resource: "payments",
      action: "create",
    },
  ];

  const createdPermissions = [];
  for (const permissionData of permissions) {
    const permission = await prisma.permission.upsert({
      where: { name: permissionData.name },
      update: {},
      create: permissionData,
    });
    createdPermissions.push(permission);
  }

  // Create Role-Permission mappings
  console.log("🔗 Creating role-permission mappings...");
  const rolePermissions = [
    // Super Admin - All permissions
    ...createdPermissions.map((p) => ({
      role: "SUPER_ADMIN",
      permissionId: p.id,
    })),

    // Institution Admin - Most permissions except platform management
    ...createdPermissions
      .filter((p) => !p.name.startsWith("platform:"))
      .map((p) => ({ role: "INSTITUTION_ADMIN", permissionId: p.id })),

    // Telecaller - Lead and communication permissions
    ...createdPermissions
      .filter(
        (p) =>
          p.name.startsWith("leads:") ||
          p.name.startsWith("communications:") ||
          p.name.startsWith("appointments:")
      )
      .map((p) => ({ role: "TELECALLER", permissionId: p.id })),

    // Document Verifier - Document permissions
    ...createdPermissions
      .filter((p) => p.name.startsWith("documents:"))
      .map((p) => ({ role: "DOCUMENT_VERIFIER", permissionId: p.id })),

    // Finance Team - Payment and finance permissions
    ...createdPermissions
      .filter(
        (p) => p.name.startsWith("payments:") || p.name.startsWith("finance:")
      )
      .map((p) => ({ role: "FINANCE_TEAM", permissionId: p.id })),

    // Admission Team - Application permissions
    ...createdPermissions
      .filter((p) => p.name.startsWith("applications:"))
      .map((p) => ({ role: "ADMISSION_TEAM", permissionId: p.id })),

    // Admission Head - All application and some management permissions
    ...createdPermissions
      .filter(
        (p) =>
          p.name.startsWith("applications:") ||
          p.name.startsWith("users:") ||
          p.name.startsWith("reports:")
      )
      .map((p) => ({ role: "ADMISSION_HEAD", permissionId: p.id })),

    // Student - Basic permissions
    ...createdPermissions
      .filter(
        (p) =>
          p.name.startsWith("profile:") ||
          p.name.startsWith("applications:create") ||
          p.name.startsWith("documents:upload") ||
          p.name.startsWith("payments:create")
      )
      .map((p) => ({ role: "STUDENT", permissionId: p.id })),

    // Parent - Similar to student
    ...createdPermissions
      .filter(
        (p) =>
          p.name.startsWith("profile:") ||
          p.name.startsWith("applications:create") ||
          p.name.startsWith("documents:upload") ||
          p.name.startsWith("payments:create")
      )
      .map((p) => ({ role: "PARENT", permissionId: p.id })),
  ];

  for (const rolePermission of rolePermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: rolePermission.role as any,
          permissionId: rolePermission.permissionId,
        },
      },
      update: {},
      create: {
        role: rolePermission.role as any,
        permissionId: rolePermission.permissionId,
      },
    });
  }

  // Create Super Admin tenant
  const superAdminTenant = await prisma.tenant.upsert({
    where: { slug: "lead101" },
    update: {},
    create: {
      slug: "lead101",
      name: "LEAD101 Platform",
      email: "admin@lead101.com",
      phone: "+91-9876543210",
      address: "Mumbai, India",
      subscriptionTier: "MAX",
      subscriptionStatus: "ACTIVE",
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      maxLeads: 10000,
      maxTeamMembers: 100,
    },
  });

  // Create Demo School tenant
  const demoSchoolTenant = await prisma.tenant.upsert({
    where: { slug: "demo-school" },
    update: {},
    create: {
      slug: "demo-school",
      name: "Demo School",
      email: "info@demoschool.com",
      phone: "+91-9876543211",
      address: "Delhi, India",
      subscriptionTier: "PRO",
      subscriptionStatus: "ACTIVE",
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      maxLeads: 2000,
      maxTeamMembers: 10,
    },
  });

  // Create users for each role
  const users = [
    // Super Admin
    {
      email: "superadmin@lead101.com",
      password: "SuperAdmin123!",
      firstName: "Super",
      lastName: "Admin",
      phone: "+91-9876543210",
      role: "SUPER_ADMIN" as const,
      tenantId: superAdminTenant.id,
    },
    // Institution Admin
    {
      email: "admin@demoschool.com",
      password: "Admin123!",
      firstName: "School",
      lastName: "Admin",
      phone: "+91-9876543211",
      role: "INSTITUTION_ADMIN" as const,
      tenantId: demoSchoolTenant.id,
    },
    // Telecaller
    {
      email: "telecaller@demoschool.com",
      password: "Telecaller123!",
      firstName: "John",
      lastName: "Doe",
      phone: "+91-9876543212",
      role: "TELECALLER" as const,
      tenantId: demoSchoolTenant.id,
    },
    // Document Verifier
    {
      email: "verifier@demoschool.com",
      password: "Verifier123!",
      firstName: "Jane",
      lastName: "Smith",
      phone: "+91-9876543213",
      role: "DOCUMENT_VERIFIER" as const,
      tenantId: demoSchoolTenant.id,
    },
    // Finance Team
    {
      email: "finance@demoschool.com",
      password: "Finance123!",
      firstName: "Mike",
      lastName: "Johnson",
      phone: "+91-9876543214",
      role: "FINANCE_TEAM" as const,
      tenantId: demoSchoolTenant.id,
    },
    // Admission Team
    {
      email: "admission@demoschool.com",
      password: "Admission123!",
      firstName: "Sarah",
      lastName: "Wilson",
      phone: "+91-9876543215",
      role: "ADMISSION_TEAM" as const,
      tenantId: demoSchoolTenant.id,
    },
    // Admission Head
    {
      email: "head@demoschool.com",
      password: "Head123!",
      firstName: "Robert",
      lastName: "Brown",
      phone: "+91-9876543216",
      role: "ADMISSION_HEAD" as const,
      tenantId: demoSchoolTenant.id,
    },
    // Student
    {
      email: "student@demoschool.com",
      password: "Student123!",
      firstName: "Alex",
      lastName: "Student",
      phone: "+91-9876543217",
      role: "STUDENT" as const,
      tenantId: demoSchoolTenant.id,
    },
    // Parent
    {
      email: "parent@demoschool.com",
      password: "Parent123!",
      firstName: "David",
      lastName: "Parent",
      phone: "+91-9876543218",
      role: "PARENT" as const,
      tenantId: demoSchoolTenant.id,
    },
  ];

  for (const userData of users) {
    const hashedPassword = await hashPassword(userData.password);
    const { password, ...userCreateData } = userData;

    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userCreateData,
        passwordHash: hashedPassword,
        isActive: true,
        lastLoginAt: new Date(),
      },
    });
  }

  // Create sample leads for demo school
  const sampleLeads = [
    {
      name: "Rahul Sharma",
      email: "rahul.sharma@email.com",
      phone: "+91-9876543301",
      source: "Google Ads",
      status: "NEW" as const,
      score: 85,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Priya Patel",
      email: "priya.patel@email.com",
      phone: "+91-9876543302",
      source: "Facebook Ads",
      status: "CONTACTED" as const,
      score: 72,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Amit Kumar",
      email: "amit.kumar@email.com",
      phone: "+91-9876543303",
      source: "Website Form",
      status: "QUALIFIED" as const,
      score: 90,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Sneha Singh",
      email: "sneha.singh@email.com",
      phone: "+91-9876543304",
      source: "LinkedIn Ads",
      status: "INTERESTED" as const,
      score: 78,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Vikram Gupta",
      email: "vikram.gupta@email.com",
      phone: "+91-9876543305",
      source: "Referral",
      status: "APPLICATION_STARTED" as const,
      score: 95,
      tenantId: demoSchoolTenant.id,
    },
  ];

  for (const leadData of sampleLeads) {
    await prisma.lead.create({
      data: leadData,
    });
  }

  // Create sample fee structure
  await prisma.feeStructure.create({
    data: {
      tenantId: demoSchoolTenant.id,
      name: "Standard Fee Structure",
      description: "Standard fee structure for all courses",
      components: [
        {
          name: "Tuition Fee",
          amount: 50000,
          type: "TUITION",
          required: true,
        },
        {
          name: "Library Fee",
          amount: 2000,
          type: "LIBRARY",
          required: true,
        },
        {
          name: "Sports Fee",
          amount: 1500,
          type: "SPORTS",
          required: false,
        },
        {
          name: "Transport Fee",
          amount: 3000,
          type: "TRANSPORT",
          required: false,
        },
      ],
      isActive: true,
    },
  });

  console.log("✅ Database seeding completed successfully!");
  console.log("\n📋 Test Credentials:");
  console.log("==================");
  console.log("\n🏢 Super Admin (Platform Owner):");
  console.log("   Tenant: lead101");
  console.log("   Email: superadmin@lead101.com");
  console.log("   Password: SuperAdmin123!");

  console.log("\n🏫 Demo School Users:");
  console.log("   Tenant: demo-school");
  console.log("   Institution Admin: admin@demoschool.com / Admin123!");
  console.log("   Telecaller: telecaller@demoschool.com / Telecaller123!");
  console.log("   Document Verifier: verifier@demoschool.com / Verifier123!");
  console.log("   Finance Team: finance@demoschool.com / Finance123!");
  console.log("   Admission Team: admission@demoschool.com / Admission123!");
  console.log("   Admission Head: head@demoschool.com / Head123!");
  console.log("   Student: student@demoschool.com / Student123!");
  console.log("   Parent: parent@demoschool.com / Parent123!");

  console.log("\n🎯 All users are active and ready for testing!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
