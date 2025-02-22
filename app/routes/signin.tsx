import type { ActionFunction, MetaFunction } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/auth/authenticator.server";
import { SignIn } from "~/components/molecules/auth";

export const action: ActionFunction = async ({ request, context }) => {
  return getAuthenticator(context.cloudflare.env).authenticate("google", request);
};

export const meta: MetaFunction = () => {
  return [
    { title: "로그인 | 몰루로그" },
    { description: "로그인하고 학생 정보, 미래시 계획을 관리해보세요." },
  ];
};

export default function SignInView() {
  return (
    <>
      <SignIn />
    </>
  );
}
