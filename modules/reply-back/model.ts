// ✅ Do
import { type UnwrapSchema } from "elysia";
import * as z from "zod";
// import { messageSelectSchema } from "@/db/schema";

export const ReplyBackModels = {
  failedApiResponse: z.object({
    success: z.boolean(),
    message: z.string(),
  }),

    successApiResponse : z.object({
    success: z.boolean(),
    message: z.literal("Message sent successfully."),
    // data: messageSelectSchema
  }),
}

// Optional if you want to get the type of the model
// type CustomBody = UnwrapSchema<typeof models.customBody>

// Or make the entire object as type
export type ReplyBackModelsType = {
  [k in keyof typeof ReplyBackModels]: UnwrapSchema<
    (typeof ReplyBackModels)[k]
  >;
};
