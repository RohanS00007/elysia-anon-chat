import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";
import {
  inferAdditionalFields,
  usernameClient,
  lastLoginMethodClient,
  adminClient,
  organizationClient,
  customSessionClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    adminClient(),
    customSessionClient<typeof auth>(),
    organizationClient({
      teams: {
        enabled: true,
      },
    }),
    lastLoginMethodClient(),
    inferAdditionalFields<typeof auth>(),
  ],
  // baseURL: process.env.BETTER_AUTH_URL as string,
});

export type UserSession = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
export type Session = typeof authClient.$Infer.Session.session;

