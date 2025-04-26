import type { LoaderFunctionArgs } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  return getAuthenticator(context.cloudflare.env).authenticate("google", request, {
    successRedirect: "/register",
    failureRedirect: "/",
  });
};
