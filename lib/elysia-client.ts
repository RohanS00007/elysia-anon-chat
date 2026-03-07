import { treaty } from "@elysiajs/eden";
import type { App } from "@/app/api/[[...slug]]/route";

const baseUrl =
    typeof window === "undefined"
        ? process.env.NEXT_BETTER_AUTH_URL ?? "http://localhost:3000"
        : window.location.origin;

// Explicitly annotate the client type so consumers get full route inference.
type ApiClient = ReturnType<typeof treaty<App>>["api"];

// `.api` corresponds to the Elysia app's `/api` prefix.
export const client: ApiClient = treaty<App>(baseUrl).api;




// import { treaty } from '@elysiajs/eden'
// import { app, type App } from "@/app/api/[[...slug]]/route";


// // .api to enter /api prefix
// export const client =
//   // process is defined on server side and build time
//   typeof process !== 'undefined'
//     ? treaty(app).api
//     : treaty<App>('localhost:3000').api