# Tenant Integration Guide

This guide explains how to integrate tenant slug support throughout the application.

## Overview

The tenant slug is passed from the URL parameters and made available throughout the application via:

1. Layout components (Header, Sidebar)
2. Context provider for easy access
3. API calls with proper tenant routing

## URL Structure

All institution admin routes follow this pattern:

```
/institution-admin/[page]?tenant=[tenant-slug]
```

Examples:

- `/institution-admin/users?tenant=university-abc`
- `/institution-admin/dashboard?tenant=college-xyz`
- `/institution-admin/settings?tenant=school-123`

## Implementation

### 1. Layout Level (Already Implemented)

The layout automatically extracts the tenant slug from URL parameters:

```typescript
// app/(institution-admin)/layout.tsx
interface InstitutionAdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    tenant?: string;
  }>;
}

export default async function InstitutionAdminLayout({
  children,
  params,
}: InstitutionAdminLayoutProps) {
  const resolvedParams = await params;
  const tenantSlug = resolvedParams.tenant;

  return (
    <TenantProvider tenantSlug={tenantSlug}>
      {/* Layout components */}
    </TenantProvider>
  );
}
```

### 2. Context Provider

The `TenantProvider` makes the tenant slug available throughout the component tree:

```typescript
// context/TenantContext.tsx
export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
```

### 3. Using Tenant Context in Components

```typescript
import { useTenant } from "@/context/TenantContext";

export function MyComponent() {
  const { tenantSlug } = useTenant();

  if (!tenantSlug) {
    return <div>Tenant not found</div>;
  }

  return <div>Current tenant: {tenantSlug}</div>;
}
```

### 4. API Calls with Tenant Slug

All backend API endpoints require the tenant slug in the URL path:

```typescript
// lib/api/users.ts
export async function getUsers(tenantSlug: string): Promise<User[]> {
  const response = await apiGet<UsersResponse>(`/${tenantSlug}/users`, {
    token: "true",
  });
  return response.users;
}
```

### 5. Navigation with Tenant Slug

The sidebar automatically appends the tenant slug to navigation links:

```typescript
// components/layouts/InstitutionAdminSidebar.tsx
const buildUrl = (basePath: string) => {
  if (!tenantSlug) return basePath;
  return `${basePath}?tenant=${tenantSlug}`;
};

// Usage in navigation
<Link href={buildUrl(item.href)}>{item.name}</Link>;
```

## Backend Integration

### API Endpoint Structure

All backend routes follow this pattern:

```
GET /api/:tenant/users
POST /api/:tenant/users
PUT /api/:tenant/users/:userId
DELETE /api/:tenant/users/:userId
```

### Middleware Integration

The backend uses middleware to validate tenant access:

```typescript
// middleware/auth.ts
export function requireTenantAccess(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.tenantSlug) {
    return res.status(400).json({
      error: "Tenant slug required",
      code: "TENANT_REQUIRED",
    });
  }
  // Validate tenant access
  next();
}
```

## Examples

### 1. User Management with Tenant

```typescript
// components/institution-admin/UserManagement.tsx
export function UserManagement({ users, tenantSlug }: UserManagementProps) {
  const handleCreateUser = async (data: CreateUserRequest) => {
    const response = await createUser(tenantSlug, data);
    // Handle response
  };
}
```

### 2. Dashboard with Tenant Stats

```typescript
// components/institution-admin/Dashboard.tsx
export function Dashboard() {
  const { tenantSlug } = useTenant();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (tenantSlug) {
      getTenantStats(tenantSlug).then(setStats);
    }
  }, [tenantSlug]);

  return <div>Dashboard for {tenantSlug}</div>;
}
```

### 3. Settings with Tenant Context

```typescript
// components/institution-admin/Settings.tsx
export function Settings() {
  const { tenantSlug } = useTenant();
  const [tenantInfo, setTenantInfo] = useState(null);

  const handleUpdateSettings = async (settings) => {
    if (tenantSlug) {
      await updateTenantSettings(tenantSlug, settings);
    }
  };

  return <div>Settings for {tenantSlug}</div>;
}
```

## Error Handling

### Missing Tenant Slug

```typescript
if (!tenantSlug) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-heading-text mb-2">
          Tenant Required
        </h2>
        <p className="text-subtext">
          Please select a tenant to access this page.
        </p>
      </div>
    </div>
  );
}
```

### API Error Handling

```typescript
try {
  const users = await getUsers(tenantSlug);
  setUsers(users);
} catch (error) {
  console.error("Error fetching users:", error);
  toast({
    title: "Error loading users",
    description: "Failed to load user data. Please try again.",
    variant: "destructive",
  });
}
```

## Best Practices

1. **Always check for tenant slug** before making API calls
2. **Use the context provider** for easy access to tenant information
3. **Handle missing tenant gracefully** with proper error messages
4. **Pass tenant slug explicitly** to API functions
5. **Use consistent URL structure** for all tenant-related routes
6. **Validate tenant access** on the backend
7. **Show tenant information** in the UI for user clarity

## Testing

When testing components that use tenant context:

```typescript
// test-utils.tsx
export function renderWithTenant(component, tenantSlug = "test-tenant") {
  return render(
    <TenantProvider tenantSlug={tenantSlug}>{component}</TenantProvider>
  );
}
```

This ensures all components have access to the tenant context during testing.
