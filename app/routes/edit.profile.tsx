import type { ActionFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { ProfileEditor } from "~/components/organisms/profile";
import { getAuthenticator, sessionStorage } from "~/auth/authenticator.server";
import { updateSensei } from "~/models/sensei";
import { graphql } from "~/graphql";
import { runQuery } from "~/lib/baql";
import type { ProfileStudentsQuery } from "~/graphql/graphql";
import { SubTitle } from "~/components/atoms/typography";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const profileStudentsQuery = graphql(`
  query ProfileStudents {
    students { studentId name }
  }
`)

export const meta: MetaFunction = () => [
  { title: "프로필 관리 | 몰루로그" },
];

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
  }

  const { data } = await runQuery<ProfileStudentsQuery>(profileStudentsQuery, {});
  if (!data?.students) {
    throw new Error("failed to load students");
  }

  return json({
    sensei,
    students: data.students,
  });
}

type ActionData = {
  error?: {
    username?: string;
    friendCode?: string;
    bio?: string;
  };
}

export const action: ActionFunction = async ({ request, context }) => {
  const env = context.cloudflare.env;
  const authenticator = getAuthenticator(env);
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
  }

  const formData = await request.formData();
  const getStringOrNull = (key: string) => formData.get(key) as string | null;
  sensei.username = formData.get("username") as string;
  sensei.bio = getStringOrNull("bio");
  sensei.profileStudentId = getStringOrNull("profileStudentId");
  sensei.friendCode = getStringOrNull("friendCode");

  if (!/^[a-zA-Z0-9_]{4,20}$/.test(sensei.username)) {
    return json<ActionData>({ error: { username: "4~20글자의 영숫자 및 _ 기호만 사용 가능합니다." } })
  }
  if (sensei.bio && sensei.bio.length > 100) {
    return json<ActionData>({ error: { bio: "100자 이하로 작성해주세요." } });
  }
  if (sensei.friendCode && !/^[A-Z]{8}$/.test(sensei.friendCode)) {
    return json<ActionData>({ error: { friendCode: "친구 코드는 알파벳 8글자에요." } });
  }

  const result = await updateSensei(env, sensei.id, sensei);
  if (result.error) {
    return json<ActionData>({ error: result.error });
  }

  const { getSession, commitSession } = sessionStorage(env);
  const session = await getSession(request.headers.get("cookie"));
  session.set(authenticator.sessionKey, sensei);
  return redirect(`/@${sensei.username}`, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function EditProfile() {
  const loaderData = useLoaderData<typeof loader>();
  const { sensei, students } = loaderData;

  return (
    <div className="pb-16 max-w-4xl">
      <SubTitle text="계정 정보" />
      <Form method="post">
        <ProfileEditor
          students={students}
          initialData={sensei}
          error={useActionData<ActionData>()?.error}
        />
      </Form>
    </div>
  );
}
