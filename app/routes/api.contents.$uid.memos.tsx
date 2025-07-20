import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { getContentMemos, setMemo } from "~/models/content";

export const loader = async ({ request, params, context }: LoaderFunctionArgs) => {
  const contentUid = params.uid;
  if (!contentUid) {
    throw new Response("Content UID is required", { status: 400 });
  }

  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  const memos = await getContentMemos(env, contentUid, currentUser?.id);
  return memos.map((memo) => ({
    uid: memo.uid,
    body: memo.body,
    visibility: memo.visibility,
    sensei: {
      me: currentUser?.username === memo.sensei.username,
      username: memo.sensei.username,
      profileStudentId: memo.sensei.profileStudentId,
    },
  }));
};

export type ActionData = {
  body: string,
  visibility: "private" | "public",
};

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
  const contentUid = params.uid;
  if (!contentUid) {
    throw new Response("Content UID is required", { status: 400 });
  }

  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect("/unauthorized");
  }

  const actionData = await request.json<ActionData>();
  await setMemo(env, currentUser.id, contentUid, actionData.body, actionData.visibility);
};
