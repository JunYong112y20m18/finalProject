/*import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
// @ts-ignore

const params = {
    prompt: "consent",
    access_type: "offline",
    response_type: "code",
};
const authOptions = {
    providers: [
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            authorization: {
                params: params,
            },
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: params,
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if(user) {
                token.role = user.role;
            }
            if(account) {
                token.provider = account.provider;
            }
            return token;
        },
        async session({ session, token }) {
            if(token && session?.user) {
                session.user.role = token.role;
                session.user.id = token.sub;
                session.user.provider = token.provider;
            }
            return session;
        },
    },
};

export default authOptions;*/

import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import prisma from "@/lib/prisma";

const googleParams = {
    prompt: "consent",
    access_type: "offline",
    response_type: "code",
    scope: "openid email profile",
};

const authOptions = {
    providers: [
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                    scope: "read:user user:email",
                },
            },
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: { googleParams },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                if (!user.email) {
                    return false;
                }

                const ownerEmail = " ";

                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email }
                });

                if (existingUser && existingUser.role) {
                    return true;
                }

                const role = user.email === ownerEmail ? "OWNER" : "CUSTOMER";

                await prisma.user.upsert({
                    where: { email: user.email },
                    update: { role },
                    create: {
                        email: user.email,
                        name: user.name,
                        role,
                    },
                });

                return true;
            } catch (error) {
                console.error("Sign in error:", error);
                return true; // 允許登入，即使發生錯誤
            }
        },

        async jwt({ token, user, account }) {
            if (user) {
                token.role = user.role;
            }
            if (account) {
                token.provider = account.provider;
            }
            return token;
        },

        async session({ session, token }) {
            if (token && session?.user) {
                session.user.role = token.role;
                session.user.id = token.sub;
                session.user.provider = token.provider;
            }
            return session;
        },
    },
};

export default authOptions;

