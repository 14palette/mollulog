import type { LoaderFunctionArgs } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const me = await getAuthenticator(env).isAuthenticated(request);
  if (!me || (me.username !== env.SUPERUSER_NAME)) {
    return new Response("unauthorized", { status: 401 });
  }

  await env.KV_USERDATA.list({ prefix: "cache:" }).then((keys) => {
    keys.keys.forEach((key) => env.KV_USERDATA.delete(key.name));
  });

  return new Response("ok", { status: 200 });
}
