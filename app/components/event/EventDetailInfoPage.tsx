import { ClockIcon, ExclamationTriangleIcon, StarIcon, XCircleIcon } from "@heroicons/react/16/solid";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useFetcher } from "react-router";
import type { PickupType, AttackType, DefenseType, Role, EventType } from "~/models/content.d";
import EventPickup from "./EventPickup";
import { SubTitle } from "../atoms/typography";
import { ContentMemoEditor } from "../molecules/content";
import EventInfoCard from "./EventInfoCard";

type EventDetailInfoPageProps = {
  event: {
    uid: string;
    type: EventType;
    since: Date;
    until: Date;
  }
  pickups: {
    type: PickupType;
    rerun: boolean;
    since: Date;
    until: Date | null;
    student: {
      uid: string;
      attackType: AttackType;
      defenseType: DefenseType;
      role: Role;
    } | null;
    studentName: string;

    favoritedCount: number;
    favorited: boolean;
  }[];

  allMemos: {
    uid: string;
    body: string;
    visibility: "private" | "public";
    sensei: {
      username: string;
      profileStudentId: string | null;
    };
  }[];

  me: {
    username: string;
  } | null;
};

export type ActionData = {
  favorite?: {
    studentUid: string;
    favorited: boolean;
  };
  memo?: {
    body: string;
    visibility: "private" | "public";
  };
};

export default function EventDetailInfoPage({ event, pickups, allMemos, me }: EventDetailInfoPageProps) {
  return (
    <div>
      {event.type === "fes" && (
        <>
          <EventInfoCard
            Icon={StarIcon}
            title="모집 확률 상승"
            description="★3 학생 모집 확률이 6%로 상승해요"
          />
          <EventInfoCard
            Icon={ClockIcon}
            title="기간 한정 모집"
            description={"\"페스 신규/복각\" 학생은 페스 기간에만 모집할 수 있어요"}
          />
          <EventInfoCard
            Icon={XCircleIcon}
            title="모집 포인트 교환 불가"
            description={"\"페스 복각\" 학생은 모집 포인트(천장)로는 교환할 수 없어요"}
          />
        </>
      )}

      {pickups.length > 0 && <Pickups pickups={pickups} signedIn={me !== null} event={event} />}
      <EventMemo allMemos={allMemos} me={me} />
    </div>
  )
}

type PickupsProps = {
  pickups: EventDetailInfoPageProps["pickups"];
  signedIn: boolean;
  event: {
    uid: string;
    since: Date;
    until: Date;
  };
};

function Pickups({ pickups, signedIn, event }: PickupsProps) {
  const pickupDateGroupsArray = useMemo(() => {
    const pickupDateGroups = pickups.reduce((groups, pickup) => {
      const key = `${pickup.since}-${pickup.until}`;
      if (!groups[key]) {
        groups[key] = {
          since: pickup.since,
          until: pickup.until,
          pickups: []
        };
      }
      groups[key].pickups.push(pickup);
      return groups;
    }, {} as Record<string, { since: Date; until: Date | null; pickups: typeof pickups }>);

    return Object.values(pickupDateGroups);
  }, [event.uid]);

  const hasMultipleDateRanges = pickupDateGroupsArray.length > 1;
  // Check if any pickup group has different dates from event
  const shouldNotifyPickupPeriod = pickups.length > 0 && pickupDateGroupsArray.some(group => {
    const isSinceDifferent = !dayjs(group.since).isSame(dayjs(event.since), "day");
    const isUntilDifferent = !dayjs(group.until).isSame(dayjs(event.until), "day");
    return group.until !== null && (isSinceDifferent || isUntilDifferent);
  });

  return (
    <>
      <SubTitle text="픽업 모집 정보" />
      {shouldNotifyPickupPeriod && (
        <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-amber-700 dark:text-amber-300 mb-1">
                이벤트 개최 기간과 픽업 모집 기간이 달라요
              </p>
              <div className="text-sm text-amber-600 dark:text-amber-400">
                {hasMultipleDateRanges ? (
                  <>
                    {pickupDateGroupsArray.map((group, index) => {
                      const studentNames = group.pickups.map(pickup => pickup.studentName).join(", ");
                      const isSinceDifferent = !dayjs(group.since).isSame(dayjs(event.since), "day");
                      const isUntilDifferent = !dayjs(group.until).isSame(dayjs(event.until), "day");

                      return (
                        <span key={`group-${index}`}>
                          {studentNames}의 픽업은&nbsp;
                          <span className={isSinceDifferent ? "font-semibold" : ""}>{dayjs(group.since).format("M월 D일")}</span>부터&nbsp;
                          <span className={isUntilDifferent ? "font-semibold" : ""}>{dayjs(group.until).format("M월 D일")}</span>까지
                          {index < pickupDateGroupsArray.length - 1 ? ", " : " "}
                        </span>
                      );
                    })}
                    진행해요.
                  </>
                ) : (
                  <>
                    픽업 모집은&nbsp;
                    <span className={!dayjs(pickupDateGroupsArray[0].since).isSame(dayjs(event.since), "day") ? "font-semibold" : ""}>{dayjs(pickupDateGroupsArray[0].since).format("M월 D일")}</span>부터&nbsp;
                    <span className={!dayjs(pickupDateGroupsArray[0].until).isSame(dayjs(event.until), "day") ? "font-semibold" : ""}>{dayjs(pickupDateGroupsArray[0].until).format("M월 D일")}</span>까지 진행해요.
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {pickups.map((pickup) => <EventPickupWithFavoriteState key={pickup.student?.uid} pickup={pickup} signedIn={signedIn} />)}
    </>
  );
}

type EventPickupWithFavoriteStateProps = {
  pickup: EventDetailInfoPageProps["pickups"][0];
  signedIn: boolean;
}

function EventPickupWithFavoriteState({ pickup, signedIn }: EventPickupWithFavoriteStateProps) {
  const [favorited, setFavorited] = useState(pickup.favorited);
  const [favoritedCount, setFavoritedCount] = useState(pickup.favoritedCount);

  const fetcher = useFetcher();
  const submit = (data: ActionData) => fetcher.submit(data, { method: "post", encType: "application/json" });
  const toggleFavorite = (favorited: boolean) => {
    submit({ favorite: { studentUid: pickup.student?.uid ?? "", favorited } });
    setFavorited(favorited);
    setFavoritedCount(favoritedCount + (favorited ? 1 : -1));
  };

  return (
    <EventPickup
      pickup={pickup}
      favorited={favorited}
      favoritedCount={favoritedCount}
      onFavorite={toggleFavorite}
      signedIn={signedIn}
    />
  );
}

type EventMemoProps = {
  allMemos: EventDetailInfoPageProps["allMemos"];
  me: EventDetailInfoPageProps["me"];
};

function EventMemo({ allMemos, me }: EventMemoProps) {
  const fetcher = useFetcher();
  const submit = (data: ActionData) => fetcher.submit(data, { method: "post", encType: "application/json" });

  return (
    <>
      <SubTitle text="이벤트 메모" />
      <ContentMemoEditor
        allMemos={allMemos}
        myMemo={me?.username ? allMemos.find(memo => memo.sensei.username === me.username) : undefined}
        onUpdate={({ body, visibility }) => submit({ memo: { body, visibility } })}
        signedIn={me !== null}
        isSubmitting={fetcher.state === "submitting"}
      />
    </>
  );
}
