import { createRequestHandler } from "react-router";
import { Env } from "~/env.server";
import { syncRawStudents } from "~/models/student";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },

  async scheduled(event, env, ctx) {
    if (event.cron === "0 0 * * *") {
      await syncRawStudents(env);
    }
  },
} satisfies ExportedHandler<Env>;
