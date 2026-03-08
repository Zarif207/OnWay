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
        }),
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
        Credentials({
            name: "Credentials",
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    // NEXT_PUBLIC_API_URL jodi local-e thake kintu Vercel-e API_URL thake
                    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

                    const res = await fetch(`${apiUrl}/passenger/find?email=${credentials.email}`, {
                        cache: 'no-store'
                    });

                    // 404 ba onno error check
                    if (!res.ok) {
                        console.error("Backend response error:", res.status);
                        return null;
                    }

                    const user = await res.json();

                    // Jodi user na thake ba password na thake (Social login user)
                    if (!user || !user.password) {
                        return null;
                    }

                    const isMatch = await bcrypt.compare(credentials.password, user.password);
                    if (!isMatch) return null;

                    return {
                        id: user._id?.toString() || user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role || "passenger"
                    };
                } catch (error) {
                    console.error("Auth Exception:", error);
                    return null;
                }
            },
        }),
    ],

    session: { strategy: "jwt" },
    pages: { signIn: "/login" },

    events: {
        async signIn({ user }) {
            try {
                const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
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
                const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

                try {
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

                        if (!saveRes.ok) console.error("Failed to save social user");
                    }
                    return true;
                } catch (error) {
                    console.error("Social login sync error:", error);
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
});

