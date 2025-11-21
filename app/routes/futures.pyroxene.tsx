import { useEffect, useMemo, useState } from "react";
import { MetaFunction, redirect, useFetcher, useLoaderData, useOutletContext, useRevalidator, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { PyroxenePlannerInputPanel, PyroxenePlannerCalcPanel, PyroxeneSchedule } from "~/components/futures";
import type { PickupResources, PyroxenePlannerCalcOptions, PyroxeneScheduleItem } from "~/components/futures";
import { graphql } from "~/graphql";
import { runQuery } from "~/lib/baql";
import { getUserFavoritedStudents } from "~/models/favorite-students";
import {
  createPyroxeneOwnedResource,
  createBuyPyroxene,
  deletePyroxeneOwnedResourceByEventUid,
  deletePyroxeneTimelineItem,
  getLatestPyroxeneOwnedResource,
  getLatestPyroxeneOwnedResourceWithEventUid,
  getPyroxeneTimelineItems,
  createPyroxenePackage,
  createAttendance,
  createOtherPyroxeneGain,
  deletePyroxeneOwnedResource,
} from "~/models/pyroxene-planner";

const pyroxenePlannerQuery = graphql(`
  query PyroxenePlanner($now: ISO8601DateTime!) {
    contents(untilAfter: $now, first: 9999) {
      nodes {
        __typename uid name since until
        ... on Event {
          pickups {
            type rerun
            student { uid initialTier }
          }
        }
        ... on Raid {
          type
        }
      }
    }
  }
`);

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { data, error } = await runQuery(pyroxenePlannerQuery, { now: new Date() });
  if (error || !data) {
    throw error ?? "failed to fetch pyroxene planner";
  }

  const { env } = context.cloudflare;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect("/unauthorized");
  }

  const favoritedStudents = await getUserFavoritedStudents(env, currentUser.id);
  const latestResources = await getLatestPyroxeneOwnedResource(env, currentUser.id);
  const latestResourceAfterPickup = await getLatestPyroxeneOwnedResourceWithEventUid(env, currentUser.id);
  return {
    contents: data.contents.nodes,
    favoritedStudents: favoritedStudents.map(({ contentId, studentId }) => ({ contentUid: contentId, studentUid: studentId })),
    latestResources: {
      uid: latestResources?.uid ?? null,
      pyroxene: latestResources?.pyroxene ?? 0,
      oneTimeTicket: latestResources?.oneTimeTicket ?? 0,
      tenTimeTicket: latestResources?.tenTimeTicket ?? 0,
      inputAt: latestResources?.inputAt ?? null,
    },
    latestResourceAfterPickup: {
      uid: latestResourceAfterPickup?.uid ?? null,
      pyroxene: latestResourceAfterPickup?.pyroxene ?? 0,
      oneTimeTicket: latestResourceAfterPickup?.oneTimeTicket ?? 0,
      tenTimeTicket: latestResourceAfterPickup?.tenTimeTicket ?? 0,
      eventUid: latestResourceAfterPickup?.eventUid ?? null,
    },
    timelineItems: await getPyroxeneTimelineItems(env, currentUser.id),
  };
};

export type ActionData = {
  createData: {
    ownedResources?: {
      eventUid: string | null;
      pyroxene: number;
      oneTimeTicket: number;
      tenTimeTicket: number;
    };
    buy?: {
      quantity: number;
      date: Date;
    };
    package?: {
      startDate: Date;
      packageType: "half" | "full";
    };
    attendance?: {
      startDate: Date;
    };
    other?: {
      resources: PickupResources;
      description: string;
      date: Date;
    };
  };

  deleteData: {
    ownedResourceUid?: string | null;
    ownedResourceEventUid?: string | null;
    itemUid?: string;
  };
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect("/unauthorized");
  }

  const { createData, deleteData } = await request.json<ActionData>();
  if (request.method === "POST") {
    if (createData.ownedResources?.pyroxene !== undefined) {
      await createPyroxeneOwnedResource(env, currentUser.id, createData.ownedResources.eventUid, createData.ownedResources);
    }
    if (createData.buy?.quantity !== undefined) {
      await createBuyPyroxene(env, currentUser.id, createData.buy.date, createData.buy.quantity);
    }
    if (createData.package?.startDate !== undefined) {
      await createPyroxenePackage(env, currentUser.id, createData.package.startDate, createData.package.packageType);
    }
    if (createData.attendance?.startDate !== undefined) {
      await createAttendance(env, currentUser.id, createData.attendance.startDate);
    }
    if (createData.other?.resources !== undefined) {
      const { pyroxene, oneTimeTicket, tenTimeTicket } = createData.other.resources;
      await createOtherPyroxeneGain(env, currentUser.id, createData.other.date, pyroxene, oneTimeTicket, tenTimeTicket, createData.other.description);
    }
  } else if (request.method === "DELETE") {
    if (deleteData.ownedResourceUid) {
      await deletePyroxeneOwnedResource(env, currentUser.id, deleteData.ownedResourceUid);
    }
    if (deleteData.ownedResourceEventUid) {
      await deletePyroxeneOwnedResourceByEventUid(env, currentUser.id, deleteData.ownedResourceEventUid);
    }
    if (deleteData.itemUid) {
      await deletePyroxeneTimelineItem(env, currentUser.id, deleteData.itemUid);
    }
  }
  return { success: true };
};

export const meta: MetaFunction = () => {
  const title = "청휘석 플래너";
  const description = "관심 학생을 픽업하기 위해 필요한 청휘석을 계산해보세요";
  return [
    { title: `${title} | 몰루로그` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
};

export default function PyroxenePlanner() {
  const loaderData = useLoaderData<typeof loader>();
  const { contents, favoritedStudents, timelineItems } = loaderData;

  const [initialDate, setInitialDate] = useState<Date | null>(loaderData.latestResources.inputAt ? new Date(loaderData.latestResources.inputAt) : null);
  const [initialResources, setInitialResources] = useState<PickupResources>(loaderData.latestResources);

  const fetcher = useFetcher<typeof action>();
  const revalidator = useRevalidator();
  const [revalidated, setRevalidated] = useState(false);

  const handleSaveOwnedResources = (eventUid: string | null, resources: PickupResources) => {
    setRevalidated(false);
    fetcher.submit(
      { createData: { ownedResources: { eventUid, ...resources } } },
      { method: "POST", encType: "application/json" },
    );
  };

  const handleDeletePickupComplete = (eventUid: string) => {
    setRevalidated(false);
    fetcher.submit(
      { deleteData: { ownedResourceEventUid: eventUid } },
      { method: "DELETE", encType: "application/json" },
    );
  };

  const handleDeleteItem = (itemUid: string) => {
    setRevalidated(false);
    fetcher.submit(
      { deleteData: { itemUid } },
      { method: "DELETE", encType: "application/json" },
    );
  };

  const handleDeleteOwnedResource = (ownedResourceUid: string) => {
    setRevalidated(false);
    fetcher.submit(
      { deleteData: { ownedResourceUid } },
      { method: "DELETE", encType: "application/json" },
    );
  };

  const handleSaveBuy = (quantity: number, date: Date) => {
    setRevalidated(false);
    fetcher.submit(
      { createData: { buy: { quantity, date: date.toISOString() } } },
      { method: "POST", encType: "application/json" },
    );
  };

  const handleSavePackage = (startDate: Date, packageType: "half" | "full") => {
    setRevalidated(false);
    fetcher.submit(
      { createData: { package: { startDate: startDate.toISOString(), packageType } } },
      { method: "POST", encType: "application/json" },
    );
  };

  const handleSaveAttendance = (startDate: Date) => {
    setRevalidated(false);
    fetcher.submit(
      { createData: { attendance: { startDate: startDate.toISOString() } } },
      { method: "POST", encType: "application/json" },
    );
  };

  const handleSaveOther = (resources: PickupResources, description: string, date: Date) => {
    setRevalidated(false);
    fetcher.submit(
      { createData: { other: { resources, description, date: date.toISOString() } } },
      { method: "POST", encType: "application/json" },
    );
  };

  // Update state when loader data changes (e.g., after revalidation)
  useEffect(() => {
    setInitialDate(loaderData.latestResources.inputAt ? new Date(loaderData.latestResources.inputAt) : null);
    setInitialResources(loaderData.latestResources);
  }, [loaderData.latestResources]);

  useEffect(() => {
    if (!revalidated && !fetcher.data?.success && fetcher.state === "idle") {
      revalidator.revalidate();
      setRevalidated(true);
    }
  }, [fetcher.data, fetcher.state, fetcher.formMethod, revalidator, revalidated]);

  const [options, setOptions] = useState<PyroxenePlannerCalcOptions>({
    event: {
      pickupChance: "ceil",
    },
    raid: {
      tier: "platinum",
    },
    tactical: {
      level: "in100",
    },
    timeline: {
      display: ["event", "raid", "buy", "package_onetime"],
    },
  });

  const { setPanel } = useOutletContext<{ setPanel: (panel: React.ReactNode) => void }>();
  useEffect(() => {
    setPanel(
      <div>
        <PyroxenePlannerCalcPanel options={options} onOptionsChange={setOptions} />
        <PyroxenePlannerInputPanel
          onSaveBuy={(quantity, date) => handleSaveBuy(quantity, date)}
          onSavePackage={(startDate, packageType) => handleSavePackage(startDate, packageType)}
          onSaveAttendance={(startDate) => handleSaveAttendance(startDate)}
          onSaveOther={(resources, description, date) => handleSaveOther(resources, description, date)}
        />
      </div>
    );
  }, [options]);

  const scheduleItems = useMemo(() => {
    const items: PyroxeneScheduleItem[] = [];
    contents.forEach((content) => {
      if (content.__typename === "Event") {
        items.push({
          event: {
            ...content,
            pickups: content.pickups.map((pickup) => ({
              ...pickup,
              favorited: favoritedStudents.some(({ contentUid, studentUid }) => contentUid === content.uid && studentUid === pickup.student?.uid),
            })),
          },
        });
      } else if (content.__typename === "Raid") {
        items.push({ raid: content });
      }
    });
    timelineItems.forEach((item) => {
      if (item.source === "buy") {
        items.push({ buy: { uid: item.uid, date: new Date(item.eventAt), quantity: item.pyroxeneDelta } });
      } else if (item.source === "package_onetime") {
        items.push({ packageOnetime: { uid: item.uid, date: new Date(item.eventAt), description: item.description, quantity: item.pyroxeneDelta } });
      } else if (item.source === "package_daily") {
        items.push({
          packageDaily: {
            uid: item.uid, date: new Date(item.eventAt), description: item.description, quantity: item.pyroxeneDelta,
            repeatIntervalDays: item.repeatIntervalDays!,
            repeatCount: item.repeatCount!,
          },
        });
      } else if (item.source === "attendance") {
        items.push({ attendance: { uid: item.uid, date: new Date(item.eventAt), description: item.description, quantity: item.pyroxeneDelta, repeatIntervalDays: item.repeatIntervalDays! } });
      }
    });
    return items;
  }, [contents, favoritedStudents]);

  return (
    <>
      <PyroxeneSchedule
        initialDate={initialDate}
        initialResources={initialResources}
        initialResourcesUid={loaderData.latestResources.uid}
        latestEventUid={loaderData.latestResourceAfterPickup.eventUid}
        scheduleItems={scheduleItems}
        options={options}
        onPickupComplete={(eventUid, resources) => handleSaveOwnedResources(eventUid, resources)}
        onDeletePickupComplete={(eventUid) => handleDeletePickupComplete(eventUid)}
        onDeleteItem={(itemUid) => handleDeleteItem(itemUid)}
        onDeleteOwnedResource={(ownedResourceUid) => handleDeleteOwnedResource(ownedResourceUid)}
      />
    </>
  )
}
