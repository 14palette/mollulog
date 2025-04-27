import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { isRouteErrorResponse, Link, useLoaderData, useRouteError } from "react-router";
import dayjs from "dayjs";
import { useState } from "react";
import { graphql } from "~/graphql";
import type { StudentDetailQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import {
  attackTypeColor, attackTypeLocale, defenseTypeColor, defenseTypeLocale,
  roleColor, roleLocale, raidTypeLocale, schoolNameLocale,
} from "~/locales/ko";
import { bossImageUrl } from "~/models/assets";
import { EmptyView, SubTitle, Title } from "~/components/atoms/typography";
import { TierCounts } from "~/components/molecules/student";
import { ArrowTopRightOnSquareIcon, ChevronDownIcon, ChevronRightIcon, ChevronUpIcon } from "@heroicons/react/16/solid";
import { OptionBadge } from "~/components/atoms/student";
import { ErrorPage } from "~/components/organisms/error";

const studentDetailQuery = graphql(`
  query StudentDetail($uid: String!, $raidSince: ISO8601DateTime!) {
    student(studentId: $uid) {
      name studentId attackType defenseType role school schaleDbId
      raidStatistics(raidSince: $raidSince) {
        raid { raidId name boss type since until }
        defenseType
        slotsCount
        slotsByTier { tier count }
        assistsCount
      }
    }
  }
`);

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const uid = params.id!;

  const raidSince = dayjs().subtract(1, "year").toISOString();
  const { data, error } = await runQuery<StudentDetailQuery>(studentDetailQuery, { uid, raidSince });
  let errorMessage: string | null = null;
  if (error || !data) {
    errorMessage = error?.message ?? "학생 정보를 가져오는 중 오류가 발생했어요";
  } else if (!data.student) {
    errorMessage = "학생 정보를 찾을 수 없어요";
  }

  if (errorMessage) {
    throw new Response(JSON.stringify({ error: { message: errorMessage } }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return { student: data!.student! };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: `학생 정보 | 몰루로그` }];
  }

  const { student } = data;
  const title = `${student.name} - 학생 정보`;
  const description = `블루 아카이브 ${student.name} - 학생의 프로필과 통계 정보를 확인해보세요.`;
  return [
    { title: `${title} | 몰루로그` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
};

export const ErrorBoundary = () => {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorPage message={error.data.error.message} />;
  } else {
    return <ErrorPage />;
  }
};

export default function StudentDetail() {
  const { student } = useLoaderData<typeof loader>();

  const [raidShowMore, setRaidShowMore] = useState(false);

  const statistics = student.raidStatistics.filter(({ slotsCount }) => slotsCount > 100);
  return (
    <>
      <Title text="학생부" />
      <div className="w-full aspect-16/9 flex rounded-xl bg-neutral-100 dark:bg-neutral-900">
        <div className="p-4 md:p-8 grow flex flex-col justify-center z-10">
          <p className="text-xl md:text-2xl font-bold">{student.name}</p>
          <p className="my-1 md:my-2">{schoolNameLocale[student.school]}</p>
          <div className="flex gap-2">
            <OptionBadge text={attackTypeLocale[student.attackType]} color={attackTypeColor[student.attackType]} />
            <OptionBadge text={defenseTypeLocale[student.defenseType]} color={defenseTypeColor[student.defenseType]} />
            <OptionBadge text={roleLocale[student.role]} color={roleColor[student.role]} />
          </div>
          <a href={`https://schaledb.com/student/${student.schaleDbId}`} target="_blank" rel="noreferrer" className="pt-4 hover:underline">
            <ArrowTopRightOnSquareIcon className="size-3 text-neutral-500 inline" />
            <span className="text-sm text-neutral-500">샬레DB</span>
          </a>
        </div>
        <div className="relative w-1/3 h-full overflow-hidden rounded-r-xl">
          <img
            src={`https://assets.mollulog.net/images/students/standing/${student.studentId}`}
            alt={student.name}
            className="absolute w-full h-full object-cover object-top scale-125 translate-y-1/20 transform-gpu origin-top"
          />
          <div className="absolute w-full h-full bg-linear-to-r from-neutral-100 dark:from-neutral-900 to-transparent to-15%" />
        </div>
      </div>

      <SubTitle text="총력전/대결전 통계" />
      <p className="text-sm text-neutral-500">최근 1년간 개최된 총력전/대결전의 편성 횟수를 제공해요.</p>
      <div>
        {statistics.length === 0 && (
          <EmptyView text="편성된 충력전/대결전 정보가 없어요" />
        )}
        {statistics.slice(0, raidShowMore ? undefined : 5).map(({ raid, defenseType, slotsByTier, slotsCount }) => {
          const slotsByTierMap = slotsByTier.reduce((acc, { tier, count }) => {
            acc[tier] = count;
            return acc;
          }, {} as { [tier: number]: number });

          return (
            <div key={`${raid.raidId}-${defenseType}`} className="my-4 pl-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
              <div className="relative flex">
                <Link
                  to={`/raids/${raid.raidId}`}
                  className="xl:px-2 py-4 grow group z-10 relative bg-linear-to-r from-neutral-100 dark:from-neutral-900 to-transparent to-75%"
                >
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{raidTypeLocale[raid.type]}</p>
                  <p className="text-lg font-bold group-hover:underline">
                    {raid.name}
                    <ChevronRightIcon className="size-4 inline-block" />
                  </p>
                  <p className="text-xs">{dayjs(raid.since).format("YYYY-MM-DD")} ~ {dayjs(raid.until).format("YYYY-MM-DD")}</p>
                </Link>
                <div 
                  className="absolute top-0 right-0 w-2/3 md:w-1/2 h-full rounded-tr-lg bg-cover"
                  style={{ backgroundImage: `url(${bossImageUrl(raid.boss)})` }}
                />
                <div className="absolute right-2 bottom-1 z-10">
                  <OptionBadge text={defenseTypeLocale[defenseType]} color={defenseTypeColor[defenseType]} dark />
                </div>
              </div>
              <div className="pr-4 xl:pl-2 xl:pr-6 py-4">
                <p className="text-sm xl:text-base mb-2">
                  상위 2만명 중 총 {slotsCount.toLocaleString()}회 ({formatPercentage(slotsCount / 20000)}) 편성
                </p>
                <TierCounts tierCounts={slotsByTierMap} visibleTiers={[8, 7, 6, 5, 4, 3]} totalCount={20000} />
              </div>
            </div>
          );
        })}
        {statistics.length > 5 && (
          <div
            className="py-2 mb-4 text-center cursor-pointer hover:underline flex items-center justify-center"
            onClick={() => setRaidShowMore(!raidShowMore)}
          >
            {raidShowMore ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
            <span className="ml-1">{raidShowMore ? "접기" : "더 보기"}</span>
          </div>
        )}
      </div>
    </>
  );
}

function formatPercentage(ratio: number) {
  return (ratio * 100).toFixed(1) + "%";
}
