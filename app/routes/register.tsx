import type { ActionFunction, LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Title } from "~/components/atoms/typography";
import { updateSensei } from "~/models/sensei";
import { getAuthenticator, redirectTo, sessionStorage } from "~/auth/authenticator.server";
import { ProfileEditor } from "~/components/organisms/profile";
import type { ProfileStudentsQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { profileStudentsQuery } from "./edit.profile";

export const meta: MetaFunction = () => [
  { title: "선생님 등록 | 몰루로그" },
];

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const sensei = await getAuthenticator(context.cloudflare.env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
  } else if (sensei.active) {
    return redirect(redirectTo(request) ?? `/@${sensei.username}`);
  }

  const { data } = await runQuery<ProfileStudentsQuery>(profileStudentsQuery, {});
  if (!data?.students) {
    throw new Error("failed to load students");
  }

  return { students: data.students };
}

type ActionData = {
  error?: { username?: string };
}

export const action: ActionFunction = async ({ request, context }) => {
  const env = context.cloudflare.env;
  const authenticator = getAuthenticator(env);
  const sensei = await authenticator.isAuthenticated(request);
  const redirectPath = redirectTo(request) ?? `/@${sensei?.username}`;
  if (!sensei) {
    return redirect("/unauthorized");
  } else if (sensei.active) {
    return redirect(redirectPath);
  }

  const formData = await request.formData();
  sensei.active = true;
  sensei.username = formData.get("username") as string;
  sensei.profileStudentId = formData.has("profileStudentId") ? formData.get("profileStudentId") as string : null;
  if (!/^[a-zA-Z0-9_]{4,20}$/.test(sensei.username)) {
    return { error: { username: "4~20글자의 영숫자 및 _ 기호만 사용 가능합니다." } };
  }

  await updateSensei(env, sensei.id, sensei);

  const { getSession, commitSession } = sessionStorage(env);
  const session = await getSession(request.headers.get("cookie"));
  session.set(authenticator.sessionKey, sensei);
  return redirect(redirectPath, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function Register() {
  const { students } = useLoaderData<typeof loader>();
  return (
    <>
      <Title text="기본 정보 설정" />
      <Form method="post">
        <ProfileEditor students={students} error={useActionData<ActionData>()?.error} />
      </Form>
    </>
  );
}
