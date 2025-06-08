import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { useStateFilter } from "~/components/organisms/student";
import { StudentCards } from "~/components/molecules/student";
import { getAuthenticator } from "~/auth/authenticator.server";
import { SubTitle, Description } from "~/components/atoms/typography";
import { getRouteSensei } from "./$username";
import { getAllStudents } from "~/models/student";
import { getRecruitedStudents } from "~/models/recruited-student";
import { MinusCircleIcon, IdentificationIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

export const loader = async ({ context, request, params }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);

  const sensei = await getRouteSensei(env, params);

  const recruitedStudents = await getRecruitedStudents(env, sensei.id);
  const recruitedStudentTiers = recruitedStudents.reduce((acc, { studentUid, tier }) => {
    acc[studentUid] = tier;
    return acc;
  }, {} as Record<string, number>);

  return {
    me: currentUser?.username === sensei.username,
    allStudents: await getAllStudents(env),
    recruitedStudentTiers,
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
  const { me, allStudents, recruitedStudentTiers } = loaderData;

  const [StateFilter, filteredStudents] = useStateFilter(allStudents.map((student) => ({
    ...student,
    tier: recruitedStudentTiers[student.uid] ?? student.initialTier,
  })), { useFilter: true, useSort: true, useSearch: true });

  const noOwned = Object.values(recruitedStudentTiers).length === 0;

  return (
    <>
      {StateFilter}

      <div className="my-8">
        <SubTitle text="모집한 학생" />
        {me && !noOwned && <Description text="학생을 선택해 성장 등급을 수정할 수 있어요." />}
        {noOwned ?
          <div className="my-16 text-center">
            아직 모집한 학생이 없어요
          </div> :
          <StudentCards
            students={filteredStudents.filter(({ uid }) => recruitedStudentTiers[uid]).map(({ uid, name, attackType, defenseType, role }) => ({
              uid, name, attackType, defenseType, role,
              tier: recruitedStudentTiers[uid],
              popups: [
                {
                  Icon: MinusCircleIcon,
                  text: "모집한 학생에서 제외",
                  onClick: () => {
                    // TODO
                  },
                },
                {
                  Icon: IdentificationIcon,
                  text: "학생부 보기",
                  link: `/students/${uid}`,
                },
              ],
            }))}
          />
        }
      </div>

      <div className="my-8">
        <SubTitle text="미모집 학생" />
        {me && <Description text="학생을 선택해 모집 정보를 등록할 수 있어요." />}
        <StudentCards
          students={filteredStudents.filter(({ uid }) => !recruitedStudentTiers[uid]).map(({ uid, name, attackType, defenseType, role }) => ({
            uid, name, attackType, defenseType, role,
            grayscale: true,
            popups: [
              {
                Icon: PlusCircleIcon,
                text: "모집한 학생에 추가",
                onClick: () => {
                  // TODO
                },
              },
              {
                Icon: IdentificationIcon,
                text: "학생부 보기",
                link: `/students/${uid}`,
              },
            ],
          }))}
        />
      </div>
    </>
  );
}
