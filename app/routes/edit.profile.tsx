import type { ActionFunction, LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { ProfileEditor } from "~/components/organisms/profile";
import { getAuthenticator, sessionStorage } from "~/auth/authenticator.server";
import { getSenseiById, updateSensei } from "~/models/sensei";
import { SubTitle } from "~/components/atoms/typography";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getAllStudents } from "~/models/student";

dayjs.extend(utc);
dayjs.extend(timezone);

export const meta: MetaFunction = () => [
  { title: "프로필 관리 | 몰루로그" },
];

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
  }

  const senseiData = (await getSenseiById(env, sensei.id))!;
  return {
    sensei: {
      username: senseiData.username,
      bio: senseiData.bio,
      profileStudentId: senseiData.profileStudentId,
      friendCode: senseiData.friendCode,
    },
    allStudents: (await getAllStudents(env)).map((student) => ({
      uid: student.id,
      name: student.name,
    })),
  };
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
    return { error: { username: "4~20글자의 영숫자 및 _ 기호만 사용 가능합니다." } };
  }
  if (sensei.bio && sensei.bio.length > 100) {
    return { error: { bio: "100자 이하로 작성해주세요." } };
  }
  if (sensei.friendCode && !/^[A-Z]{8}$/.test(sensei.friendCode)) {
    return { error: { friendCode: "친구 코드는 알파벳 8글자에요." } };
  }

  const result = await updateSensei(env, sensei.id, sensei);
  if (result.error) {
    return { error: result.error };
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
  const { sensei, allStudents } = loaderData;

  return (
    <div className="pb-16 max-w-4xl">
      <SubTitle text="계정 정보" />
      <Form method="post">
        <ProfileEditor
          students={allStudents}
          initialData={sensei}
          error={useActionData<ActionData>()?.error}
        />
      </Form>
    </div>
  );
}
