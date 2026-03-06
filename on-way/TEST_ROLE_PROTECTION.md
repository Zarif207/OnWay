# Testing Role-Based Route Protection

## Quick Test Checklist

### 1. Test Unauthenticated Access

**Steps:**
1. Open browser in incognito/private mode
2. Try to access: `http://localhost:3000/dashboard/admin`
3. **Expected:** Redirect to `/login?callbackUrl=/dashboard/admin`

**Test URLs:**
- `/dashboard/admin`
- `/dashboard/rider`
- `/dashboard/passenger`
- `/dashboard/supportAgent`

All should redirect to login page.

---

### 2. Test Admin Role

**Steps:**
1. Login with admin credentials
2. Try accessing different dashboards

**Expected Results:**
| URL | Expected Behavior |
|-----|-------------------|
| `/dashboard` | Redirect to `/dashboard/admin` |
| `/dashboard/admin` | ✅ Access granted |
| `/dashboard/rider` | ❌ Redirect to `/dashboard/admin` |
| `/dashboard/passenger` | ❌ Redirect to `/dashboard/admin` |
| `/dashboard/supportAgent` | ❌ Redirect to `/dashboard/admin` |

---

### 3. Test Rider Role

**Steps:**
1. Login with rider credentials
2. Try accessing different dashboards

**Expected Results:**
| URL | Expected Behavior |
|-----|-------------------|
| `/dashboard` | Redirect to `/dashboard/rider` |
| `/dashboard/admin` | ❌ Redirect to `/dashboard/rider` |
| `/dashboard/rider` | ✅ Access granted |
| `/dashboard/passenger` | ❌ Redirect to `/dashboard/rider` |
| `/dashboard/supportAgent` | ❌ Redirect to `/dashboard/rider` |

---

### 4. Test Passenger Role

**Steps:**
1. Login with passenger credentials
2. Try accessing different dashboards

**Expected Results:**
| URL | Expected Behavior |
|-----|-------------------|
| `/dashboard` | Redirect to `/dashboard/passenger` |
| `/dashboard/admin` | ❌ Redirect to `/dashboard/passenger` |
| `/dashboard/rider` | ❌ Redirect to `/dashboard/passenger` |
| `/dashboard/passenger` | ✅ Access granted |
| `/dashboard/supportAgent` | ❌ Redirect to `/dashboard/passenger` |

---

### 5. Test Support Agent Role

**Steps:**
1. Login with support agent credentials
2. Try accessing different dashboards

**Expected Results:**
| URL | Expected Behavior |
|-----|-------------------|
| `/dashboard` | Redirect to `/dashboard/supportAgent` |
| `/dashboard/admin` | ❌ Redirect to `/dashboard/supportAgent` |
| `/dashboard/rider` | ❌ Redirect to `/dashboard/supportAgent` |
| `/dashboard/passenger` | ❌ Redirect to `/dashboard/supportAgent` |
| `/dashboard/supportAgent` | ✅ Access granted |

---

## Creating Test Users

If you need to create test users with different roles, use your backend API:

```bash
# Create Admin User
curl -X POST http://localhost:4000/api/passenger \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin"
  }'

# Create Rider User
curl -X POST http://localhost:4000/api/passenger \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rider User",
    "email": "rider@test.com",
    "password": "rider123",
    "role": "rider"
  }'

# Create Passenger User
curl -X POST http://localhost:4000/api/passenger \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Passenger User",
    "email": "passenger@test.com",
    "password": "passenger123",
    "role": "passenger"
  }'

# Create Support Agent User
curl -X POST http://localhost:4000/api/passenger \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support Agent",
    "email": "support@test.com",
    "password": "support123",
    "role": "supportAgent"
  }'
```

---

## Automated Testing Script

Create a file `test-roles.js` in your project root:

```javascript
const testUsers = [
  { email: "admin@test.com", password: "admin123", role: "admin" },
  { email: "rider@test.com", password: "rider123", role: "rider" },
  { email: "passenger@test.com", password: "passenger123", role: "passenger" },
  { email: "support@test.com", password: "support123", role: "supportAgent" }
];

const dashboards = [
  "/dashboard/admin",
  "/dashboard/rider",
  "/dashboard/passenger",
  "/dashboard/supportAgent"
];

console.log("Role Protection Test Plan:");
console.log("========================\n");

testUsers.forEach(user => {
  console.log(`Testing ${user.role.toUpperCase()} role:`);
  dashboards.forEach(dashboard => {
    const dashboardRole = dashboard.split('/')[2];
    const shouldAccess = dashboardRole === user.role;
    console.log(`  ${dashboard}: ${shouldAccess ? '✅ ALLOW' : '❌ DENY'}`);
  });
  console.log();
});
```

Run with: `node test-roles.js`

---

## Browser DevTools Testing

1. Open browser DevTools (F12)
2. Go to Application > Cookies
3. Find `next-auth.session-token` cookie
4. Delete it to test unauthenticated access
5. Login and check the session data in Network tab

---

## Common Issues & Solutions

### Issue: Still can access wrong dashboard
**Solution:** 
- Clear all cookies
- Clear browser cache
- Restart Next.js dev server
- Check middleware.js is in `src/` directory

### Issue: Infinite redirect loop
**Solution:**
- Check that role in database matches exactly: "admin", "rider", "passenger", "supportAgent"
- Verify ROLE_ROUTES in middleware.js match your actual routes

### Issue: OAuth users have wrong role
**Solution:**
- Check JWT callback in auth.js is fetching role from database
- Verify API endpoint `/api/passenger/find?email=` returns user with role

### Issue: Middleware not running
**Solution:**
- Ensure middleware.js is in `src/` directory (not `src/app/`)
- Check matcher config in middleware.js
- Restart dev server

---

## Production Testing

Before deploying to production:

1. ✅ Test all 4 roles
2. ✅ Test unauthenticated access
3. ✅ Test OAuth login (Google/GitHub)
4. ✅ Test direct URL access
5. ✅ Test browser back button
6. ✅ Test session expiry
7. ✅ Test role changes (update in DB, logout, login)

---

## Security Verification

Run these checks:

```bash
# 1. Check middleware is protecting routes
curl -I http://localhost:3000/dashboard/admin
# Should return 307 redirect if not authenticated

# 2. Check session includes role
# Login, then check browser DevTools > Application > Storage

# 3. Verify JWT includes role
# Decode the JWT token at jwt.io
```

---

## Performance Testing

The middleware runs on every request. Monitor:
- Response time for protected routes
- Database queries for role fetching
- JWT token size

Expected overhead: < 50ms per request

---

## Monitoring in Production

Add logging to track unauthorized access attempts:

```javascript
// In middleware.js, add:
if (!route.allowedRoles.includes(userRole)) {
  console.warn(`Unauthorized access attempt: ${userRole} tried to access ${pathname}`);
  // Send to monitoring service (Sentry, LogRocket, etc.)
}
```

---

## Success Criteria

✅ All tests pass
✅ No console errors
✅ Smooth redirects (no flashing)
✅ Loading states work properly
✅ Session persists across page refreshes
✅ Role changes require re-login
✅ OAuth users get correct roles

---

## Next Steps After Testing

1. Deploy to staging environment
2. Run full test suite again
3. Monitor for any edge cases
4. Document any custom role logic
5. Train team on role management
6. Set up monitoring/alerts
