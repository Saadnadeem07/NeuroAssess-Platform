"use client";

import { api } from "@/lib/api-client";

export type UserRole = "patient" | "psychiatrist" | "admin";

/** Minimal sign-up payload (both roles). Extra details come after login. */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}
export type PatientRegisterData = RegisterData;
export type PsychiatristRegisterData = RegisterData;

export interface ApiEnvelope<T = Record<string, unknown>> {
  success: boolean;
  message?: string;
  data?: T | null;
}

const ROLE_KEY = "currentRole";

export const roleStore = {
  get(): UserRole | null {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem(ROLE_KEY) as UserRole | null) ?? null;
  },
  set(role: UserRole) {
    if (typeof window !== "undefined") localStorage.setItem(ROLE_KEY, role);
  },
  clear() {
    if (typeof window !== "undefined") localStorage.removeItem(ROLE_KEY);
  },
};

export const authClient = {
  async registerPatient(data: PatientRegisterData) {
    const res = await api.post<ApiEnvelope>("/auth/patient/register", data);
    if (res.success) roleStore.set("patient");
    return res;
  },
  async registerPsychiatrist(data: PsychiatristRegisterData) {
    const res = await api.post<ApiEnvelope>("/auth/psychiatrist/register", data);
    if (res.success) roleStore.set("psychiatrist");
    return res;
  },
  async login(role: UserRole, email: string, password: string) {
    const res = await api.post<ApiEnvelope>(`/auth/${role}/login`, { email, password });
    if (res.success) roleStore.set(role);
    return res;
  },
  async verifyOTP(role: UserRole, id: string, otp: string) {
    const res = await api.post<ApiEnvelope>(`/auth/${role}/verify-otp`, { id, otp });
    if (res.success) roleStore.set(role);
    return res;
  },
  async resendOTP(role: UserRole, id: string) {
    return api.post<ApiEnvelope>(`/auth/${role}/resend-otp`, { id });
  },
  async getCurrentUser(): Promise<Record<string, unknown> | null> {
    const role = roleStore.get();
    if (!role) return null;
    try {
      const res = await api.get<ApiEnvelope>(`/auth/${role}/me`);
      return res.success ? (res.data as Record<string, unknown>) : null;
    } catch {
      roleStore.clear();
      return null;
    }
  },
  async forgotPassword(role: UserRole, email: string) {
    return api.post<ApiEnvelope>(`/auth/${role}/forgot-password`, { email });
  },
  async resetPassword(role: UserRole, token: string, newPassword: string) {
    return api.post<ApiEnvelope>(`/auth/${role}/reset-password`, { token, newPassword });
  },
  async logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      /* cookies are cleared server-side regardless */
    }
    roleStore.clear();
  },
};
