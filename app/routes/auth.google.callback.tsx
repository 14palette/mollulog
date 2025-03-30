import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/auth/authenticator.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  return getAuthenticator(context.cloudflare.env).authenticate("google", request, {
    successRedirect: "/register",
    failureRedirect: "/",
  });
};
