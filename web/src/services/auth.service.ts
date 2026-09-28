import api from "../api/axios";
import type { LoginRequest, LoginResponse } from "../types/auth";

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  }
  saveToken(token: string) {
    localStorage.setItem("access_token", token);
  }
  getToken() {
    return localStorage.getItem("access_token");
  }
  getUser(): JwtPayload | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload)) as JwtPayload;
      return decoded;
    } catch {
      return null;
    }
  }
  getRole() {
    return this.getUser()?.role ?? null;
  }
  isAuthenticated() {
    return !!this.getToken();
  }
  logout() {
    localStorage.removeItem("access_token");
  }
}

export default new AuthService();
