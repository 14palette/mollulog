import { useState } from "react";
import { isRouteErrorResponse, MetaFunction, redirect, useLoaderData, useRouteError } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { EventDetailPickupPage, EventHeader, EventDetailShopPage } from "~/components/event";
import type { EventDetailPickupPageActionData } from "~/components/event";
import { FilterButtons } from "~/components/molecules/content";
import { ErrorPage } from "~/components/organisms/error";
import { graphql } from "~/graphql";
import { runQuery } from "~/lib/baql";
import { getAuthenticator } from "~/auth/authenticator.server";
import { favoriteStudent, getFavoritedCounts, getUserFavoritedStudents, unfavoriteStudent } from "~/models/favorite-students";
import { getRecruitedStudents } from "~/models/recruited-student";

const eventDetailQuery = graphql(`
  query EventDetail($eventUid: String!) {
    event(uid: $eventUid) {
      uid name type since until endless imageUrl rerun
      stages(difficulty: 1) {
        uid name entryAp index
        rewards(rewardType: "item") {
          amount rewardRequirement
          item { uid category rarity }
        }
      }
      videos { title youtube start }
      shopResources {
        uid
        resource { type uid name rarity }
        resourceAmount
        paymentResource { uid name }
        paymentResourceAmount
        shopAmount
      }
    }
    pickupEvent: event(uid: $eventUid) {
      pickups { type rerun since until student { uid attackType defenseType role } studentName }
    }
  }
`);

const eventRewardBonusQuery = graphql(`
  query EventRewardBonus($itemUids: [String!]!) {
    items(uids: $itemUids) {
      uid name
      rewardBonuses { student { uid role } ratio }
    }
  }
`);

export const loader = async ({ params, context, request }: LoaderFunctionArgs) => {
  const eventUid = params.id as string;
  const { data, error } = await runQuery(eventDetailQuery, { eventUid });
  let errorMessage: string | null = null;
  if (error || !data) {
    errorMessage = error?.message ?? "이벤트 정보를 가져오는 중 오류가 발생했어요";
  } else if (!data.event) {
    errorMessage = "이벤트 정보를 찾을 수 없어요";
  }

  if (errorMessage) {
    throw new Response(
      JSON.stringify({ error: { message: errorMessage } }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const { env } = context.cloudflare;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);

  const pickupStudentUids = data!.pickupEvent!.pickups.map((pickup) => pickup.student?.uid).filter((uid) => uid !== undefined);
  const favoritedStudents = currentUser ? await getUserFavoritedStudents(env, currentUser.id, eventUid) : [];
  const favoritedCounts = (await getFavoritedCounts(env, pickupStudentUids)).filter((favorited) => favorited.contentId === eventUid);
  const pickups = data!.pickupEvent!.pickups.map((pickup) => {
    return {
      ...pickup,
      favoritedCount: favoritedCounts.find((favorited) => favorited.studentId === pickup.student?.uid)?.count ?? 0,
      favorited: favoritedStudents.some((favorited) => favorited.studentId === pickup.student?.uid),
    };
  });

  let recruitedStudentUids: string[] = [];
  if (currentUser) {
    const recruitedStudents = await getRecruitedStudents(env, currentUser.id);
    recruitedStudentUids = recruitedStudents.map((student) => student.studentUid);
  }

  const paymentResourceUids = [...new Set(data!.event!.stages.flatMap((stage) => stage.rewards.flatMap((reward) => reward.item?.uid).filter((uid) => uid !== undefined)))];
  const { data: eventRewardBonusData } = await runQuery(eventRewardBonusQuery, { itemUids: paymentResourceUids });
  const eventRewardBonus = eventRewardBonusData?.items ?? [];

  return {
    event: data!.event!,
    pickups,
    signedIn: currentUser !== null,
    recruitedStudentUids,
    eventRewardBonus,
  };
};

type ActionData = EventDetailPickupPageActionData;

export const action = async ({ params, context, request }: ActionFunctionArgs) => {
  const { env } = context.cloudflare;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect("/unauthorized");
  }

  const eventUid = params.id!;
  const actionData = await request.json() as ActionData;
  if (actionData.favorite) {
    const { studentUid, favorited } = actionData.favorite;
    const run = favorited ? favoriteStudent : unfavoriteStudent;
    await run(env, currentUser.id, studentUid, eventUid);
  }

  return {};
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: "이벤트 정보 | 몰루로그" }];
  }

  const { event } = data;
  const title = event.name;
  const description = `블루 아카이브 "${event.name}" 이벤트의 픽업, 보상 정보 등을 확인해보세요.`;
  return [
    { title: `${title} | 몰루로그` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:image", content: event.imageUrl },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorPage message={error.data.error.message} />;
  } else {
    return <ErrorPage />;
  }
}

type EventDetailPage = "pickups" | "stages" | "shop";

export default function EventDetail() {
  const { event, pickups, signedIn, recruitedStudentUids, eventRewardBonus } = useLoaderData<typeof loader>();

  const showPickupsPage = pickups.length > 0;
  const showStagesPage = event.stages.length > 0;
  const showShopPage = event.shopResources.length > 0;
  const [page, setPage] = useState<EventDetailPage>("pickups");

  return (
    <>
      <div className="max-w-3xl mx-auto">
        <EventHeader {...event} />
      </div>

      <div className="mt-8 mb-4">
        <FilterButtons
          Icon={Bars3Icon}
          buttonProps={[
            showPickupsPage ? { text: "픽업 학생", active: page === "pickups", onToggle: () => setPage("pickups") } : null,
            showShopPage ? { text: "소탕 계산기", active: page === "shop", onToggle: () => setPage("shop") } : null,
          ].filter((button) => button !== null)}
          exclusive atLeastOne
        />
      </div>

      {page === "pickups" && <EventDetailPickupPage event={event} pickups={pickups} signedIn={signedIn} />}
      {page === "shop" && (
        <EventDetailShopPage
          stages={event.stages}
          shopResources={event.shopResources}
          eventRewardBonus={eventRewardBonus}
          recruitedStudentUids={recruitedStudentUids}
        />
      )}
    </>
  );
}
