
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

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/passenger/find?email=${credentials.email}`);
                const user = await res.json();

                if (!user || !user.password) {
                    throw new Error("User not found!");
                }

                const isMatch = await bcrypt.compare(credentials.password, user.password);
                if (!isMatch) {
                    throw new Error("Invalid password!");
                }

                return {
                    id: user._id || user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role || "passenger"
                };
            },
        }),
    ],

    session: { strategy: "jwt" },
    pages: { signIn: "/login" },

    events: {
        async signIn({ user }) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/passenger/update-login`, {
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
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/passenger/find?email=${email}`);

                    if (res.status === 404) {
                        const saveRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/passenger`, {
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
});