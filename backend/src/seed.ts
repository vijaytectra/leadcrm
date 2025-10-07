import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./lib/password";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

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
