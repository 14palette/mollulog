import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { graphql } from "~/graphql";
import { runQuery } from "~/lib/baql";
import type { Defense,RaidStatisticsQuery } from "~/graphql/graphql";

const raidStatisticsQuery = graphql(`
  query RaidStatistics($raidId: String!, $defenseType: Defense!) {
    raid(raidId: $raidId) {
      statistics(defenseType: $defenseType) {
        student { studentId name role }
        slotsCount
        slotsByTier { tier count }
        assistsCount
      }
    }
  }
`);

export type RaidStatisticsData = {
  statistics?: {
    student: { studentId: string; name: string; role: string };
    slotsCount: number;
    slotsByTier: { tier: number; count: number }[];
    assistsCount: number;
  }[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const raidId = params.id;
  if (!raidId) {
    throw new Response("Raid ID is required", { status: 400 });
  }

  const url = new URL(request.url);
  const defenseType = url.searchParams.get("defenseType") as Defense;
  const { data, error } = await runQuery<RaidStatisticsQuery>(raidStatisticsQuery, { raidId, defenseType });
  if (error || !data) {
    throw new Response("Error fetching raid statistics", { status: 500 });
  }

  return {
    statistics: data.raid?.statistics?.filter(({ slotsCount, assistsCount }) => slotsCount + assistsCount > 100),
  };
}
