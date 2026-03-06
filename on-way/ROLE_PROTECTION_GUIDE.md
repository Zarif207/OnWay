# Role-Based Route Protection Guide

This guide explains how the role-based route protection system works in the OnWay platform.

## Overview

The system protects routes based on user roles using Next.js middleware and NextAuth. There are 4 user roles:
- `admin` - Access to `/dashboard/admin/*`
- `rider` - Access to `/dashboard/rider/*`
- `passenger` - Access to `/dashboard/passenger/*`
- `supportAgent` - Access to `/dashboard/supportAgent/*`

## How It Works

### 1. Authentication Flow

1. User logs in via NextAuth (Credentials, Google, or GitHub)
2. User's role is fetched from the database and stored in JWT token
3. Role is included in the session object
4. Middleware checks role on every route access

### 2. Middleware Protection

The middleware (`src/middleware.js`) runs on every request and:
- Allows public routes (home, login, register, API routes)
- Redirects unauthenticated users to login
- Redirects `/dashboard` to user's role-specific dashboard
- Blocks access to dashboards that don't match user's role
- Redirects unauthorized users to their own dashboard

### 3. Files Modified/Created

#### Modified Files:
- `src/auth.js` - Enhanced JWT callback to fetch role from database for OAuth users
- `src/middleware.js` - Complete rewrite with role-based protection

#### New Files:
- `src/lib/auth-utils.js` - Server-side utilities for role checking
- `src/hooks/useAuth.js` - Client-side hooks for role checking

## Usage Examples

### Server Components (Recommended)

Use the server-side utilities in your page components:

```javascript
// app/dashboard/admin/page.jsx
import { requireRole } from "@/lib/auth-utils";

export default async function AdminDashboard() {
  // This will redirect if user is not an admin
  const user = await requireRole("admin", "/dashboard/admin");

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name}!</p>
    </div>
  );
}
```

### Multiple Roles

```javascript
// Allow both admin and supportAgent
const user = await requireRole(["admin", "supportAgent"], "/dashboard/admin");
```

### Client Components

Use the client-side hooks:

```javascript
"use client";

import { useRequireRole } from "@/hooks/useAuth";

export default function AdminSettings() {
  const { user, isLoading } = useRequireRole("admin");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Admin Settings</h1>
      <p>Welcome, {user.name}!</p>
    </div>
  );
}
```

### Conditional Rendering Based on Role

```javascript
"use client";

import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user, hasRole } = useAuth();

  return (
    <div>
      {hasRole("admin") && <AdminPanel />}
      {hasRole(["rider", "passenger"]) && <RidePanel />}
    </div>
  );
}
```

### Check Authentication Only

```javascript
import { requireAuth } from "@/lib/auth-utils";

export default async function ProfilePage() {
  // Just require authentication, any role is allowed
  const user = await requireAuth("/profile");

  return <div>Profile for {user.name}</div>;
}
```

## Testing the Protection

### Test Scenarios:

1. **Unauthenticated Access**
   - Try accessing `/dashboard/admin` without logging in
   - Expected: Redirect to `/login?callbackUrl=/dashboard/admin`

2. **Wrong Role Access**
   - Login as a passenger
   - Try accessing `/dashboard/admin`
   - Expected: Redirect to `/dashboard/passenger`

3. **Correct Role Access**
   - Login as an admin
   - Access `/dashboard/admin`
   - Expected: Access granted

4. **Base Dashboard Route**
   - Login as any role
   - Access `/dashboard`
   - Expected: Redirect to role-specific dashboard

## Security Features

✅ **JWT-based authentication** - Secure token storage
✅ **Server-side validation** - Middleware runs on server
✅ **Role stored in database** - Single source of truth
✅ **Automatic redirects** - No unauthorized access
✅ **Session management** - 30-day session expiry
✅ **OAuth role sync** - Roles fetched for social logins

## Updating User Roles

To change a user's role, update it in the database:

```javascript
// Backend API endpoint
PATCH /api/passenger/:id
{
  "role": "admin"
}
```

The user will need to log out and log back in for the role change to take effect (or you can implement a role refresh mechanism).

## Troubleshooting

### Issue: User can still access wrong dashboard
**Solution**: Clear browser cookies and JWT tokens, then log in again

### Issue: OAuth users have wrong role
**Solution**: Check that the JWT callback is fetching role from database correctly

### Issue: Middleware not running
**Solution**: Ensure `middleware.js` is in the `src` directory (not `src/app`)

### Issue: Infinite redirect loop
**Solution**: Check that the role routes in middleware match your actual dashboard routes

## Environment Variables Required

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# API URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# OAuth Providers
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
```

## Best Practices

1. **Always use server-side protection** - Middleware + server components
2. **Client-side checks are for UX only** - Never rely solely on client checks
3. **Keep role definitions centralized** - Use the constants in auth-utils.js
4. **Test all role combinations** - Ensure each role can only access their routes
5. **Log security events** - Monitor unauthorized access attempts

## Production Deployment

Before deploying to production:

1. ✅ Set `NEXTAUTH_SECRET` to a strong random string
2. ✅ Update `NEXTAUTH_URL` to your production domain
3. ✅ Update `NEXT_PUBLIC_API_URL` to your production API
4. ✅ Test all role-based routes
5. ✅ Enable HTTPS only
6. ✅ Set `trustHost: true` in NextAuth config (already done)

## Support

For issues or questions about role-based protection, check:
- NextAuth documentation: https://next-auth.js.org
- Next.js middleware docs: https://nextjs.org/docs/app/building-your-application/routing/middleware
