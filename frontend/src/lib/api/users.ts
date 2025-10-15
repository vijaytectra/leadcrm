// Removed unused import
import { getToken } from "../getToken";
import {
  apiGetClientNew,
  apiPostClientNew,
  apiPutClient,
  apiDeleteClient,
} from "../utils";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
}

export interface UsersResponse {
  users: User[];
}

export interface UserResponse {
  user: User;
}

export interface CreateUserResponse {
  user: User;
  message: string;
}

/**
 * Get all users for a tenant
 */
export async function getUsers(tenantSlug: string): Promise<User[]> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }

    const response = await apiGetClientNew<UsersResponse>(
      `/${tenantSlug}/users`,
      {
        token: token,
      }
    );
   

    return response.users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

/**
 * Get a specific user by ID
 */
export async function getUser(
  tenantSlug: string,
  userId: string
): Promise<User> {
  const token = await getToken();
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await apiGetClientNew<UserResponse>(
      `/${tenantSlug}/users/${userId}`,
      {
        token: token,
      }
    );
    return response.user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(
  tenantSlug: string,
  userData: CreateUserRequest
): Promise<CreateUserResponse> {
  const token = await getToken();
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await apiPostClientNew<CreateUserResponse>(
      `/${tenantSlug}/users`,
      userData,
      { token: token }
    );
    return response;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Update a user
 */
export async function updateUser(
  tenantSlug: string,
  userId: string,
  userData: UpdateUserRequest
): Promise<User> {
  const token = await getToken();
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await apiPutClient<UserResponse>(
      `/${tenantSlug}/users/${userId}`,
      userData,
      { token: token }
    );
    return response.user;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Delete (deactivate) a user
 */
export async function deleteUser(
  tenantSlug: string,
  userId: string
): Promise<void> {
  const token = await getToken();
  if (!token) {
    throw new Error("No token found");
  }
  try {
    await apiDeleteClient(`/${tenantSlug}/users/${userId}`, { token: token });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
