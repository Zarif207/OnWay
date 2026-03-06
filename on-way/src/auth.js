
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
        async signIn({ user, account }) {
            if (account.provider === "google" || account.provider === "github") {
                const { name, email, image } = user;

                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
                    const res = await fetch(`${apiUrl}/passenger/find?email=${email}`);

                    if (res.status === 404) {
                        const saveRes = await fetch(`${apiUrl}/passenger`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                name,
                                email,
                                image,
                                role: "passenger",
                                authProvider: account.provider
                            }),
                        });

                        if (!saveRes.ok) {
                            console.error("Failed to save user to DB");
                        }
                    }
                    return true;
                } catch (error) {
                    console.error("Error during social login sync:", error);
                    return true;
                }
            }
            return true;
        },
        
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },

    // ✅ Enable debug logging in development
    debug: process.env.NODE_ENV === 'development',
});