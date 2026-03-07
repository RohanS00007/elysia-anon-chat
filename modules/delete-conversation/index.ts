import { betterAuth } from "@/app/api/plugins/better-auth-plugin";
import { db } from "@/db/drizzle";
import { conversation } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import Elysia from "elysia";
import * as z from "zod";
import { DeleteConvoModels } from "./model";

export const deleteConvoController = new Elysia().use(betterAuth).delete(
  "/delete/:conversationId",
  async ({ params: { conversationId }, user, status }) => {
    try {
      const userId = user.id;

      if (!userId) {
        return status(401, {
          success: false,
          message: "Please authenticate yourself first.",
        });
      }

      if (!conversationId) {
        return status(400, {
          success: false,
          message: "Please provide a valid conversationId",
        });
      }

      // Check if conversation exists at all
      const [conversationRow] = await db
        .select({ id: conversation.id })
        .from(conversation)
        .where(eq(conversation.id, conversationId));

      if (!conversationRow) {
        return status(404, {
          success: false,
          message: "No such conversation exist in database",
        });
      }

      // Only deletes if the user is the owner (senderId check).
      // If the row isn't returned, the user isn't the owner → 403.
      const [deletedConvo] = await db
        .delete(conversation)
        .where(
          and(
            eq(conversation.id, conversationId),
            eq(conversation.senderId, userId),
          ),
        )
        .returning();

      if (!deletedConvo) {
        return status(403, {
          success: false,
          message: "You are not authorized to delete this conversation.",
        });
      }

      return status(200, {
        success: true,
        message: "Deleted the conversation successfully",
      });

    } catch (error) {
      console.log(error);
      return status(500, {
        success: false,
        message: "Internal Server Error: Failed to delete conversation.",
      });
    }
  },
  {
    auth: true,
    params: z.object({
      conversationId: z.string(),
    }),
    detail: {
      summary: "Endpoint for deleting a conversation",
      tags: ["delete-conversation"],
    },
    response: {
      200: DeleteConvoModels.successApiResponse,
      400: DeleteConvoModels.failedApiResponse,
      401: DeleteConvoModels.failedApiResponse,
      403: DeleteConvoModels.failedApiResponse,
      404: DeleteConvoModels.failedApiResponse,
      500: DeleteConvoModels.failedApiResponse,
    },
  },
);

// Api is not working as is supposed it is giving 200 response even though the user deleting the conversation is not part of conversation, good thing tho it is not actually deleting the conversation row, 

// it actually only deletes when the actual user who started the conversation tries to delete it

// so the problem here lies in wrong response management