# Quick Role Protection Reference

## 🎯 Role → Dashboard Mapping

| Role | Dashboard URL | Access Level |
|------|--------------|--------------|
| `admin` | `/dashboard/admin/*` | Full system access |
| `rider` | `/dashboard/rider/*` | Driver features |
| `passenger` | `/dashboard/passenger/*` | Rider features |
| `supportAgent` | `/dashboard/supportAgent/*` | Support tools |

---

## 🔧 Quick Implementation

### Protect a Server Component:
```javascript
import { requireRole } from "@/lib/auth-utils";

export default async function MyPage() {
  const user = await requireRole("admin");
  return <div>Protected Content</div>;
}
```

### Protect a Client Component:
```javascript
"use client";
import { useRequireRole } from "@/hooks/useAuth";

export default function MyPage() {
  const { user, isLoading } = useRequireRole("admin");
  if (isLoading) return <div>Loading...</div>;
  return <div>Protected Content</div>;
}
```

### Check Role in Component:
```javascript
"use client";
import { useAuth } from "@/hooks/useAuth";

export default function MyComponent() {
  const { hasRole } = useAuth();
  
  return (
    <div>
      {hasRole("admin") && <AdminButton />}
      {hasRole(["rider", "passenger"]) && <RideButton />}
    </div>
  );
}
```

---

## 🧪 Quick Test Commands

```bash
# Create test users
curl -X POST http://localhost:4000/api/passenger \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"admin123","role":"admin"}'

curl -X POST http://localhost:4000/api/passenger \
  -H "Content-Type: application/json" \
  -d '{"name":"Rider","email":"rider@test.com","password":"rider123","role":"rider"}'

curl -X POST http://localhost:4000/api/passenger \
  -H "Content-Type: application/json" \
  -d '{"name":"Passenger","email":"passenger@test.com","password":"passenger123","role":"passenger"}'

curl -X POST http://localhost:4000/api/passenger \
  -H "Content-Type: application/json" \
  -d '{"name":"Support","email":"support@test.com","password":"support123","role":"supportAgent"}'
```

---

## 🔍 Quick Debug

### Check if middleware is running:
```javascript
// Add to middleware.js
console.log("Middleware running for:", pathname, "User role:", session?.user?.role);
```

### Check session data:
```javascript
// In any client component
"use client";
import { useSession } from "next-auth/react";

export default function Debug() {
  const { data: session } = useSession();
  return <pre>{JSON.stringify(session, null, 2)}</pre>;
}
```

### Check JWT token:
1. Open DevTools → Application → Cookies
2. Find `next-auth.session-token`
3. Copy value and decode at [jwt.io](https://jwt.io)
4. Verify `role` is in the token

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Can access wrong dashboard | Clear cookies, restart server |
| Infinite redirect | Check role names match exactly |
| Middleware not running | Move middleware.js to `src/` directory |
| OAuth wrong role | Check JWT callback in auth.js |

---

## 📁 File Locations

```
on-way/
├── src/
│   ├── middleware.js          ← Route protection
│   ├── auth.js                ← NextAuth config
│   ├── lib/
│   │   └── auth-utils.js      ← Server utilities
│   └── hooks/
│       └── useAuth.js         ← Client hooks
```

---

## 🔐 Security Checklist

- [x] Middleware protects all dashboard routes
- [x] JWT includes role
- [x] Session includes role
- [x] OAuth fetches role from database
- [x] Server-side validation
- [x] Client-side validation
- [x] Loading states prevent flash
- [x] Unauthorized redirects work

---

## 📞 Need Help?

1. Read `ROLE_PROTECTION_GUIDE.md` for detailed docs
2. Check `TEST_ROLE_PROTECTION.md` for testing
3. Review `ROLE_PROTECTION_IMPLEMENTATION.md` for overview
