import { TruckIcon } from "@heroicons/react/24/solid";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, redirect } from "react-router";
import { useLoaderData } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Button } from "~/components/atoms/form";

export const meta: MetaFunction = () => [
  { title: "편성/공략 | 몰루로그" },
];

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect("/unauthorized");
  }

  return { username: currentUser.username };
};

export default function EditParties() {
  const { username } = useLoaderData<typeof loader>();
  return (
    <div className="my-16 flex flex-col items-center justify-center">
      <TruckIcon className="my-2 w-16 h-16" />
      <p className="my-4 text-xl font-bold">
        이제 내 정보 페이지에서 편성/공략 정보를 수정할 수 있어요.
      </p>
      <Link to={`/@${username}/parties`} className="my-4">
        <Button color="black">
          내 정보 페이지로 →
        </Button>
      </Link>
    </div>
  );
}
