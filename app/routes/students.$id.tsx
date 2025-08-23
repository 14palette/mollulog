import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { isRouteErrorResponse, useLoaderData, useRouteError } from "react-router";
import dayjs from "dayjs";
import { useState, useMemo } from "react";
import { graphql } from "~/graphql";
import { runQuery } from "~/lib/baql";
import {
  attackTypeColor, attackTypeLocale, defenseTypeColor, defenseTypeLocale,
  roleColor, roleLocale, schoolNameLocale,
} from "~/locales/ko";
import { EmptyView, SubTitle, Title } from "~/components/atoms/typography";
import { ArrowTopRightOnSquareIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid";
import { OptionBadge } from "~/components/atoms/student";
import { ErrorPage } from "~/components/organisms/error";
import { SlotCountInfo } from "~/components/organisms/raid";
import { PickupHistories } from "~/components/organisms/student";
import { studentStandingImageUrl } from "~/models/assets";
import { getMaxTierAt } from "~/models/student";
import { FilterButtons } from "~/components/molecules/content";
import { BarsArrowDownIcon } from "@heroicons/react/24/outline";

const studentDetailQuery = graphql(`
  query StudentDetail($uid: String!, $raidSince: ISO8601DateTime!) {
    student(uid: $uid) {
      name uid attackType defenseType role school schaleDbId
      pickups {
        since until
        event { type uid name rerun imageUrl }
      }
      raidStatistics(raidSince: $raidSince) {
        raid { uid name boss type since until terrain }
        difficulty
        defenseType
        slotsCount
        slotsByTier { tier count }
        assistsCount
        assistsByTier { tier count }
      }
    }
  }
`);

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const uid = params.id!;

  const raidSince = dayjs().subtract(6, "month").toDate();
  const { data, error } = await runQuery(studentDetailQuery, { uid, raidSince });
  let errorMessage: string | null = null;
  if (error || !data) {
    console.error(error);
    errorMessage = "학생 정보를 가져오는 중 오류가 발생했어요";
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
  const [sort, setSort] = useState<"recent" | "old">("recent");

  // Memoize the filtered statistics to prevent re-computation on every render
  const statistics = useMemo(() => 
    student.raidStatistics.filter(({ slotsCount }) => slotsCount > 100),
    [student.raidStatistics]
  );

  // Memoize the sorted and sliced statistics
  const filteredStatistics = useMemo(() => {
    const sorted = statistics.sort((a, b) => {
      if (sort === "recent") {
        return new Date(b.raid.since).getTime() - new Date(a.raid.since).getTime();
      } else {
        return new Date(a.raid.since).getTime() - new Date(b.raid.since).getTime();
      }
    });
    return raidShowMore ? sorted : sorted.slice(0, 5);
  }, [statistics, sort, raidShowMore]);

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
            src={studentStandingImageUrl(student.uid)}
            alt={student.name}
            className="absolute w-full h-full object-cover object-top scale-125 translate-y-1/20 transform-gpu origin-top"
          />
          <div className="absolute w-full h-full bg-linear-to-r from-neutral-100 dark:from-neutral-900 to-transparent to-15%" />
        </div>
      </div>

      {student.pickups.length > 0 && (
        <>
          <SubTitle text="픽업 정보" />
          <PickupHistories pickups={student.pickups} />
        </>
      )}

      <SubTitle
        text="총력전/대결전 통계"
        description="최근 1년간 개최된 총력전/대결전의 편성 횟수를 제공해요."
      />
      <div>
        {filteredStatistics.length === 0 ?
          <EmptyView text="편성된 충력전/대결전 정보가 없어요" /> :
          <FilterButtons
            Icon={BarsArrowDownIcon}
            buttonProps={[
              { text: "최신순", onToggle: () => setSort("recent"), active: sort === "recent" },
              { text: "과거순", onToggle: () => setSort("old"), active: sort === "old" },
            ]}
            exclusive atLeastOne
          />
        }
        {filteredStatistics.map(({ raid, defenseType, difficulty, slotsByTier, slotsCount, assistsCount, assistsByTier }) => {
          return (
            <SlotCountInfo
              key={`${raid.uid}-${defenseType}`}
              raid={{
                ...raid,
                defenseType,
                difficulty,
                since: new Date(raid.since),
                until: new Date(raid.until),
              }}
              slotsCount={slotsCount}
              slotsByTier={slotsByTier}
              assistsCount={assistsCount}
              assistsByTier={assistsByTier}
              maxTier={getMaxTierAt(new Date(raid.since))}
            />
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
