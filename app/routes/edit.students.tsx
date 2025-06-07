import { TruckIcon } from "@heroicons/react/24/solid";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { Link } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Button } from "~/components/atoms/form";

export const meta: MetaFunction = () => [
  { title: "학생 명부 | 몰루로그" },
];

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
  }

  return {
    username: sensei.username,
  };
};

export default function EditStudents() {
  const { username } = useLoaderData<typeof loader>();
  return (
    <div className="my-16 flex flex-col items-center justify-center">
      <TruckIcon className="my-2 w-16 h-16" />
      <p className="my-4 text-xl font-bold">
        이제 내 정보 페이지에서 학생 명부를 수정할 수 있어요.
      </p>
      <Link to={`/@${username}/students`} className="my-4">
        <Button color="black">
          내 정보 페이지로 →
        </Button>
      </Link>
    </div>
  );
}
