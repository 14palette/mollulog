import type { LoaderFunctionArgs } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { migrateFavoriteCounts } from "~/models/favorite-students";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const me = await getAuthenticator(env).isAuthenticated(request);
  if (!me || (me.username !== env.SUPERUSER_NAME)) {
    return new Response("unauthorized", { status: 401 });
  }

  await migrateFavoriteCounts(env);

  return new Response("ok", { status: 200 });
}
