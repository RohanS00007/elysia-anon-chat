import { type UnwrapSchema } from 'elysia'
import * as z from "zod";

const MessageModel = {
    
	 
} as const

// Optional, cast all model to TypeScript type
export type AuthModel = {
	[k in keyof typeof MessageModel]: UnwrapSchema<typeof MessageModel[k]>
}