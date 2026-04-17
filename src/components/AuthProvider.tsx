"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUserStore } from "@/store/userStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((state) => state.setUser);
  const setLoading = useUserStore((state) => state.setLoading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
