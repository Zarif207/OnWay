# Role-Based Protection Flow Diagram

## 🔄 Complete Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER VISITS SITE                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE INTERCEPTS                         │
│                    (src/middleware.js)                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
                    ┌─────────────────┐
                    │  Is Public      │
                    │  Route?         │
                    │  (/, /login)    │
                    └─────────────────┘
                         ↓         ↓
                    YES  ↓         ↓  NO
                         ↓         ↓
                    ┌────┘         └────┐
                    ↓                   ↓
            ┌──────────────┐    ┌──────────────┐
            │ ALLOW ACCESS │    │ CHECK AUTH   │
            └──────────────┘    └──────────────┘
                                        ↓
                                        ↓
                              ┌─────────────────┐
                              │ Authenticated?  │
                              └─────────────────┘
                                   ↓         ↓
                              NO   ↓         ↓  YES
                                   ↓         ↓
                    ┌──────────────┘         └──────────────┐
                    ↓                                       ↓
        ┌────────────────────────┐              ┌────────────────────┐
        │ REDIRECT TO LOGIN      │              │ CHECK ROUTE        │
        │ /login?callbackUrl=... │              │ PERMISSIONS        │
        └────────────────────────┘              └────────────────────┘
                                                          ↓
                                                          ↓
                                              ┌─────────────────────┐
                                              │ Is /dashboard?      │
                                              └─────────────────────┘
                                                   ↓           ↓
                                              YES  ↓           ↓  NO
                                                   ↓           ↓
                                    ┌──────────────┘           └──────────────┐
                                    ↓                                         ↓
                    ┌────────────────────────────┐              ┌──────────────────────┐
                    │ REDIRECT TO ROLE DASHBOARD │              │ CHECK ROLE MATCH     │
                    │ /dashboard/{role}          │              │ Does user role match │
                    └────────────────────────────┘              │ required role?       │
                                                                └──────────────────────┘
                                                                     ↓           ↓
                                                                YES  ↓           ↓  NO
                                                                     ↓           ↓
                                                      ┌──────────────┘           └──────────────┐
                                                      ↓                                         ↓
                                          ┌──────────────────┐              ┌────────────────────────┐
                                          │ ALLOW ACCESS     │              │ REDIRECT TO USER'S     │
                                          │ Show Dashboard   │              │ OWN DASHBOARD          │
                                          └──────────────────┘              │ /dashboard/{userRole}  │
                                                                            └────────────────────────┘
```

---

## 🔐 JWT & Session Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LOGS IN                             │
│              (Credentials / Google / GitHub)                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NEXTAUTH PROCESSES LOGIN                      │
│                       (src/auth.js)                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
                    ┌─────────────────┐
                    │  Login Method?  │
                    └─────────────────┘
                         ↓         ↓
                Credentials       OAuth
                         ↓         ↓
                         ↓         └──────────────────┐
                         ↓                            ↓
            ┌────────────────────┐      ┌────────────────────────┐
            │ FETCH USER FROM DB │      │ CHECK IF USER EXISTS   │
            │ Get role from user │      │ IN DATABASE            │
            └────────────────────┘      └────────────────────────┘
                         ↓                            ↓
                         ↓                            ↓
                         ↓                  ┌─────────────────┐
                         ↓                  │ User Exists?    │
                         ↓                  └─────────────────┘
                         ↓                       ↓         ↓
                         ↓                  NO   ↓         ↓  YES
                         ↓                       ↓         ↓
                         ↓        ┌──────────────┘         └──────────────┐
                         ↓        ↓                                       ↓
                         ↓  ┌──────────────┐                  ┌────────────────────┐
                         ↓  │ CREATE USER  │                  │ FETCH USER ROLE    │
                         ↓  │ role: pass.. │                  │ FROM DATABASE      │
                         ↓  └──────────────┘                  └────────────────────┘
                         ↓        ↓                                       ↓
                         └────────┴───────────────────────────────────────┘
                                              ↓
                                              ↓
                              ┌───────────────────────────┐
                              │ JWT CALLBACK              │
                              │ Store: id, role in token  │
                              └───────────────────────────┘
                                              ↓
                                              ↓
                              ┌───────────────────────────┐
                              │ SESSION CALLBACK          │
                              │ Add: id, role to session  │
                              └───────────────────────────┘
                                              ↓
                                              ↓
                              ┌───────────────────────────┐
                              │ SESSION CREATED           │
                              │ { user: { id, name,       │
                              │   email, role } }         │
                              └───────────────────────────┘
                                              ↓
                                              ↓
                              ┌───────────────────────────┐
                              │ JWT TOKEN STORED          │
                              │ In HTTP-only cookie       │
                              └───────────────────────────┘
```

---

## 🎯 Role Check Flow (Client Component)

```
┌─────────────────────────────────────────────────────────────────┐
│              CLIENT COMPONENT RENDERS                            │
│              useRequireRole("admin")                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
                    ┌─────────────────┐
                    │ useSession()    │
                    │ Get session     │
                    └─────────────────┘
                              ↓
                              ↓
                    ┌─────────────────┐
                    │ Status?         │
                    └─────────────────┘
                         ↓         ↓
                   loading        authenticated
                         ↓         ↓
                         ↓         ↓
            ┌────────────┘         └────────────┐
            ↓                                   ↓
    ┌──────────────┐                  ┌─────────────────┐
    │ SHOW LOADING │                  │ CHECK ROLE      │
    │ SPINNER      │                  │ hasRole(admin)? │
    └──────────────┘                  └─────────────────┘
                                           ↓         ↓
                                      YES  ↓         ↓  NO
                                           ↓         ↓
                            ┌──────────────┘         └──────────────┐
                            ↓                                       ↓
                ┌──────────────────┐                  ┌──────────────────────┐
                │ RENDER COMPONENT │                  │ REDIRECT TO USER'S   │
                │ Show content     │                  │ DASHBOARD            │
                └──────────────────┘                  │ router.push(...)     │
                                                      └──────────────────────┘
```

---

## 🛡️ Server Component Protection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              SERVER COMPONENT RENDERS                            │
│              await requireRole("admin")                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
                    ┌─────────────────┐
                    │ await auth()    │
                    │ Get session     │
                    └─────────────────┘
                              ↓
                              ↓
                    ┌─────────────────┐
                    │ User exists?    │
                    └─────────────────┘
                         ↓         ↓
                    NO   ↓         ↓  YES
                         ↓         ↓
            ┌────────────┘         └────────────┐
            ↓                                   ↓
    ┌──────────────────┐            ┌─────────────────┐
    │ redirect("/login")│            │ CHECK ROLE      │
    │ Server redirect   │            │ role === admin? │
    └──────────────────┘            └─────────────────┘
                                         ↓         ↓
                                    YES  ↓         ↓  NO
                                         ↓         ↓
                          ┌──────────────┘         └──────────────┐
                          ↓                                       ↓
              ┌──────────────────┐                  ┌──────────────────────┐
              │ RETURN USER      │                  │ redirect(userDash)   │
              │ Continue render  │                  │ Server redirect      │
              └──────────────────┘                  └──────────────────────┘
```

---

## 📊 Access Matrix

```
┌──────────────┬─────────┬─────────┬───────────┬──────────────┐
│ Route        │ Admin   │ Rider   │ Passenger │ SupportAgent │
├──────────────┼─────────┼─────────┼───────────┼──────────────┤
│ /            │ ✅      │ ✅      │ ✅        │ ✅           │
│ /login       │ ✅      │ ✅      │ ✅        │ ✅           │
│ /dashboard   │ →admin  │ →rider  │ →pass..   │ →support     │
├──────────────┼─────────┼─────────┼───────────┼──────────────┤
│ /dash/admin  │ ✅      │ ❌→rider│ ❌→pass.. │ ❌→support    │
│ /dash/rider  │ ❌→admin│ ✅      │ ❌→pass.. │ ❌→support    │
│ /dash/pass.. │ ❌→admin│ ❌→rider│ ✅        │ ❌→support    │
│ /dash/supp.. │ ❌→admin│ ❌→rider│ ❌→pass.. │ ✅           │
└──────────────┴─────────┴─────────┴───────────┴──────────────┘

Legend:
✅ = Access Granted
❌ = Access Denied
→ = Redirected to
```

---

## 🔄 Session Lifecycle

```
┌─────────────┐
│ User Logs In│
└──────┬──────┘
       ↓
┌──────────────────┐
│ JWT Created      │
│ Expires: 30 days │
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Session Active   │
│ Role: admin      │
└──────┬───────────┘
       ↓
       ├─→ Page Navigation → Middleware checks role → Allow/Deny
       ├─→ API Request → Session validated → Allow/Deny
       ├─→ Component Render → Role checked → Show/Hide
       ↓
┌──────────────────┐
│ Session Expires  │
│ or User Logs Out │
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Redirect to Login│
└──────────────────┘
```

---

## 🎨 Visual Summary

```
                    ┌─────────────────────────┐
                    │   ONWAY PLATFORM        │
                    └───────────┬─────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   MIDDLEWARE LAYER    │
                    │   (Route Protection)  │
                    └───────────┬───────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
        │ Public Routes│ │Auth Routes│ │Protected    │
        │ /, /about    │ │ /login    │ │/dashboard/* │
        └──────────────┘ └───────────┘ └──────┬──────┘
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        │                     │                     │
                ┌───────▼──────┐    ┌────────▼────────┐   ┌───────▼──────┐
                │ Admin        │    │ Rider           │   │ Passenger    │
                │ Dashboard    │    │ Dashboard       │   │ Dashboard    │
                └──────────────┘    └─────────────────┘   └──────────────┘
                                              │
                                    ┌─────────▼──────────┐
                                    │ Support Agent      │
                                    │ Dashboard          │
                                    └────────────────────┘
```

This visual flow helps understand how the role-based protection works at every level of your application!
