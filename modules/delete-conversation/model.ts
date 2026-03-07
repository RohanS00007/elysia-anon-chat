
// import { conversation } from "@/db/schema";
// import { createSelectSchema } from "drizzle-zod";
import z from "zod";

// const conversationSelectSchema = createSelectSchema(conversation);

// const conversationSchema = z.object({
//   ...conversationSelectSchema.shape,
// });

export const DeleteConvoModels = {
  failedApiResponse: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  successApiResponse: z.object({
    success: z.boolean(),
    message: z.string(),
    
  }),
};

export type SuccessApiResponse = z.infer<typeof DeleteConvoModels.successApiResponse>;

export type DeleteConvoModelsType = {
  [k in keyof typeof DeleteConvoModels]: z.infer<(typeof DeleteConvoModels)[k]>;
};
