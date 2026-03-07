import { betterAuth } from "@/app/api/plugins/better-auth-plugin";
import { db } from "@/db/drizzle";
import { conversation } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import Elysia from "elysia";
import * as z from "zod";
import { ApiResponseModels } from "./model";

export const getConversation = new Elysia().use(betterAuth).get(
  "/conversations",
  async ({ user, status }) => {
    try {
        const userId = user.id;
    if (!userId) {
      return status(401, {
        success: false,
        message: "Please authenticate yourself first.",
      });
    }

    const activeConversation = await db
      .select({ id: conversation.id })
      .from(conversation)
      .where(
        or(
          eq(conversation.receiverId, userId),
          eq(conversation.senderId, userId),
        ),
      );
    
    if(activeConversation.length === 0){
        return status(404, {
            success: false, 
            message: "No active conversations to fetch, start a conversation now."
        })
    }
    return status(200, {
        success: true, 
        message: "Fetched all active conversations.", 
        data: activeConversation
    }) 
    } catch (error) {
        console.log(error)
        return status(500, {
            success: false, 
            message: "Internal server error, failed to fetch all active conversations"
        }) 
    } 
  },
  {
    auth: true,
    detail:{
        summary: "Fetch all active conversations",
        tags: ["get-conversations"]
    },
    response: {
      200: z.object({
        success: z.boolean(), 
        message: z.string(), 
        data: z.array(z.object({
          id: z.string()
        }))
      }), 
      401: ApiResponseModels.failedApiResponse,
      404: ApiResponseModels.failedApiResponse, 
      500:ApiResponseModels.failedApiResponse, 
    }
  },
);
