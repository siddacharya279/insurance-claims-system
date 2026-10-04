import * as SecureStore from "expo-secure-store";

import { apiRequest } from "./api";

const TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  await SecureStore.setItemAsync(TOKEN_KEY, response.accessToken);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));

  return response;
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const value = await SecureStore.getItemAsync(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}
