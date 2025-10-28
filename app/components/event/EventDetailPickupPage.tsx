import { ExclamationTriangleIcon } from "@heroicons/react/16/solid";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useFetcher } from "react-router";
import type { PickupType, AttackType, DefenseType, Role } from "~/models/content.d";
import EventPickup from "./EventPickup";

type EventDetailPickupPageProps = {
  event: {
    uid: string;
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

  signedIn: boolean;
};

export type ActionData = {
  favorite?: {
    studentUid: string;
    favorited: boolean;
  };
};

export default function EventDetailPickupPage({ event, pickups, signedIn }: EventDetailPickupPageProps) {
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
    <div className="my-4">
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
    </div>
  )
}

type EventPickupWithFavoriteStateProps = {
  pickup: EventDetailPickupPageProps["pickups"][0];
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
