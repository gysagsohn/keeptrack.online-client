import { useCallback, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContextBase";
import api from "../lib/axios";
import { tokenStorage } from "../utils/tokenStorage";

export default function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => tokenStorage.get());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((newToken) => {
    if (newToken) {
      tokenStorage.set(newToken);
    } else {
      tokenStorage.remove();
    }
    setTokenState(newToken);
  }, []);

  // Shared hydration function — called on mount, token change, and tab resume.
  // Extracted so the visibilitychange handler can call it without duplicating logic.
  const hydrateUser = useCallback(async () => {
    const currentToken = tokenStorage.get();
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/users/me");
      setUser(res.data?.data || res.data?.user || null);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("AuthProvider hydration error:", err);
      }
      // 401 is handled by the axios interceptor (clears token, redirects to /login)
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setToken]);

  // Hydrate user from token on mount or token change
  useEffect(() => {
    async function run() {
      setLoading(true);
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      await hydrateUser();
    }

    run();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps
  // hydrateUser intentionally omitted — we only want this to fire on token change,
  // not every time hydrateUser is recreated. The visibilitychange handler below
  // covers the tab-resume case independently.

  // Re-validate session when the tab becomes visible again.
  // Mobile browsers suspend background tabs — when the user returns, React does
  // not re-mount so useEffect hooks don't re-fire. This listener catches that case
  // and re-hydrates the user, which causes page-level data fetches to re-run.
  const lastHydratedAt = useRef(Date.now());
  useEffect(() => {
    const REHYDRATE_AFTER_MS = 5 * 60 * 1000; // only re-check if tab was away 5+ min

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;

      const awayMs = Date.now() - lastHydratedAt.current;
      if (awayMs < REHYDRATE_AFTER_MS) return;

      lastHydratedAt.current = Date.now();

      // Only re-hydrate if we have a token — no point hitting the API otherwise
      if (tokenStorage.get()) {
        hydrateUser();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [hydrateUser]);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
  }, [setToken]);

  const signup = useCallback(async (payload) => {
    const res = await api.post("/auth/signup", payload);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        signup,
        logout,
        setToken,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}