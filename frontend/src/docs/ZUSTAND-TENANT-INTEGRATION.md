# Zustand Tenant Integration Guide

This guide explains how to use tenant slug functionality with the Zustand auth store.

## Overview

The tenant slug is now integrated into the Zustand auth store, providing:

1. Centralized tenant state management
2. Automatic tenant sync with authentication
3. Easy access throughout the application
4. Type-safe tenant operations

## Auth Store Integration

### Updated Auth State

The auth store now includes tenant functionality:

```typescript
interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  currentTenantSlug: string | null; // New tenant field

  // Existing actions...
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  // ... other existing actions

  // New tenant actions
  setCurrentTenant: (tenantSlug: string | null) => void;
  getCurrentTenant: () => string | null;
}
```

### Automatic Tenant Sync

The tenant slug is automatically set when:

- User logs in (from `response.user.tenantSlug`)
- Auth state is checked (from `/auth/me` response)
- Tenant context provider updates the store

## Usage Examples

### 1. Using Tenant in Components

```typescript
import { useAuthStore } from "@/stores/auth";

export function MyComponent() {
  const { currentTenantSlug, user } = useAuthStore();

  if (!currentTenantSlug) {
    return <div>No tenant selected</div>;
  }

  return (
    <div>
      <h1>Dashboard for {currentTenantSlug}</h1>
      <p>
        User: {user?.firstName} {user?.lastName}
      </p>
    </div>
  );
}
```

### 2. API Calls with Tenant

```typescript
import { useAuthStore } from "@/stores/auth";
import { getUsers } from "@/lib/api/users";

export function UserManagement() {
  const { currentTenantSlug } = useAuthStore();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (currentTenantSlug) {
      getUsers(currentTenantSlug).then(setUsers);
    }
  }, [currentTenantSlug]);

  return <div>{/* User management UI */}</div>;
}
```

### 3. Using Tenant API Hook

```typescript
import { useTenantApi } from "@/lib/api/tenant-integration";

export function Dashboard() {
  const tenantApi = useTenantApi();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    tenantApi.getStats().then(setStats);
  }, []);

  const handleUpdateSettings = async () => {
    await tenantApi.updateSettings({
      name: "New Institution Name",
    });
  };

  return <div>{/* Dashboard UI */}</div>;
}
```

### 4. Outside React Components

```typescript
import {
  getTenantSlugFromStore,
  setTenantSlugInStore,
} from "@/lib/api/tenant-integration";

// Get tenant slug outside of React components
const tenantSlug = getTenantSlugFromStore();

// Set tenant slug outside of React components
setTenantSlugInStore("new-tenant-slug");
```

## API Integration

### Tenant-Aware API Functions

All API functions now accept tenant slug as the first parameter:

```typescript
// lib/api/users.ts
export async function getUsers(tenantSlug: string): Promise<User[]> {
  const response = await apiGet<UsersResponse>(`/${tenantSlug}/users`, {
    token: "true",
  });
  return response.users;
}

export async function createUser(
  tenantSlug: string,
  userData: CreateUserRequest
): Promise<CreateUserResponse> {
  const response = await apiPost<CreateUserResponse>(
    `/${tenantSlug}/users`,
    userData,
    { token: "true" }
  );
  return response;
}
```

### Using API Functions

```typescript
import { useAuthStore } from "@/stores/auth";
import { getUsers, createUser } from "@/lib/api/users";

export function UserManagement() {
  const { currentTenantSlug } = useAuthStore();

  const handleCreateUser = async (userData) => {
    if (!currentTenantSlug) return;

    try {
      const response = await createUser(currentTenantSlug, userData);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
}
```

## Context Provider Integration

The `TenantProvider` automatically syncs with the auth store:

```typescript
// context/TenantContext.tsx
export function TenantProvider({ children, tenantSlug }) {
  const { setCurrentTenant } = useAuthStore();

  useEffect(() => {
    setCurrentTenant(tenantSlug || null);
  }, [tenantSlug, setCurrentTenant]);

  return (
    <TenantContext.Provider value={{ tenantSlug }}>
      {children}
    </TenantContext.Provider>
  );
}
```

## Best Practices

### 1. Always Check for Tenant

```typescript
const { currentTenantSlug } = useAuthStore();

if (!currentTenantSlug) {
  return <div>Tenant required</div>;
}

// Proceed with tenant-specific operations
```

### 2. Use Tenant API Hook for Complex Operations

```typescript
// Instead of manually managing tenant in each component
const tenantApi = useTenantApi();

// This hook automatically handles tenant validation
const stats = await tenantApi.getStats();
```

### 3. Handle Tenant Changes

```typescript
useEffect(() => {
  if (currentTenantSlug) {
    // Reload data when tenant changes
    loadTenantData();
  }
}, [currentTenantSlug]);
```

### 4. Error Handling

```typescript
try {
  const users = await getUsers(currentTenantSlug);
  setUsers(users);
} catch (error) {
  if (error.message.includes("TENANT_REQUIRED")) {
    // Handle missing tenant
  } else {
    // Handle other errors
  }
}
```

## Migration from Context-Only Approach

If you were using only the context approach, here's how to migrate:

### Before (Context Only)

```typescript
import { useTenant } from "@/context/TenantContext";

export function MyComponent() {
  const { tenantSlug } = useTenant();
  // Use tenantSlug...
}
```

### After (Zustand Store)

```typescript
import { useAuthStore } from "@/stores/auth";

export function MyComponent() {
  const { currentTenantSlug } = useAuthStore();
  // Use currentTenantSlug...
}
```

### Benefits of Zustand Approach

1. **Centralized State**: All auth and tenant state in one place
2. **Automatic Sync**: Tenant is automatically set during login
3. **Type Safety**: Full TypeScript support
4. **Performance**: No unnecessary re-renders
5. **Flexibility**: Can be used outside React components

## Testing

### Testing Components with Tenant

```typescript
import { render } from "@testing-library/react";
import { useAuthStore } from "@/stores/auth";

// Mock the auth store
const mockAuthStore = {
  currentTenantSlug: "test-tenant",
  user: { id: "1", email: "test@example.com" },
  isAuthenticated: true,
};

jest.mock("@/stores/auth", () => ({
  useAuthStore: () => mockAuthStore,
}));

test("renders with tenant", () => {
  render(<MyComponent />);
  expect(screen.getByText("test-tenant")).toBeInTheDocument();
});
```

### Testing API Functions

```typescript
import {
  getTenantSlugFromStore,
  setTenantSlugInStore,
} from "@/lib/api/tenant-integration";

test("gets tenant from store", () => {
  setTenantSlugInStore("test-tenant");
  expect(getTenantSlugFromStore()).toBe("test-tenant");
});
```

This approach provides a robust, type-safe way to manage tenant information throughout your application using Zustand's powerful state management capabilities.
