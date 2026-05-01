import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: '/auth/login',
  },
  providers: []
} satisfies NextAuthConfig;