import { data } from "react-router";
import { Outlet, type Params, isRouteErrorResponse, useParams, useRouteError } from "react-router";
import { Title } from "~/components/atoms/typography";
import { ErrorPage } from "~/components/organisms/error";
import { Navigation } from "~/components/organisms/navigation";
import type { Env } from "~/env.server";
import { getSenseiByUsername, type Sensei } from "~/models/sensei";

export async function getRouteSensei(env: Env, params: Params<string>): Promise<Sensei> {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const username = usernameParam.replace("@", "");
  const sensei = await getSenseiByUsername(env, username);
  if (!sensei) {
    throw data(
      { error: { message: "선생님을 찾을 수 없어요", data: { username } } },
      { status: 404 },
    );
  }

  return sensei;
}

export const ErrorBoundary = () => {
  const error = useRouteError();
  let username, message;
  if (isRouteErrorResponse(error)) {
    username = error.data.error.data.username;
    message = error.data.error.message;
  }

  return (
    <>
      {username && <Title text={`@${username}`} />}
      <ErrorPage message={message} />
    </>
  )
};

export default function User() {
  const params = useParams();
  const username = (params.username as string).replace("@", "");

  return (
    <>
      <Title text={`@${username}`} />
      <Navigation links={[
        { to: `/@${username}/`, text: "프로필" },
        { to: `/@${username}/students`, text: "학생", allowPathPrefix: true },
        { to: `/@${username}/pickups`, text: "모집 이력", allowPathPrefix: true },
        { to: `/@${username}/futures`, text: "관심 학생" },
        { to: `/@${username}/parties`, text: "편성/공략", allowPathPrefix: true },
      ]} />
      <Outlet key={`user-${params.username}`} />
    </>
  );
}
