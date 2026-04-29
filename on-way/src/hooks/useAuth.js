"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Custom hook for authentication and role-based access control
 * @returns {Object} - { user, session, status, hasRole, isLoading }
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const user = session?.user || null;

  return {
    user,
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    hasRole: (allowedRoles) => {
      if (!user?.role) return false;
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      return roles.includes(user.role);
    },
  };
}

/**
 * Hook to require authentication - redirects to login if not authenticated
 * @param {string} redirectTo - URL to redirect to if not authenticated
 */
export function useRequireAuth(redirectTo = "/authPage") {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!user) {
      router.push(redirectTo);
    }
  }, [user, status, router, redirectTo]);

  return { user, isLoading: status === "loading" };
}

/**
 * Hook to require specific role - redirects if role doesn't match
 * @param {string|string[]} allowedRoles - Role(s) that are allowed
 * @param {string} redirectTo - URL to redirect to if role doesn't match
 */
export function useRequireRole(allowedRoles, redirectTo = "/") {
  const { user, status, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!user) {
      router.push("/authPage");
      return;
    }

    if (!hasRole(allowedRoles)) {
      // Redirect to user's own dashboard
      const roleRoutes = {
        admin: "/dashboard/admin",
        rider: "/dashboard/rider",
        passenger: "/dashboard/passenger",
        supportAgent: "/dashboard/supportAgent",
      };
      
      const userDashboard = roleRoutes[user.role] || redirectTo;
      router.push(userDashboard);
    }
  }, [user, status, hasRole, allowedRoles, router, redirectTo]);

  return { user, isLoading: status === "loading" };
}
