"use client";

import { useCallback, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { adminErrorMessage, adminRequest } from "./admin-request";

// status : "loading" | "signedOut" | "denied" | "admin"
export function useAdminSession() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setError("");

      if (!currentUser) {
        setStatus("signedOut");
        return;
      }

      setStatus("loading");
      try {
        await currentUser.getIdToken(true);
        await adminRequest(currentUser, "/api/admin/me");
        if (!cancelled) setStatus("admin");
      } catch (requestError) {
        if (!cancelled) {
          setError(adminErrorMessage(requestError.message));
          setStatus("denied");
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (loginError) {
      setError(adminErrorMessage(loginError.message));
      return false;
    }
  }, []);

  const logout = useCallback(() => signOut(auth), []);

  return { user, status, error, login, logout };
}