 
import { type UnwrapSchema } from "elysia";
import * as z from "zod";

export const ApiResponseModels = {
  failedApiResponse: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
};

// Optional if you want to get the type of the model
// type CustomBody = UnwrapSchema<typeof models.customBody>

// Or make the entire object as type
export type ApiResponseModels = {
  [k in keyof typeof ApiResponseModels]: UnwrapSchema<
    (typeof ApiResponseModels)[k]
  >;
};
