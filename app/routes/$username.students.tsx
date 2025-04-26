import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { getUserStudentStates } from "~/models/student-state";
import { useStateFilter } from "~/components/organisms/student";
import { StudentCards } from "~/components/molecules/student";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Callout } from "~/components/atoms/typography";
import { getRouteSensei } from "./$username";

export const loader = async ({ context, request, params }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  const sensei = await getRouteSensei(env, params);
  return {
    currentUsername: currentUser?.username,
    username: sensei.username,
    states: await getUserStudentStates(env, sensei.username, false),
  };
};

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""} - 학생부 | 몰루로그`.trim() },
    { name: "description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
    { name: "og:title", content: `${params.username || ""} - 학생부 | 몰루로그`.trim() },
    { name: "og:description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
  ];
};

export default function UserPage() {
  const loaderData = useLoaderData<typeof loader>();
  const { currentUsername, username, states } = loaderData;
  if (!states) {
    return (
      <p className="my-8">선생님을 찾을 수 없어요. 다른 이름으로 검색해보세요.</p>
    );
  }

  const noOwned = states.every(({ owned }) => !owned);
  const isNewbee = (currentUsername === username) && noOwned;

  const [StateFilter, filteredStates] = useStateFilter(states);
  return (
    <>
      {isNewbee && (
        <Callout className="my-8" emoji="✨">
          <span className="grow">모집한 학생을 등록해보세요.</span>
          <Link to="/edit/students" className="ml-1 underline">등록하러 가기 →</Link>
        </Callout>
      )}

      {StateFilter}

      <div className="my-8">
        <p className="font-bold text-xl my-4">모집한 학생</p>
        {noOwned ?
          <div className="my-16 text-center">
            아직 등록한 학생이 없어요
          </div> :
          <StudentCards
            students={filteredStates.filter(({ owned }) => owned).map(({ student, tier }) => ({
              studentId: student.id,
              name: student.name,
              tier: tier ?? student.initialTier,
            }))}
          />
        }
      </div>

      <div className="my-8">
        <p className="font-bold text-xl my-4">미모집 학생</p>
        <StudentCards
          students={filteredStates.filter(({ owned }) => !owned).map(({ student }) => ({
            studentId: student.id,
            name: student.name,
            grayscale: true,
          }))}
        />
      </div>
    </>
  );
}
