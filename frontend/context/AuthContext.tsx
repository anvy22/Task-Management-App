"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import api from "@/lib/api";

type AppUser = {
  id: string;
  email: string;
  role: "admin" | "user";
  name?: string;
};

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  ready: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        setReady(true);
        return;
      }

      try {

        const res = await api.post("/auth/sync");
        setUser(res.data);
      } catch (err) {
        console.error("Auth sync failed", err);
        setUser(null);
      } finally {
        setLoading(false);
        setReady(true);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, ready }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
