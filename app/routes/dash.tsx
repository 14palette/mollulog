import { type MetaFunction, redirect, type LoaderFunctionArgs } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";

export const meta: MetaFunction = () => {
  return [
    { title: "관리자 화면 | 몰루로그" },
  ];
};

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const sensei = await getAuthenticator(context.cloudflare.env).isAuthenticated(request);
  if (!sensei || sensei.role !== "admin") {
    return redirect("/");
  }

  return {
    sensei,
  };
};
