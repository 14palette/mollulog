import { ClockIcon, FunnelIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { Transition } from "@headlessui/react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { isRouteErrorResponse, Link, MetaFunction, data as routeData, useLoaderData, useRouteError, type LoaderFunctionArgs } from "react-router";
import { OptionBadge } from "~/components/atoms/student";
import { Title } from "~/components/atoms/typography";
import { FilterButtons } from "~/components/molecules/content";
import { ErrorPage } from "~/components/organisms/error";
import { graphql } from "~/graphql";
import { runQuery } from "~/lib/baql";
import { defenseTypeColor, defenseTypeLocale, raidTypeLocale, terrainLocale } from "~/locales/ko";
import { bossImageUrl } from "~/models/assets";
import { Terrain, DefenseType, AttackType, RaidType } from "~/models/content.d";
import { sanitizeClassName } from "~/prophandlers";
import RaidStatisticsPage from "~/components/templates/raids/RaidStatisticsPage";
import RaidRanksPage from "~/components/templates/raids/RaidRanksPage";
import { getAllStudents } from "~/models/student";
import { getAuthenticator } from "~/auth/authenticator.server";
import { RaidRankFilter } from "~/components/organisms/raid";
import { RaidRankFilters } from "~/components/organisms/raid/RaidRanks";
import BottomSheet from "~/components/atoms/layout/BottomSheet";

const allRaidQuery = graphql(`
  query AllRaid {
    raids {
      nodes {
        defenseTypes { defenseType difficulty }
        uid type name boss since until terrain attackType rankVisible
      }
    }
  }
`);


export const loader = async ({ request, context, params }: LoaderFunctionArgs) => {
  const { data, error } = await runQuery(allRaidQuery, {});
  if (error || !data) {
    throw routeData(
      { error: { message: "총력전/대결전 정보를 찾을 수 없어요" } },
      { status: 404 },
    );
  }

  const uid = params.id;
  const currentRaid = data.raids.nodes.find((raid) => raid.uid === uid);
  if (!currentRaid) {
    throw routeData(
      { error: { message: "총력전/대결전 정보를 찾을 수 없어요" } },
      { status: 404 },
    );
  }

  const { env } = context.cloudflare;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  const allStudents = await getAllStudents(env, true);

  return {
    currentRaid,
    allRaids: data.raids.nodes.filter((raid) => raid.rankVisible).sort((a, b) => dayjs(b.since).diff(dayjs(a.since))),
    signedIn: sensei !== null,
    allStudents: allStudents.map((student) => ({
      uid: student.uid,
      name: student.name,
    })),
  };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.currentRaid) {
    return [{ title: "이벤트 정보 | 몰루로그" }];
  }

  const { currentRaid } = data;
  const since = dayjs(currentRaid.since);
  const title = `${raidTypeLocale[currentRaid.type]} ${currentRaid.name}(${since.year()}년 ${since.month() + 1}월) 정보`;
  const description = `${since.year()}년 ${since.month() + 1}월에 진행${dayjs(currentRaid.until).isAfter(dayjs()) ? "될" : "된"} ${raidTypeLocale[currentRaid.type]} ${currentRaid.name}의 토먼트/루나틱 랭킹, 파티, 학생 통계 정보 등을 확인해보세요.`;
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

type Raid = {
  uid: string;
  name: string;
  type: RaidType;
  boss: string;
  since: Date;
  until: Date;
  terrain: Terrain;
  attackType: AttackType;
  defenseTypes: { defenseType: DefenseType; difficulty: string | null }[];
}

export default function RaidDetail() {
  const { currentRaid, allRaids, signedIn, allStudents } = useLoaderData<typeof loader>();
  const raidType = currentRaid?.type ?? "total_assault";

  const [screen, setScreen] = useState<"statistics" | "ranks">("ranks");
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
      setFilters((prev) => ({ ...prev, defenseType: currentRaid.defenseTypes[0].defenseType }));
    }
  }, [currentRaid.uid, currentRaid.defenseTypes]);

  return (
    <div className="flex flex-col xl:flex-row">
      <div className="w-full xl:max-w-sm xl:mr-8">
        <Title text={`${raidTypeLocale[raidType]} 정보`} />
        <RaidSelector
          raids={allRaids.filter((r) => r.rankVisible).sort((a, b) => dayjs(b.since).diff(dayjs(a.since)))}
          currentRaid={currentRaid ?? null}
        />

        {currentRaid.rankVisible && (
          <>
            <div className="mt-6 xl:mt-8">
              <ScreenSelector text="상위권 편성" description="상위 2만명의 편성 정보를 찾아볼 수 있어요" active={screen === "ranks"} onClick={() => setScreen("ranks")} />
              <ScreenSelector text="학생 편성 통계" description="학생들이 편성된 횟수 통계를 확인할 수 있어요" active={screen === "statistics"} onClick={() => setScreen("statistics")} />
            </div>
            {screen === "ranks" && (
              <>
                {/* Desktop filter */}
                <div className="hidden xl:block mt-4 p-3 xl:p-4 pb-0 xl:pb-0 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <RaidRankFilter
                    filters={filters}
                    setRaidFilters={setFilters}
                    signedIn={signedIn}
                    students={allStudents}
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
            <p className="mb-4 text-xl xl:text-2xl font-bold">
              {screen === "ranks" ? "상위권 편성" : "학생 편성 통계"}
            </p>
            {screen === "ranks" && <RaidRanksPage filters={filters} setFilters={setFilters} raid={currentRaid} signedIn={signedIn} allStudents={allStudents} />}
            {screen === "statistics" && <RaidStatisticsPage raid={currentRaid} />}
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
            students={allStudents}
          />
        </BottomSheet>
      )}
    </div>
  );
}

type ScreenSelectorProps = {
  text: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

function ScreenSelector({ text, description, active, onClick }: ScreenSelectorProps) {
  return (
    <div
      className={sanitizeClassName(`
        my-2 w-full py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 border
        ${active
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
          : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700"
        }
      `)}
      onClick={onClick}
    >
      <p className={`font-bold transition-colors ${active ? "text-blue-700 dark:text-blue-300" : "text-neutral-700 dark:text-neutral-300"}`}>
        {text}
      </p>
      <p className={`text-sm ${active ? "text-blue-500 dark:text-blue-400" : "text-neutral-500 dark:text-neutral-400"}`}>
        {description}
      </p>
    </div>
  );
}

type RaidSelectorProps = {
  raids: Raid[];
  currentRaid: Raid | null;
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
        <div className="max-h-64 xl:max-h-96 overflow-y-auto no-scrollbar mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg">
          {raids.filter((raid) => raid.type === raidType).map((raid) => (
            <Link to={`/raids/${raid.uid}`} key={raid.uid} onClick={() => setIsOpen(false)}>
              <RaidSelectorItem raid={raid} />
            </Link>
          ))}
        </div>
      </Transition>
    </div>
  );
}

function RaidSelectorItem({ raid }: { raid: Raid }) {
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
          {raid.defenseTypes.map(({ defenseType }) => (
            <OptionBadge
              key={defenseType}
              text={defenseTypeLocale[defenseType]}
              color={defenseTypeColor[defenseType]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
