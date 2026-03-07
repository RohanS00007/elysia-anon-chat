import { betterAuth } from "@/app/api/plugins/better-auth-plugin";
import { db } from "@/db/drizzle";
import { conversation, message } from "@/db/schema";
import Elysia from "elysia";
import * as z from "zod";
import { ReplyBackModels } from "./model";
import { eq } from "drizzle-orm";

export const replyBack = new Elysia().use(betterAuth).post(
  "/reply-message",
  async ({ body: { conversationId, messageContent }, user, status }) => {
    try {
      if (!conversationId || !messageContent) {
        return status(400, {
          success: false,
          message: "Bad Request: Payload missing required data",
        });
      }

      const currentUserId = user.id;

      if (!currentUserId) {
        return status(401, {
          success: false,
          message: "Only authenticated users can reply",
        });
      }

      // Fetch the conversation by its ID to get both participants
      const [existingConversation] = await db
        .select({
          senderId: conversation.senderId,
          receiverId: conversation.receiverId,
        })
        .from(conversation)
        .where(eq(conversation.id, conversationId))
        .limit(1);

      if (!existingConversation) {
        return status(404, {
          success: false,
          message: "Conversation not found.",
        });
      }

      // Allow reply only if the current user is either the sender or the receiver
      const isPartOfConversation =
        currentUserId === existingConversation.senderId ||
        currentUserId === existingConversation.receiverId;

      if (!isPartOfConversation) {
        return status(403, {
          success: false,
          message: "You are not part of this conversation.",
        });
      }

      await db
        .insert(message)
        .values({
          id: crypto.randomUUID(),
          conversationId: conversationId,
          authorId: currentUserId,
          content: messageContent,
          isRead: false,
        })
        .returning();

      return status(201, {
        success: true,
        message: "Message sent successfully.",
      });
    } catch (error) {
      console.log(error);
      return status(500, {
        success: false,
        message: "Internal Server Error: Failed to send messages, try again",
      });
    }
  },
  {
    auth: true,
    body: z.object({
      messageContent: z.string(),
      conversationId: z.uuid(),
    }),
    detail: {
      summary: "Endpoint for replying to messages",
      tags: ["reply-back-to-messages"],
    },
    response: {
      201: ReplyBackModels.successApiResponse,
      400: ReplyBackModels.failedApiResponse,
      401: ReplyBackModels.failedApiResponse,
      403: ReplyBackModels.failedApiResponse,
      404: ReplyBackModels.failedApiResponse,
      500: ReplyBackModels.failedApiResponse,
    },
  },
);