import type { LoaderFunctionArgs } from "react-router";
import { graphql } from "~/graphql";
import { runQuery } from "~/lib/baql";
import type { Defense } from "~/graphql/graphql";

const raidStatisticsQuery = graphql(`
  query RaidStatistics($uid: String!, $defenseType: Defense!) {
    raid(uid: $uid) {
      statistics(defenseType: $defenseType) {
        student { uid name role }
        slotsCount
        slotsByTier { tier count }
        assistsCount
        assistsByTier { tier count }
      }
    }
  }
`);

export type RaidStatisticsData = {
  statistics?: {
    student: { uid: string; name: string; role: string };
    slotsCount: number;
    slotsByTier: { tier: number; count: number }[];
    assistsCount: number;
    assistsByTier: { tier: number; count: number }[];
  }[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const uid = params.id;
  if (!uid) {
    throw new Response("Raid ID is required", { status: 400 });
  }

  const url = new URL(request.url);
  const defenseType = url.searchParams.get("defenseType") as Defense;
  const { data, error } = await runQuery(raidStatisticsQuery, { uid, defenseType });
  if (error || !data) {
    throw new Response("Error fetching raid statistics", { status: 500 });
  }

  return {
    statistics: data.raid?.statistics?.filter(({ slotsCount, assistsCount }) => slotsCount + assistsCount > 100),
  };
}
