import { ClockIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { Transition } from "@headlessui/react";
import dayjs from "dayjs";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Await, isRouteErrorResponse, Link, MetaFunction, data as routeData, useLoaderData, useRouteError, type LoaderFunctionArgs } from "react-router";
import { OptionBadge } from "~/components/atoms/student";
import { SubTitle, Title } from "~/components/atoms/typography";
import { FilterButtons } from "~/components/molecules/content";
import { ErrorPage } from "~/components/organisms/error";
import { graphql } from "~/graphql";
import { runQuery } from "~/lib/baql";
import { defenseTypeColor, defenseTypeLocale, difficultyLocale, raidTypeLocale, terrainLocale } from "~/locales/ko";
import { bossImageUrl } from "~/models/assets";
import { Terrain, DefenseType, AttackType, RaidType } from "~/models/content.d";
import { sanitizeClassName } from "~/prophandlers";
import RaidStatisticsPage from "~/components/templates/raids/RaidStatisticsPage";
import RaidRanksPage from "~/components/templates/raids/RaidRanksPage";
import RaidVideosPage from "~/components/templates/raids/RaidVideosPage";
import { getAuthenticator } from "~/auth/authenticator.server";
import { RaidRankFilter } from "~/components/organisms/raid";
import { RaidRankFilters } from "~/components/organisms/raid/RaidRanks";
import { BottomSheet, LoadingSkeleton } from "~/components/atoms/layout";
import { ScreenSelector } from "~/components/navigation";

const allRaidQuery = graphql(`
  query AllRaid {
    raids {
      nodes {
        uid type name boss since until terrain attackType rankVisible
        defenseTypes { defenseType difficulty }
      }
    }
  }
`);

const raidDetailQuery = graphql(`
  query RaidDetail($uid: String!) {
    raid(uid: $uid) {
      uid type name boss since until terrain attackType rankVisible
      defenseTypes { defenseType difficulty }
      videos(first: 1) {
        pageInfo { hasNextPage }
      }
      statistics {
        student { uid name }
        slotsByTier { tier }
        assistsByTier { tier }
      }
    }
  }
`);

type Screen = "ranks" | "statistics" | "videos";
const screenTitles: Record<Screen, string> = {
  "ranks":      "상위권 순위",
  "statistics": "학생 편성 통계",
  "videos":     "공략 영상 (베타)",
};

const screenDescriptions: Record<Screen, string | undefined> = {
  "ranks": "학생을 선택하여 평가 및 통계를 확인하거나, 해당 학생을 포함/제외한 편성을 찾을 수 있어요",
  "statistics": undefined,
  "videos": undefined,
};

export const loader = async ({ request, context, params }: LoaderFunctionArgs) => {
  const { data, error } = await runQuery(raidDetailQuery, { uid: params.id! });
  if (error || !data?.raid) {
    throw routeData(
      { error: { message: "총력전/대결전 정보를 찾을 수 없어요" } },
      { status: 404 },
    );
  }

  const allRaidsPromise = new Promise<SelectorRaid[]>(async (resolve) => {
    const { data: allRaidsData, error: allRaidsError } = await runQuery(allRaidQuery, {});
    if (allRaidsError || !allRaidsData) {
      resolve([]);
      return;
    }
    resolve(allRaidsData!.raids.nodes);
  });

  const { env } = context.cloudflare;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  return {
    currentRaid: data.raid,
    allRaids: allRaidsPromise,
    signedIn: sensei !== null,
  };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.currentRaid) {
    return [{ title: "이벤트 정보 | 몰루로그" }];
  }

  const { currentRaid } = data;
  const since = dayjs(currentRaid.since);
  const title = `${raidTypeLocale[currentRaid.type]} ${currentRaid.name}(${since.year()}년 ${since.month() + 1}월) 정보`;
  const description = `${since.year()}년 ${since.month() + 1}월에 진행${dayjs(currentRaid.until).isAfter(dayjs()) ? "될" : "된"} ${raidTypeLocale[currentRaid.type]} ${currentRaid.name}의 상위권 순위, 학생 통계, 공략 영상 정보 등을 확인해보세요.`;
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

export default function RaidDetail() {
  const { currentRaid, allRaids, signedIn } = useLoaderData<typeof loader>();
  const raidType = currentRaid?.type ?? "total_assault";

  const [screen, setScreen] = useState<Screen>("ranks");
  const [filters, setFilters] = useState<RaidRankFilters>({
    defenseType: currentRaid.type === "elimination" ? currentRaid.defenseTypes[0].defenseType : null,
    filterNotOwned: false,
    includeStudents: [],
    excludeStudents: [],
    rankAfter: null,
    rankBefore: null,
  });
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  useEffect(() => {
    setScreen("ranks");
    if (currentRaid.defenseTypes.length > 0) {
      setFilters((prev) => ({
        ...prev,
        defenseType: currentRaid.defenseTypes[0].defenseType,
        includeStudents: [],
        excludeStudents: [],
        rankAfter: null,
        rankBefore: null,
      }));
    }
  }, [currentRaid.uid]);

  const filterStudents = useMemo(() => {
    const studentMap = new Map();
    for (const { student, slotsByTier, assistsByTier } of currentRaid.statistics) {
      const tiers = Array.from(new Set([...slotsByTier.map((tier) => tier.tier), ...assistsByTier.map((tier) => tier.tier)]));
      if (studentMap.has(student.uid)) {
        const existing = studentMap.get(student.uid);
        existing.tiers = Array.from(new Set([...existing.tiers, ...tiers]));
      } else {
        studentMap.set(student.uid, {
          uid: student.uid,
          name: student.name,
          tiers: tiers,
        });
      }
    }

    return Array.from(studentMap.values());
  }, [currentRaid.uid]);

  const videoAvailable = currentRaid.videos.pageInfo.hasNextPage;
  return (
    <div className="flex flex-col xl:flex-row">
      <div className="w-full xl:max-w-sm xl:mr-8">
        <Title text={`${raidTypeLocale[raidType]} 정보`} />
        <RaidSelector
          raids={allRaids}
          currentRaid={currentRaid ?? null}
        />

        {currentRaid.rankVisible && (
          <>
            <div className="mt-6 xl:mt-8">
              <ScreenSelector screens={[
                { text: screenTitles.ranks, description: "일본 서버 상위 2만명의 편성 정보를 찾아볼 수 있어요", active: screen === "ranks", onClick: () => setScreen("ranks") },
                { text: screenTitles.statistics, description: "학생들이 편성된 횟수의 통계를 확인할 수 있어요", active: screen === "statistics", onClick: () => setScreen("statistics") },
                { text: screenTitles.videos, description: videoAvailable ? "공략 영상 목록을 확인할 수 있어요" : "공략 영상을 준비중이에요", active: screen === "videos", onClick: () => setScreen("videos"), disabled: !videoAvailable },
              ]} />
            </div>
            {screen === "ranks" && (
              <>
                {/* Desktop filter */}
                <div className="hidden xl:block mt-4 p-3 xl:p-4 pb-0 xl:pb-0 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <RaidRankFilter
                    filters={filters}
                    setRaidFilters={setFilters}
                    signedIn={signedIn}
                    students={filterStudents}
                    showTitle
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="grow mt-6 xl:mt-0 xl:p-8 relative">
        {currentRaid.rankVisible ?
          <>
            <div className="-mt-4">
              <SubTitle text={screenTitles[screen]} description={screenDescriptions[screen]} />
            </div>
            {screen === "ranks" && <RaidRanksPage filters={filters} setFilters={setFilters} raid={currentRaid} signedIn={signedIn} allStudents={filterStudents} />}
            {screen === "statistics" && <RaidStatisticsPage raid={currentRaid} />}
            {screen === "videos" && <RaidVideosPage raid={currentRaid} />}
          </> :
          <div className="my-16 md:my-48 w-full flex flex-col items-center justify-center">
            <ClockIcon className="my-2 w-16 h-16" strokeWidth={2} />
            <p className="my-2 text-2xl font-bold">{raidTypeLocale[raidType]} 정보를 준비중이에요</p>
            <p className="my-2 text-neutral-500 dark:text-neutral-400">
              정보가 준비된 컨텐츠를 선택하여 확인해보세요
            </p>
          </div>
        }

        {/* Mobile floating filter button */}
        {currentRaid.rankVisible && screen === "ranks" && (
          <div className="xl:hidden fixed bottom-6 right-4 z-40">
            <button
              onClick={() => setIsFilterSheetOpen(true)}
              className={sanitizeClassName(`
                flex items-center gap-2 px-4 py-3 bg-white/90 dark:bg-neutral-900/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700
                text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-full shadow-lg transition-colors
              `)}
            >
              <FunnelIcon className="size-5" strokeWidth={2} />
              <span>필터</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filter Bottom Sheet */}
      {isFilterSheetOpen && (
        <BottomSheet Icon={FunnelIcon} title="편성 찾기" onClose={() => setIsFilterSheetOpen(false)}>
          <RaidRankFilter
            filters={filters}
            setRaidFilters={setFilters}
            signedIn={signedIn}
            students={filterStudents}
          />
        </BottomSheet>
      )}
    </div>
  );
}

type SelectorRaid = {
  uid: string;
  type: RaidType;
  name: string;
  boss: string;
  since: Date;
  until: Date;
  terrain: Terrain;
  attackType: AttackType;
  rankVisible: boolean;
  defenseTypes: { defenseType: DefenseType; difficulty: string | null }[];
};

type RaidSelectorProps = {
  raids: Promise<SelectorRaid[]>;
  currentRaid: SelectorRaid | null;
};

function RaidSelector({ raids, currentRaid }: RaidSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [raidType, setRaidType] = useState<RaidType>(currentRaid?.type ?? "total_assault");

  return (
    <div className="relative mt-4">
      <p className="text-neutral-500 dark:text-neutral-400 -mt-2 mb-4">2024년 11월 이후 개최 정보를 확인할 수 있어요.</p>

      <div
        className="border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentRaid && (
          <RaidSelectorItem raid={currentRaid} />
        )}
      </div>

      <Transition
        show={isOpen}
        as="div"
        enter="transition duration-200 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition duration-100 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
        className="mt-4 mb-2 absolute w-full top-full left-0 z-10 bg-white dark:bg-neutral-800"
      >
        <div className="flex items-center justify-between">
          <FilterButtons
            buttonProps={[
              { text: "총력전", active: raidType === "total_assault", onToggle: () => setRaidType("total_assault") },
              { text: "대결전", active: raidType === "elimination", onToggle: () => setRaidType("elimination") },
            ]}
            exclusive atLeastOne
          />
          <XMarkIcon className="size-6 cursor-pointer" strokeWidth={2} onClick={() => setIsOpen(false)} />
        </div>
        <Suspense fallback={
          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg">
            <LoadingSkeleton />
          </div>
        }>
          <Await resolve={raids}>
            {(raids) => (
              <div className="max-h-64 xl:max-h-96 overflow-y-auto no-scrollbar mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg">
                {raids.sort((a, b) => dayjs(b.since).diff(dayjs(a.since))).filter((raid) => raid.type === raidType && raid.rankVisible).map((raid) => (
                  <Link to={`/raids/${raid.uid}`} key={raid.uid} onClick={() => setIsOpen(false)}>
                    <RaidSelectorItem raid={raid} />
                  </Link>
                ))}
              </div>
            )}
          </Await>
        </Suspense>
      </Transition>
    </div>
  );
}

function RaidSelectorItem({ raid }: { raid: SelectorRaid }) {
  return (
    <div className="relative cursor-pointer bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 first:rounded-t-lg last:rounded-b-lg group">
      <img src={bossImageUrl(raid.boss)} alt="보스 이미지" className="absolute top-0 right-0 h-full object-cover" />
      <div className={sanitizeClassName(`
        relative p-3 xl:p-4 pr-12 w-full bg-white/90 dark:bg-neutral-900/80
        group-hover:to-neutral-100/90 dark:group-hover:to-neutral-700/80 rounded-lg transition-colors
      `)}>
        <p className="font-bold text-sm xl:text-base">
          {raid.name}
        </p>
        <p className="text-xs xl:text-sm text-neutral-500 dark:text-neutral-400">
          {dayjs(raid.since).format("YYYY.MM.DD")} ~ {dayjs(raid.until).format("YYYY.MM.DD")}
        </p>

        <div className="mt-2 flex gap-1 flex-wrap">
          <OptionBadge text={terrainLocale[raid.terrain]} />
          {raid.defenseTypes.map(({ defenseType, difficulty }) => (
            <OptionBadge
              key={defenseType}
              text={`${defenseTypeLocale[defenseType].substring(0, raid.type === "elimination" ? 2 : undefined)}${difficulty ? ` · ${difficultyLocale[difficulty].substring(0, raid.type === "elimination" ? 1 : undefined)}` : ""}`}
              color={defenseTypeColor[defenseType]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
