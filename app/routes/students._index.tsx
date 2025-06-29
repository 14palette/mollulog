import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { Title } from "~/components/atoms/typography";
import { StudentCards } from "~/components/molecules/student";
import { getAllStudents } from "~/models/student";
import { useStateFilter } from "~/components/organisms/student";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const students = await getAllStudents(env, true);
  return {
    students: students.sort((a, b) => a.order - b.order),
  };
};

export const meta: MetaFunction = () => {
  const title = "학생부 | 몰루로그";
  const description = "블루 아카이브 학생들의 프로필과 통계 정보를 확인해보세요.";
  return [
    { title },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
};

export default function Students() {
  const { students } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [StateFilter, filteredStates] = useStateFilter(
    students,
    { useFilter: true, useSort: { by: ["name", "recent"] }, useSearch: true },
    { sort: { by: "recent" } },
  );

  return (
    <>
      <Title text="학생부" />
      <p className="text-neutral-500 dark:text-neutral-400 -mt-2 mb-4">
        학생들의 프로필과 통계 정보를 확인할 수 있어요.
      </p>
      {StateFilter}
      <StudentCards
        students={filteredStates}
        onSelect={(uid) => navigate(`/students/${uid}`)}
      />
    </>
  );
}
