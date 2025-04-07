import { json } from "@remix-run/cloudflare";
import { Outlet, Params, isRouteErrorResponse, useParams, useRouteError } from "@remix-run/react";
import { Title } from "~/components/atoms/typography";
import { ErrorPage } from "~/components/organisms/error";
import { Navigation } from "~/components/organisms/navigation";
import { Env } from "~/env.server";
import { getSenseiByUsername, type Sensei } from "~/models/sensei";

export async function getRouteSensei(env: Env, params: Params<string>): Promise<Sensei> {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const username = usernameParam.replace("@", "");
  const sensei = await getSenseiByUsername(env, username);
  if (!sensei) {
    throw json(
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
        { to: `/@${username}/students`, text: "학생부" },
        { to: `/@${username}/pickups`, text: "모집" },
        { to: `/@${username}/parties`, text: "편성" },
        { to: `/@${username}/futures`, text: "계획" },
        { to: `/@${username}/friends`, text: "친구" },
      ]} />
      <Outlet key={`user-${params.username}`} />
    </>
  );
}
