import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Role-based route mappings
 */
export const ROLE_ROUTES = {
  admin: "/dashboard/admin",
  rider: "/dashboard/rider",
  passenger: "/dashboard/passenger",
  supportAgent: "/dashboard/supportAgent",
};

/**
 * Get the current user session
 * @returns {Promise<Session|null>}
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Require authentication - redirect to login if not authenticated
 * @param {string} callbackUrl - URL to redirect to after login
 * @returns {Promise<User>}
 */
export async function requireAuth(callbackUrl = "/") {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  
  return user;
}

/**
 * Require specific role - redirect to user's dashboard if role doesn't match
 * @param {string|string[]} allowedRoles - Role(s) that are allowed
 * @param {string} callbackUrl - Current URL for redirect after login
 * @returns {Promise<User>}
 */
export async function requireRole(allowedRoles, callbackUrl = "/") {
  const user = await requireAuth(callbackUrl);
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  if (!roles.includes(user.role)) {
    // Redirect to user's own dashboard
    const userDashboard = ROLE_ROUTES[user.role];
    redirect(userDashboard || "/");
  }
  
  return user;
}

/**
 * Check if user has specific role
 * @param {User} user - User object
 * @param {string|string[]} allowedRoles - Role(s) to check
 * @returns {boolean}
 */
export function hasRole(user, allowedRoles) {
  if (!user?.role) return false;
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
}

/**
 * Get user's dashboard URL based on role
 * @param {string} role - User role
 * @returns {string}
 */
export function getUserDashboard(role) {
  return ROLE_ROUTES[role] || "/";
}
