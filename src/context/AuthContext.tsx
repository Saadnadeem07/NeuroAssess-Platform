"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  authClient,
  roleStore,
  type UserRole,
  type ApiEnvelope,
  type PatientRegisterData,
  type PsychiatristRegisterData,
} from "@/services/auth-client";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  currentRole: UserRole | null;
  setRole: (role: UserRole) => void;
  loginPatient: (email: string, password: string) => Promise<ApiEnvelope>;
  loginPsychiatrist: (email: string, password: string) => Promise<ApiEnvelope>;
  loginAdmin: (email: string, password: string) => Promise<ApiEnvelope>;
  registerPatient: (data: PatientRegisterData) => Promise<ApiEnvelope>;
  registerPsychiatrist: (data: PsychiatristRegisterData) => Promise<ApiEnvelope>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const NOT_READY: ApiEnvelope = { success: false };

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  currentRole: null,
  setRole: () => {},
  loginPatient: async () => NOT_READY,
  loginPsychiatrist: async () => NOT_READY,
  loginAdmin: async () => NOT_READY,
  registerPatient: async () => NOT_READY,
  registerPsychiatrist: async () => NOT_READY,
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const savedRole = roleStore.get();
        if (savedRole) {
          setCurrentRole(savedRole);
          const me = (await authClient.getCurrentUser()) as AuthUser | null;
          if (me) setUser(me);
          else {
            roleStore.clear();
            setCurrentRole(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    init();

    const handleLogout = () => {
      setUser(null);
      setCurrentRole(null);
      roleStore.clear();
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const setRole = useCallback((role: UserRole) => {
    setCurrentRole(role);
    roleStore.set(role);
  }, []);

  const loginAs = useCallback(async (role: UserRole, email: string, password: string) => {
    const res = await authClient.login(role, email, password);
    if (res.success) {
      setCurrentRole(role);
      const me = (await authClient.getCurrentUser()) as AuthUser | null;
      if (me) setUser(me);
    }
    return res;
  }, []);

  const refreshUser = useCallback(async () => {
    const me = (await authClient.getCurrentUser()) as AuthUser | null;
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    await authClient.logout();
    setUser(null);
    setCurrentRole(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        currentRole,
        setRole,
        loginPatient: (e, p) => loginAs("patient", e, p),
        loginPsychiatrist: (e, p) => loginAs("psychiatrist", e, p),
        loginAdmin: (e, p) => loginAs("admin", e, p),
        registerPatient: (data) => authClient.registerPatient(data),
        registerPsychiatrist: (data) => authClient.registerPsychiatrist(data),
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
