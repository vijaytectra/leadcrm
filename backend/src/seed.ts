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
  const users: Array<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: "SUPER_ADMIN" | "INSTITUTION_ADMIN" | "TELECALLER";
    tenantId: string;
  }> = [
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
      email: "vijay.r20799@gmail.com",
      password: "Vijay@123!",
      firstName: "School",
      lastName: "Admin",
      phone: "+91-9876543211",
      role: "INSTITUTION_ADMIN" as const,
      tenantId: demoSchoolTenant.id,
    },
  ];

  // Create 10 additional telecallers
  console.log("📞 Creating 10 telecallers...");
  const telecallers = [
    {
      email: "telecaller1@demoschool.com",
      password: "Vijay@123",
      firstName: "Rajesh",
      lastName: "Kumar",
      phone: "+91-9876543220",
      role: "TELECALLER" as const,
      tenantId: demoSchoolTenant.id,
    },
    {
      email: "telecaller2@demoschool.com",
      password: "Vijay@123",
      firstName: "Priya",
      lastName: "Sharma",
      phone: "+91-9876543221",
      role: "TELECALLER" as const,
      tenantId: demoSchoolTenant.id,
    },
    {
      email: "telecaller3@demoschool.com",
      password: "Vijay@123",
      firstName: "Amit",
      lastName: "Singh",
      phone: "+91-9876543222",
      role: "TELECALLER" as const,
      tenantId: demoSchoolTenant.id,
    },
    {
      email: "telecaller4@demoschool.com",
      password: "Vijay@123",
      firstName: "Sneha",
      lastName: "Patel",
      phone: "+91-9876543223",
      role: "TELECALLER" as const,
      tenantId: demoSchoolTenant.id,
    },
    {
      email: "telecaller5@demoschool.com",
      password: "Vijay@123",
      firstName: "Vikram",
      lastName: "Gupta",
      phone: "+91-9876543224",
      role: "TELECALLER" as const,
      tenantId: demoSchoolTenant.id,
    },
    {
      email: "telecaller6@demoschool.com",
      password: "Vijay@123",
      firstName: "Kavya",
      lastName: "Reddy",
      phone: "+91-9876543225",
      role: "TELECALLER" as const,
      tenantId: demoSchoolTenant.id,
    },
    {
      email: "telecaller7@demoschool.com",
      password: "Vijay@123",
      firstName: "Arjun",
      lastName: "Mehta",
      phone: "+91-9876543226",
      role: "TELECALLER" as const,
      tenantId: demoSchoolTenant.id,
    },
    {
      email: "telecaller8@demoschool.com",
      password: "Vijay@123",
      firstName: "Anita",
      lastName: "Joshi",
      phone: "+91-9876543227",
      role: "TELECALLER" as const,
      tenantId: demoSchoolTenant.id,
    },
    {
      email: "telecaller9@demoschool.com",
      password: "Vijay@123",
      firstName: "Suresh",
      lastName: "Kumar",
      phone: "+91-9876543228",
      role: "TELECALLER" as const,
      tenantId: demoSchoolTenant.id,
    },
    {
      email: "telecaller10@demoschool.com",
      password: "Vijay@123",
      firstName: "Meera",
      lastName: "Desai",
      phone: "+91-9876543229",
      role: "TELECALLER" as const,
      tenantId: demoSchoolTenant.id,
    },
  ];

  // Add telecallers to users array
  users.push(...telecallers);

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

  // Create 50 leads for demo school
  console.log("👥 Creating 50 leads...");
  const leads = [
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
      status: "NEW" as const,
      score: 95,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Arjun Mehta",
      email: "arjun.mehta@email.com",
      phone: "+91-9876543306",
      source: "Instagram Ads",
      status: "NEW" as const,
      score: 65,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Kavya Reddy",
      email: "kavya.reddy@email.com",
      phone: "+91-9876543307",
      source: "YouTube Ads",
      status: "CONTACTED" as const,
      score: 88,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Rajesh Verma",
      email: "rajesh.verma@email.com",
      phone: "+91-9876543308",
      source: "Google Search",
      status: "QUALIFIED" as const,
      score: 92,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Anita Joshi",
      email: "anita.joshi@email.com",
      phone: "+91-9876543309",
      source: "Facebook Organic",
      status: "INTERESTED" as const,
      score: 76,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Suresh Kumar",
      email: "suresh.kumar@email.com",
      phone: "+91-9876543310",
      source: "WhatsApp Business",
      status: "NEW" as const,
      score: 83,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Meera Desai",
      email: "meera.desai@email.com",
      phone: "+91-9876543311",
      source: "Email Campaign",
      status: "DOCUMENTS_SUBMITTED" as const,
      score: 89,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Vikash Singh",
      email: "vikash.singh@email.com",
      phone: "+91-9876543312",
      source: "LinkedIn Organic",
      status: "UNDER_REVIEW" as const,
      score: 94,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Pooja Agarwal",
      email: "pooja.agarwal@email.com",
      phone: "+91-9876543313",
      source: "Twitter Ads",
      status: "ADMITTED" as const,
      score: 97,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Rohit Sharma",
      email: "rohit.sharma@email.com",
      phone: "+91-9876543314",
      source: "TikTok Ads",
      status: "ENROLLED" as const,
      score: 91,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Deepika Nair",
      email: "deepika.nair@email.com",
      phone: "+91-9876543315",
      source: "Snapchat Ads",
      status: "REJECTED" as const,
      score: 45,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Ravi Kumar",
      email: "ravi.kumar@email.com",
      phone: "+91-9876543316",
      source: "Google Ads",
      status: "NEW" as const,
      score: 68,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Sunita Devi",
      email: "sunita.devi@email.com",
      phone: "+91-9876543317",
      source: "Facebook Ads",
      status: "CONTACTED" as const,
      score: 74,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Manoj Tiwari",
      email: "manoj.tiwari@email.com",
      phone: "+91-9876543318",
      source: "Website Form",
      status: "QUALIFIED" as const,
      score: 87,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Geeta Sharma",
      email: "geeta.sharma@email.com",
      phone: "+91-9876543319",
      source: "LinkedIn Ads",
      status: "INTERESTED" as const,
      score: 79,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Suresh Yadav",
      email: "suresh.yadav@email.com",
      phone: "+91-9876543320",
      source: "Referral",
      status: "NEW" as const,
      score: 93,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Kiran Patel",
      email: "kiran.patel@email.com",
      phone: "+91-9876543321",
      source: "Instagram Ads",
      status: "DOCUMENTS_SUBMITTED" as const,
      score: 86,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Vijay Singh",
      email: "vijay.singh@email.com",
      phone: "+91-9876543322",
      source: "YouTube Ads",
      status: "UNDER_REVIEW" as const,
      score: 91,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Neha Gupta",
      email: "neha.gupta@email.com",
      phone: "+91-9876543323",
      source: "Google Search",
      status: "ADMITTED" as const,
      score: 96,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Rajesh Pandey",
      email: "rajesh.pandey@email.com",
      phone: "+91-9876543324",
      source: "Facebook Organic",
      status: "ENROLLED" as const,
      score: 88,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Anjali Verma",
      email: "anjali.verma@email.com",
      phone: "+91-9876543325",
      source: "WhatsApp Business",
      status: "LOST" as const,
      score: 42,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Sandeep Kumar",
      email: "sandeep.kumar@email.com",
      phone: "+91-9876543326",
      source: "Email Campaign",
      status: "NEW" as const,
      score: 71,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Poonam Singh",
      email: "poonam.singh@email.com",
      phone: "+91-9876543327",
      source: "LinkedIn Organic",
      status: "CONTACTED" as const,
      score: 82,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Ramesh Kumar",
      email: "ramesh.kumar@email.com",
      phone: "+91-9876543328",
      source: "Twitter Ads",
      status: "QUALIFIED" as const,
      score: 89,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Shilpa Agarwal",
      email: "shilpa.agarwal@email.com",
      phone: "+91-9876543329",
      source: "TikTok Ads",
      status: "INTERESTED" as const,
      score: 77,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Akhil Sharma",
      email: "akhil.sharma@email.com",
      phone: "+91-9876543330",
      source: "Snapchat Ads",
      status: "NEW" as const,
      score: 84,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Ritu Nair",
      email: "ritu.nair@email.com",
      phone: "+91-9876543331",
      source: "Google Ads",
      status: "DOCUMENTS_SUBMITTED" as const,
      score: 92,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Naveen Kumar",
      email: "naveen.kumar@email.com",
      phone: "+91-9876543332",
      source: "Facebook Ads",
      status: "UNDER_REVIEW" as const,
      score: 85,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Sushma Reddy",
      email: "sushma.reddy@email.com",
      phone: "+91-9876543333",
      source: "Website Form",
      status: "ADMITTED" as const,
      score: 94,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Dinesh Patel",
      email: "dinesh.patel@email.com",
      phone: "+91-9876543334",
      source: "LinkedIn Ads",
      status: "ENROLLED" as const,
      score: 90,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Kavita Joshi",
      email: "kavita.joshi@email.com",
      phone: "+91-9876543335",
      source: "Referral",
      status: "REJECTED" as const,
      score: 38,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Prakash Verma",
      email: "prakash.verma@email.com",
      phone: "+91-9876543336",
      source: "Instagram Ads",
      status: "NEW" as const,
      score: 66,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Sarita Mehta",
      email: "sarita.mehta@email.com",
      phone: "+91-9876543337",
      source: "YouTube Ads",
      status: "CONTACTED" as const,
      score: 73,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Vinod Kumar",
      email: "vinod.kumar@email.com",
      phone: "+91-9876543338",
      source: "Google Search",
      status: "QUALIFIED" as const,
      score: 81,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Preeti Singh",
      email: "preeti.singh@email.com",
      phone: "+91-9876543339",
      source: "Facebook Organic",
      status: "INTERESTED" as const,
      score: 75,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Ashok Gupta",
      email: "ashok.gupta@email.com",
      phone: "+91-9876543340",
      source: "WhatsApp Business",
      status: "NEW" as const,
      score: 87,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Manju Sharma",
      email: "manju.sharma@email.com",
      phone: "+91-9876543341",
      source: "Email Campaign",
      status: "DOCUMENTS_SUBMITTED" as const,
      score: 91,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Rakesh Kumar",
      email: "rakesh.kumar@email.com",
      phone: "+91-9876543342",
      source: "LinkedIn Organic",
      status: "UNDER_REVIEW" as const,
      score: 88,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Suman Agarwal",
      email: "suman.agarwal@email.com",
      phone: "+91-9876543343",
      source: "Twitter Ads",
      status: "ADMITTED" as const,
      score: 95,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Mukesh Yadav",
      email: "mukesh.yadav@email.com",
      phone: "+91-9876543344",
      source: "TikTok Ads",
      status: "ENROLLED" as const,
      score: 89,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Kamla Devi",
      email: "kamla.devi@email.com",
      phone: "+91-9876543345",
      source: "Snapchat Ads",
      status: "LOST" as const,
      score: 41,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Bharat Singh",
      email: "bharat.singh@email.com",
      phone: "+91-9876543346",
      source: "Google Ads",
      status: "NEW" as const,
      score: 69,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Usha Patel",
      email: "usha.patel@email.com",
      phone: "+91-9876543347",
      source: "Facebook Ads",
      status: "CONTACTED" as const,
      score: 76,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Gopal Verma",
      email: "gopal.verma@email.com",
      phone: "+91-9876543348",
      source: "Website Form",
      status: "QUALIFIED" as const,
      score: 83,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Laxmi Nair",
      email: "laxmi.nair@email.com",
      phone: "+91-9876543349",
      source: "LinkedIn Ads",
      status: "INTERESTED" as const,
      score: 78,
      tenantId: demoSchoolTenant.id,
    },
    {
      name: "Hari Kumar",
      email: "hari.kumar@email.com",
      phone: "+91-9876543350",
      source: "Referral",
      status: "APPLICATION_STARTED" as const,
      score: 86,
      tenantId: demoSchoolTenant.id,
    },
  ];

  for (const leadData of leads) {
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

  console.log("\n📞 Additional Telecallers (Password: Vijay@123):");
  console.log("   telecaller1@demoschool.com - Rajesh Kumar");
  console.log("   telecaller2@demoschool.com - Priya Sharma");
  console.log("   telecaller3@demoschool.com - Amit Singh");
  console.log("   telecaller4@demoschool.com - Sneha Patel");
  console.log("   telecaller5@demoschool.com - Vikram Gupta");
  console.log("   telecaller6@demoschool.com - Kavya Reddy");
  console.log("   telecaller7@demoschool.com - Arjun Mehta");
  console.log("   telecaller8@demoschool.com - Anita Joshi");
  console.log("   telecaller9@demoschool.com - Suresh Kumar");
  console.log("   telecaller10@demoschool.com - Meera Desai");

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
