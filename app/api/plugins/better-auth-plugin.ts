import { auth } from "@/lib/auth";
import Elysia from "elysia";

//betterAuth Middleware --> baseURL/api/auth/get-session etc
export const betterAuth = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({ 
    auth: {
      // beforeHandle: () => console.log("Auth delivered"),
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });
        if (!session) return status(401);
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
