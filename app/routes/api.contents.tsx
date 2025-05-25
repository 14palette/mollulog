import { type ActionFunctionArgs, redirect } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { setMemo } from "~/models/content";
import { favoriteStudent, unfavoriteStudent } from "~/models/favorite-students";

export type ActionData = {
  memo?: {
    contentUid: string;
    body: string;
  };
  favorite?: {
    contentUid: string;
    studentId?: string;  // [DEPRECATED 2025-05-25] replaced by `studentUid`
    studentUid?: string;
    favorited: boolean;
  };
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect("/unauthorized");
  }

  const actionData = await request.json<ActionData>();
  if (actionData.memo) {
    await setMemo(env, currentUser.id, actionData.memo.contentUid, actionData.memo.body);
  }
  if (actionData.favorite) {
    if (actionData.favorite.favorited) {
      await favoriteStudent(env, currentUser.id, (actionData.favorite.studentUid ?? actionData.favorite.studentId)!, actionData.favorite.contentUid);
    } else {
      await unfavoriteStudent(env, currentUser.id, (actionData.favorite.studentUid ?? actionData.favorite.studentId)!, actionData.favorite.contentUid);
    }
  }

  return null;
};
