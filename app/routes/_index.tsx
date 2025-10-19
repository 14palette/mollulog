import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { HeartIcon as EmptyHeartIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { HeartIcon as FilledHeartIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon, ChevronUpIcon, ArrowRightIcon } from "@heroicons/react/16/solid";
import { getAuthenticator } from "~/auth/authenticator.server";
import { SubTitle, Title } from "~/components/atoms/typography";
import { graphql } from "~/graphql";
import type { IndexQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { getFavoritedCounts, getUserFavoritedStudents } from "~/models/favorite-students";
import { defenseTypeColor, defenseTypeLocale, difficultyLocale, eventTypeLocale, pickupLabelLocale, raidTypeLocale, relativeTime } from "~/locales/ko";
import dayjs from "dayjs";
import { OptionBadge, ProfileImage } from "~/components/atoms/student";
import { useState } from "react";
import { EventHeader } from "~/components/event";
import type { DefenseType, EventType, RaidType } from "~/models/content.d";
import { bossImageUrl } from "~/models/assets";

const indexQuery = graphql(`
  query Index($now: ISO8601DateTime!) {
    events(untilAfter: $now, first: 20) {
      nodes {
        __typename name since until endless uid type rerun imageUrl
        pickups {
          type rerun since until
          student { uid name }
        }
      }
    }
    raids(untilAfter: $now, first: 3) {
      nodes {
        name since until uid type boss attackType terrain
        defenseTypes { defenseType difficulty }
      }
    }
  }
`);

export const meta: MetaFunction = () => {
  return [
    { title: "몰루로그 - 블루 아카이브 미래시/통계 정보 모음" },
    { name: "description", content: "게임 <블루 아카이브>의 컨텐츠, 통계 정보 등을 확인하고 미래시 계획을 관리해보세요." },
  ];
};

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const now = dayjs();
  const truncatedNow = now.set("minute", 0).set("second", 0).set("millisecond", 0);

  const { data, error } = await runQuery<IndexQuery, { now: Date }>(indexQuery, { now: truncatedNow.toDate() });
  if (error || !data) {
    throw error ?? "failed to fetch events";
  }

  // ========== Events ==========
  const mainEventTypes = ["event", "main_story", "collab", "fes", "immortal_event"];
  const mainEvents = data.events.nodes.filter((event) => mainEventTypes.includes(event.type));

  // Priority 1: Find currently ongoing events (since <= now <= until)
  const ongoingEvents = mainEvents.filter((event) => {
    const since = dayjs(event.since);
    const until = dayjs(event.until);
    return !since.isAfter(now) && until.isAfter(now);
  });

  let mainEvent = null;
  if (ongoingEvents.length > 0) {
    // If there are ongoing events, prioritize by event type order
    mainEvent = ongoingEvents.sort((a, b) => {
      const aTypeIndex = mainEventTypes.indexOf(a.type);
      const bTypeIndex = mainEventTypes.indexOf(b.type);
      return aTypeIndex - bTypeIndex;
    })[0];
  } else {
    // Priority 2: Find the nearest starting event
    const futureEvents = mainEvents.filter((event) => dayjs(event.since).isAfter(now));
    if (futureEvents.length > 0) {
      // Sort by start date, then by event type priority for same date
      mainEvent = futureEvents.sort((a, b) => {
        const aSince = dayjs(a.since);
        const bSince = dayjs(b.since);
        const dateDiff = aSince.diff(bSince, "day");
        if (dateDiff !== 0) {
          return dateDiff;
        }

        // If same date, prioritize by event type order
        const aTypeIndex = mainEventTypes.indexOf(a.type);
        const bTypeIndex = mainEventTypes.indexOf(b.type);
        return aTypeIndex - bTypeIndex;
      })[0];
    }
  }

  // ========== Pickups ==========
  const currentPickups: { eventUid: string, pickup: IndexQuery["events"]["nodes"][0]["pickups"][0] }[] = data.events.nodes
    .filter((event) => event.type !== "archive_pickup")
    .flatMap((event) => event.pickups.filter((pickup) => pickup.student !== null).map((pickup) => ({ eventUid: event.uid, pickup })))
    .filter(({ pickup }) => !dayjs(pickup.since).isAfter(now) && dayjs(pickup.until).isAfter(now));

  const { env } = context.cloudflare;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  const favoritedStudentUids = currentUser ? (await getUserFavoritedStudents(env, currentUser.id)).filter((favorited) => currentPickups.some((pickup) => pickup.eventUid === favorited.contentId)).map((favorited) => favorited.studentId) : [];
  
  // Get favorite counts for all students in current pickups (not just user's favorites)
  const allStudentUids = currentPickups.map(({ pickup }) => pickup.student?.uid).filter((uid) => uid !== null) as string[];
  const favoritedCounts = await getFavoritedCounts(env, allStudentUids);

  // ========== Raids ==========
  const currentTotalAssualt = data.raids.nodes.find((raid) => raid.type === "total_assault" || raid.type === "elimination");
  const currentUnlimit = data.raids.nodes.find((raid) => raid.type === "unlimit");

  return {
    mainEvent,
    currentEvents: data.events.nodes.filter((event) => (event.uid !== mainEvent?.uid) && !dayjs(event.since).isAfter(now)),
    currentPickups,
    favoritedCounts,
    favoritedStudentUids,
    currentTotalAssualt,
    currentUnlimit,
  };
}

export default function Index() {
  const { mainEvent, currentEvents, currentPickups, favoritedCounts, favoritedStudentUids, currentTotalAssualt, currentUnlimit } = useLoaderData<typeof loader>();

  return (
    <>
      <Title text="진행중인 컨텐츠" />

      <MainEvent event={mainEvent} />
      <CurrentEvents events={currentEvents} />

      {CurrentPickups.length > 0 && (
        <CurrentPickups
          pickups={currentPickups}
          favoritedStudentUids={favoritedStudentUids}
          favoritedCounts={favoritedCounts}
        />
      )}

      <SubTitle text="레이드" />
      {currentTotalAssualt && <CurrentRaid {...currentTotalAssualt} />}
      {currentUnlimit && <CurrentRaid {...currentUnlimit} />}

      <div className="my-16">
        <LinkCard Icon={CalendarDaysIcon} title="미래시 타임라인" description="컨텐츠 일정을 확인하고 계획을 세워보세요" to="/futures" />
        <LinkCard Icon={EmptyHeartIcon} title="인연 랭크 계산기" description="목표 랭크까지 필요한 선물을 계산해보세요" to="/utils/relationship" />
      </div>
    </>
  );
}

function MainEvent({ event }: { event: Exclude<IndexQuery["events"]["nodes"][0], null> | null }) {
  if (!event) {
    return (
      <div className="my-8 p-8 text-center border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800">
        <p className="text-neutral-600 dark:text-neutral-400">현재 진행중인 이벤트가 없어요</p>
      </div>
    );
  }

  return (
    <div className="my-8">
      <Link to={`/events/${event.uid}`} className="block hover:opacity-50 dark:hover:opacity-50 transition-opacity">
        <EventHeader {...event} />
      </Link>
    </div>
  );
}

type CurrentEventsProps = {
  events: {
    uid: string;
    name: string;
    type: EventType;
    since: Date;
    until: Date;
  }[];
};

function CurrentEvents({ events }: CurrentEventsProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        {events.map((event) => (
          <Link to={`/events/${event.uid}`} key={event.uid} className="block group">
            <div className="p-3 flex items-center justify-between">
              <div className="hover:opacity-50 dark:hover:opacity-50 transition-opacity">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{eventTypeLocale[event.type]}</p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{event.name}</p>
              </div>
              <ArrowRightIcon className="size-4 text-neutral-400 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

type CurrentPickupsProps = {
  pickups: { eventUid: string, pickup: IndexQuery["events"]["nodes"][0]["pickups"][0] }[];
  favoritedStudentUids: string[];
  favoritedCounts: { studentId: string, count: number }[];
};

function CurrentPickups({ pickups, favoritedStudentUids, favoritedCounts }: CurrentPickupsProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedPickups = showAll ? pickups : pickups.slice(0, 4);

  return (
    <div className="my-8">
      <SubTitle text="픽업 모집" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedPickups.map(({ pickup }) => {
          const student = pickup.student;
          if (!student) {
            return null;
          }

          const favorited = favoritedStudentUids.includes(student.uid);
          return (
            <Link to={`/students/${student.uid}`} key={student.uid} className="block">
              <div className="p-3 flex items-center gap-3 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors rounded-lg">
                <ProfileImage imageSize={12} studentUid={student.uid} />
                <div className="grow">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{pickupLabelLocale(pickup)}</p>
                  <p className="font-semibold">{student.name}</p>
                </div>
                <div className={`flex items-center gap-x-1 ${favorited ? "text-red-500" : ""}`}>
                  {favorited ? <FilledHeartIcon className="size-4" /> : <EmptyHeartIcon strokeWidth={2} className="size-4" />}
                  <span className="text-sm font-semibold">
                    {favoritedCounts.find((favorited) => favorited.studentId === student.uid)?.count ?? 0}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {pickups.length > 4 && (
        <div
          className="w-full my-4 py-2 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors rounded-lg text-neutral-500 dark:text-neutral-400 cursor-pointer"
          onClick={() => setShowAll(!showAll)}
        >
          <span className="text-sm mr-1">{showAll ? "접기" : `픽업 학생 ${pickups.length}명 모두 보기`}</span>
          {showAll ? <ChevronUpIcon className="size-4 inline" /> : <ChevronDownIcon className="size-4 inline" />}
        </div>
      )}
    </div>
  );
}

type CurrentRaidProps = {
  type: RaidType;
  uid: string;
  name: string;
  boss: string;
  since: Date;
  until: Date;
  defenseTypes: { defenseType: DefenseType; difficulty: string | null }[];
}

function CurrentRaid({ type, uid, name, boss, since, until, defenseTypes }: CurrentRaidProps) {
  const sinceDayjs = dayjs(since);
  const untilDayjs = dayjs(until);
  const now = dayjs();

  let timeLabel = null;
  if (sinceDayjs.isAfter(now)) {
    timeLabel = `${relativeTime(sinceDayjs)} 시작`;
  } else if (untilDayjs.isAfter(now)) {
    timeLabel = `${relativeTime(untilDayjs)} 종료`;
  }

  return (
    <Link to={`/raids/${uid}`}>
      <div className="my-4 relative bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors border border-neutral-200 dark:border-neutral-700 rounded-lg">
        <img src={bossImageUrl(boss)} alt={`${name} 보스 이미지`} className="absolute right-0 top-0 h-full" />
        <div className="relative w-full p-4 bg-white/50 dark:bg-neutral-800/50 rounded-lg">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{raidTypeLocale[type]}</p>
          <p className="font-semibold">{name}</p>
          <div className="mt-2 flex gap-1 flex-wrap">
            {defenseTypes.map(({ defenseType, difficulty }) => (
              <OptionBadge
                key={defenseType}
                text={`${defenseTypeLocale[defenseType]}${difficulty ? ` / ${difficultyLocale[difficulty]}` : ""}`}
                color={defenseTypeColor[defenseType]}
                bgColor="light"
              />
            ))}
          </div>
          {timeLabel && (
            <div className="absolute top-0 right-0 p-3">
              <span className="flex items-center gap-1.5 px-2 md:px-3 py-0.5 text-xs md:text-sm bg-neutral-800/90 text-white rounded-full">
                {sinceDayjs.isBefore(now) && <div className="size-2 bg-red-500 rounded-full animate-pulse" />}
                {timeLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

type LinkCardProps = {
  Icon: React.ElementType;
  title: string;
  description: string;
  to: string;
};

function LinkCard({ Icon, title, description, to }: LinkCardProps) {
  return (
    <Link to={to} className="my-4 block group">
      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 text-white rounded-lg">
            <Icon className="size-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{title}</p>
            <p className="text-sm text-blue-600 dark:text-blue-300">{description}</p>
          </div>
        </div>
        <ArrowRightIcon className="size-4 text-blue-500 group-hover:translate-x-1 transition-transform duration-200" />
      </div>
    </Link>
  );
}
