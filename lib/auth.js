import CredentialsProvider from "next-auth/providers/credentials";
import { getSupabase } from "./supabase";
import { prisma } from "@/lib/prisma";
import NextAuth from "next-auth";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const supabase = getSupabase();
                const { data: { user }, error } = await supabase.auth.signInWithPassword({
                    email: credentials.email,
                    password: credentials.password,
                });

                if (error || !user) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.full_name,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
};

export const { auth, signIn, signOut } = NextAuth(authOptions); 