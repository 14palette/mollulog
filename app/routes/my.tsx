import type { LoaderFunction } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/auth/authenticator.server";

export const loader: LoaderFunction = async ({ request, context }) => {
  const sensei = await getAuthenticator(context.cloudflare.env).isAuthenticated(request);
  if (sensei) {
    const url = new URL(request.url);
    return redirect(`/@${sensei.username}/${url.searchParams.get("path") ?? ""}`);
  } else {
    return redirect("/unauthorized");
  }
}
