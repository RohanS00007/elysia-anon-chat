/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { betterAuth } from "../plugins/better-auth-plugin";
import { messageController } from "@/modules/messages/message.index";
import { getMessages } from "@/modules/get-messages/index";
import { getConversation } from "@/modules/get-conversation";
import { replyBack } from "@/modules/reply-back";
import { deleteConvoController } from "@/modules/delete-conversation";
import { blockAccountController } from "@/modules/block-account";

//openAPI - API Documentation code
let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());

export const OpenAPI = {
  getPaths: (prefix = "/api/auth") =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);

      for (const path of Object.keys(paths)) {
        const key = prefix + path;
        reference[key] = paths[path];

        for (const method of Object.keys(paths[path])) {
          const operation = (reference[key] as any)[method];

          operation.tags = ["Better Auth"];
        }
      }

      return reference;
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;

export const app = new Elysia({ prefix: "/api" })
  .mount(auth.handler)
  .use(betterAuth)
  .get("/user", ({ user, session }) => ({ user, session }), {
    auth: true,
    detail: {
      summary: "Endpoint for user-session",
      tags: ["UserSession"],
    },
  })
  .use(messageController)
  .use(getMessages)
  .use(getConversation)
  .use(replyBack)
  .use(deleteConvoController)
  .use(blockAccountController)
  .use(
    cors({
      origin: process.env.BETTER_AUTH_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    }),
  );

export type App = typeof app;

export const GET = app.fetch;
export const POST = app.fetch;
export const DELETE = app.fetch;
export const PUT = app.fetch;
export const PATCH = app.fetch;
export const OPTIONS = app.fetch;
