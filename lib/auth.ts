import { betterAuth, BetterAuthOptions } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import  { schema } from "@/db/schema";
import { db } from "@/db/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  admin as adminPlugin,
  customSession,
  organization,
  lastLoginMethod,
  openAPI,
  username,
} from "better-auth/plugins";
import { APIError, createAuthMiddleware } from "better-auth/api";


const options = {
  appName: "Elysia Next",  
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  // basePath: "/api/",

  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins: [process.env.BETTER_AUTH_URL as string],

  user: {
    additionalFields: {
      isPremiumUser: {
        type: "boolean",
        required: true,
        defaultValue: false,
        returned: true,
      },
      isAcceptingMessages: {
        type: "boolean",
        required: true, 
        defaultValue: true, 
        returned: true, 
      }
    },
  },

  advanced: {
    database: {
      generateId: "uuid",
    }
  },

  emailAndPassword: {
    enabled: true,
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.emailVerified) {
            const username = user.email.split("@")[0];
            return { data: { ...user, username } };
          }
          return { data: user };
          // Return user even if email not verified
        },
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        if (!ctx.body?.email.endsWith("@gmail.com")) {
          throw new APIError("BAD_REQUEST", {
            message: "Email must end with @gmail.com",
          });
        }
      }
    }),
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: process.env.GOOGLE_REDIRECT_URI as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      redirectURI: process.env.GITHUB_REDIRECT_URI as string,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds: 5 min
    },
  },

  experimental: { joins: true },

  plugins: [
    adminPlugin({
      defaultRole: "user",
      allowImpersonatingAdmins: false,
    }),
    openAPI(),
    organization({
      teams: {
        enabled: true,
        allowRemovingAllTeams: false,
      },
    }),
    lastLoginMethod({
      storeInDatabase: true,
    }),
    username({
      minUsernameLength: 8,
      maxUsernameLength: 20,
      usernameValidator: (username) => {
        if (username === "admin") return false;
        return true;
      },
    }),
    nextCookies(),
  ],
} satisfies BetterAuthOptions;



export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }) => {
      return {
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
          email: user.email,
          emailVerified: user.emailVerified,
          username: user.username,
          lastLoginMethod: user.lastLoginMethod,
          isAcceptingMessages: user.isAcceptingMessages,
          role: user.role,
          isPremiumuser: user.isPremiumUser,
          banned: user.banned,
          
        },
        session: {
          ipAddress: session.ipAddress,
          expiresAt: session.expiresAt,
          token: session.token,
          impersonatedBy: session.impersonatedBy,
        },
      };
    }, options),
  ],
});

export type UserSession = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session.session;


