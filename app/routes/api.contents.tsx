import { type ActionFunctionArgs, redirect } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { setMemo } from "~/models/content";
import { favoriteStudent, unfavoriteStudent } from "~/models/favorite-students";

export type ActionData = {
  memo?: {
    contentId: string;
    body: string;
  };
  favorite?: {
    studentId: string;
    contentId: string;
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
    await setMemo(env, currentUser.id, actionData.memo.contentId, actionData.memo.body);
  }
  if (actionData.favorite) {
    if (actionData.favorite.favorited) {
      await favoriteStudent(env, currentUser.id, actionData.favorite.studentId, actionData.favorite.contentId);
    } else {
      await unfavoriteStudent(env, currentUser.id, actionData.favorite.studentId, actionData.favorite.contentId);
    }
  }

  return {};
};
