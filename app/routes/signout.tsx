import type { LoaderFunction } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";

export const loader: LoaderFunction = async ({ request, context }) => {
  return getAuthenticator(context.cloudflare.env).logout(request, { redirectTo: "/" });
};
