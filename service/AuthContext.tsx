
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type AuthUsers = {
  Nrp: string;
  Nama: string;
  NrpSuperior: string;
  Email: string;
  Jobsite: string;
  JobsiteId: string;
  Jabatan: string;
  JabatanId: string;
  JabatanStructural: string;
  JabatanStructuralId: string;
  Workgroup: string;
};
export interface GlobalModel {
  Kode: string;
  Keterangan: string;
  Kategori: string;
}


type AuthContextValue = {
  isAuthenticated: boolean;
  currentUser: AuthUsers | null;
  login: (user: AuthUsers) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LS_KEY = "SmartTomasAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUsers | null>(null);

  // Inisialisasi dari localStorage hanya sekali saat mount
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const user = JSON.parse(raw) as AuthUsers;
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch {
        // Jika parsing gagal, bersihkan
        localStorage.removeItem(LS_KEY);
      }
    }
  }, []);

  const login = (user: AuthUsers) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    localStorage.setItem(LS_KEY, JSON.stringify(user));
    // broadcast ke tab lain (opsional, lihat useEffect di bawah)
    bc?.postMessage({ type: "login", payload: user });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(LS_KEY);
    bc?.postMessage({ type: "logout" });
  };

  // (Opsional) sinkronisasi antar tab menggunakan BroadcastChannel
  const [bc] = useState<BroadcastChannel | null>(() => {
    try {
      return new BroadcastChannel("auth");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!bc) return;

    const handler = (ev: MessageEvent) => {
      const { type, payload } = ev.data || {};
      if (type === "login") {
        setIsAuthenticated(true);
        setCurrentUser(payload as AuthUsers);
        localStorage.setItem(LS_KEY, JSON.stringify(payload));
      } else if (type === "logout") {
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem(LS_KEY);
      }
    };

    bc.addEventListener("message", handler);
    return () => {
      bc.removeEventListener("message", handler);
      bc.close();
    };
  }, [bc]);

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated, currentUser, login, logout }),
    [isAuthenticated, currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  }
  return ctx;
}

export default AuthProvider;