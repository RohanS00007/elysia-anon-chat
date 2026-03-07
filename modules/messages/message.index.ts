import { betterAuth } from "@/app/api/plugins/better-auth-plugin";
import { db } from "@/db/drizzle";
import Elysia from "elysia";
import * as z from "zod";
import { conversation, message, user as userTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

//api end point for sending the first message to anyone
// there should be no concept of existing conversation, every conversation will be unique for a message sender

export const messageController = new Elysia().use(betterAuth).post(
  "/user/send/message",
  async ({
    body: { messageContent, username }, 
    user: currentUser,
    status,
  }) => {

    if (!username || !messageContent) {
      return status(400, {
        success: false,
        message: "Username and messageContent not found",
      });
    }

    const senderId = currentUser.id;

    // find receiverId using the username

    const [receiver] = await db
      .select({
        id: userTable.id,
        isAcceptingMessages: userTable.isAcceptingMessages,
      })
      .from(userTable)
      .where(eq(userTable.username, username))
      .limit(1);

    if (!receiver) {
      return status(404, {
        success: false,
        message: "Receiver doesn't exist",
      });
    }

    if (!receiver.isAcceptingMessages) {
      return status(403, {
        success: false,
        message: "User is not accepting messages right now",
      });
    }

    if (senderId === receiver.id) {
      return status(400, {
        success: false,
        message: "Cannot send message to yourself",
      });
    }

    const receiverId = receiver.id;

    // Reuse existing conversation only if the current user was the one who started it.
    // If Y messages X first, and then X messages Y, a new conversation is created for X → Y.
    let conversationId: string;

    const [existingConversation] = await db
      .select({ id: conversation.id })
      .from(conversation)
      .where(
        and(
          eq(conversation.senderId, senderId),
          eq(conversation.receiverId, receiverId)
        )
      )
      .limit(1);

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      // Create new conversation
      const [newConversation] = await db
        .insert(conversation)
        .values({
          id: crypto.randomUUID(),
          senderId: senderId,
          receiverId: receiverId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: conversation.id });

      conversationId = newConversation.id;
    }

    const [newMessage] = await db
      .insert(message)
      .values({
        id: crypto.randomUUID(),
        conversationId,
        authorId: senderId,
        content: messageContent,
        isRead: false,
        createdAt: new Date(),
      })
      .returning();

    return status(201, {
      success: true,
      message: "Message sent successfully",
      data: {
        messageId: newMessage.id,
        conversationId: conversationId,
      },
    });
  },
  {
    auth: true,
    body: z.object({
      messageContent: z.string(),
      username: z.string(), 
    }),
    detail: {
      summary: "Endpoint for starting a conversation",
      tags: ["start-conversation"],
    },
  },
);