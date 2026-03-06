
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password required");
                }

                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
                    const res = await fetch(`${apiUrl}/passenger/find?email=${credentials.email}`);
                    
                    if (!res.ok) {
                        throw new Error("User not found");
                    }

                    const user = await res.json();

                    // Handle both response formats
                    const userData = user.data || user;

                    if (!userData || !userData.password) {
                        throw new Error("Invalid credentials");
                    }

                    const isMatch = await bcrypt.compare(credentials.password, userData.password);
                    
                    if (!isMatch) {
                        throw new Error("Invalid password");
                    }

                    return {
                        id: userData._id || userData.id,
                        name: userData.name,
                        email: userData.email,
                        role: userData.role || "passenger"
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    throw new Error(error.message || "Authentication failed");
                }
            },
        }),
    ],

    session: { 
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    
    pages: { 
        signIn: "/login",
        error: "/login", // Redirect to login on error
    },

    // ✅ CRITICAL: Add trustHost for Vercel deployment
    trustHost: true,

    events: {
        async signIn({ user }) {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
                await fetch(`${apiUrl}/passenger/update-login`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: user.email }),
                });
            } catch (error) {
                console.error("Error updating last login:", error);
            }
        }
    },

    callbacks: {
        async signIn({ user, account, profile }) {
            // ✅ Handle OAuth providers (Google, GitHub)
            if (account?.provider === "google" || account?.provider === "github") {
                const { name, email, image } = user;

                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
                    
                    // Check if user exists
                    const checkRes = await fetch(`${apiUrl}/passenger/find?email=${email}`);
                    
                    if (!checkRes.ok) {
                        console.error("Error checking user existence:", checkRes.statusText);
                        return true; // Allow login even if check fails
                    }

                    const existingUser = await checkRes.json();

                    // If user doesn't exist, create new user
                    if (!existingUser) {
                        console.log(`Creating new user for ${email} via ${account.provider}`);
                        
                        const createRes = await fetch(`${apiUrl}/passenger`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                name: name || email.split('@')[0], // Fallback to email username
                                email,
                                image: image || "",
                                role: "passenger", // Default role
                                authProvider: account.provider,
                                createdAt: new Date().toISOString(),
                                lastLogin: new Date().toISOString(),
                            }),
                        });

                        if (!createRes.ok) {
                            const errorData = await createRes.json().catch(() => ({}));
                            console.error("Failed to create user:", errorData);
                            // Still allow login even if DB save fails
                        } else {
                            console.log(`✅ User created successfully for ${email}`);
                        }
                    } else {
                        console.log(`User ${email} already exists, skipping creation`);
                    }
                    
                    return true;
                } catch (error) {
                    console.error("Error during OAuth user sync:", error);
                    // Allow login to proceed even if DB sync fails
                    return true;
                }
            }
            
            // ✅ Handle Credentials provider
            // User is already validated in authorize() function
            return true;
        },
        
        async jwt({ token, user, account, trigger }) {
            // Initial sign in - user object is available
            if (user) {
                token.id = user.id;
                token.role = user.role || "passenger";
                token.image = user.image;
            }
            
            // For OAuth providers, fetch latest data from database
            if (account?.provider === "google" || account?.provider === "github") {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
                    const res = await fetch(`${apiUrl}/passenger/find?email=${token.email}`);
                    
                    if (res.ok) {
                        const userData = await res.json();
                        if (userData) {
                            token.id = userData._id || userData.id;
                            token.role = userData.role || "passenger";
                            token.image = userData.image || token.picture;
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data in JWT callback:", error);
                    // Keep existing token data if fetch fails
                }
            }
            
            // Handle session updates (when user data changes)
            if (trigger === "update") {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
                    const res = await fetch(`${apiUrl}/passenger/find?email=${token.email}`);
                    
                    if (res.ok) {
                        const userData = await res.json();
                        if (userData) {
                            token.role = userData.role || token.role;
                            token.image = userData.image || token.image;
                        }
                    }
                } catch (error) {
                    console.error("Error updating token:", error);
                }
            }
            
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role || "passenger";
                session.user.image = token.image || session.user.image;
            }
            return session;
        },
    },

    // ✅ Enable debug logging in development
    debug: process.env.NODE_ENV === 'development',
});