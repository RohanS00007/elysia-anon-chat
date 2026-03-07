import { betterAuth } from "@/app/api/plugins/better-auth-plugin";
import { db } from "@/db/drizzle";
import { blockedAccounts } from "@/db/schema";
import Elysia from "elysia";
import * as z from "zod";

// An Api ednpoint for blocking user, for that we just need a userId of a user that we want to block, and we will create a new table out of it.

export const blockAccountController = new Elysia().use(betterAuth).post(
  "/block/:userId",
  async ({ params: { userId }, user, status }) => {
    try {
      const currentUserId = user.id;

      if (!currentUserId) {
        return status(401, {
          success: false,
          message: "Not authenticated",
        });
      }

      if (!userId) {
        return status(404, {
          success: false,
          message: "Params object is missing userId that you want to block",
        });
      }

      // const [blockedAccount] =
      await db
        .insert(blockedAccounts)
        .values({
          id: crypto.randomUUID(),
          blockedBy: currentUserId,
          blocked: userId,
        })
        .returning({ blockedAcc: blockedAccounts.blocked });

      return status(200, {
        success: true,
        message: "Blocked user account successfully",
      });
    } catch (error) {
      console.error(error);
      return status(500, {
        success: false,
        message: "Internal server error, failed to blocked the user.",
      });
    }
  },
  {
    auth: true,
    params: z.object({
      userId: z.string(),
    }),
    detail: {
      summary: "Endpoint for blocking user accounts", 
      tags: ["block-account"]
    }
  },
);
