import { betterAuth } from "@/app/api/plugins/better-auth-plugin";
import { db } from "@/db/drizzle";
import { conversation, message } from "@/db/schema";
import { eq } from "drizzle-orm";
import Elysia, { status } from "elysia";
import z from "zod";

export const getMessages = new Elysia().use(betterAuth).get(
  "/messages/:conversationId",
  async ({ params: { conversationId }, user }) => {
    try {
      //find userID from current sesssion
      //make sure that userId is part of that conversationID

      const userId = user.id;

      if (!userId) {
        return status(401, {
          success: false,
          message: "User not authenticated",
        });
      }

      if (!conversationId) {
        return status(401, {
          success: false,
          message: "ConversationId not provided in params",
        });
      }

      const [UserpartOfConversation] = await db
        .select({
          senderId: conversation.senderId,
          receiverId: conversation.receiverId,
        })
        .from(conversation)
        .where(eq(conversation.id, conversationId))
        .limit(1);

      if (
        UserpartOfConversation.receiverId !== userId &&
        UserpartOfConversation.senderId !== userId
      ) {
        return status(403, {
          success: false,
          messsage: "User is not not part of this conversation",
        });
      }

      const fetchedMessages = await db
        .select({
          authorId: message.authorId,
          content: message.content,
          createdAt: message.createdAt,
        })
        .from(message)
        .where(eq(message.conversationId, conversationId));

      if (fetchedMessages.length === 0) {
        return status(404, {
          success: false,
          message: "No messages to fetch, start messaging",
        });
      }

      return status(200, {
        success: true,
        messages: "Fetched all messages",
        convoMessages: fetchedMessages,
      });
    } catch (error) {
      console.log(error);
      return status(500, {
        success: false, 
        messages: "failed to fetch messages, probably conversationId is not valid."
      })
    }
  },
  {
    auth: true,
    params: z.object({
      conversationId: z.string(),
    }),
    detail: {
      summary: "Fetch messages",
      tags: ["get-messages"],
    },
  },
);
