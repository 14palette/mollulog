import type { LoaderFunctionArgs } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { migrateRecruitedStudents } from "~/models/recruited-student";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const me = await getAuthenticator(env).isAuthenticated(request);
  if (!me || me.role !== "admin") {
    return new Response("unauthorized", { status: 401 });
  }

  await migrateRecruitedStudents(env);

  return new Response("ok", { status: 200 });
}
