import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/auth/authenticator.server";
import { graphql } from "~/graphql";
import { RaidRank, RaidRanksQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { getUserStudentStates } from "~/models/student-state";

const raidRanksQuery = graphql(`
  query RaidRanks($raidId: String!, $filter: [RaidRankFilter!]) {
    raid(raidId: $raidId) {
      rankVisible
      ranks(filter: $filter) {
        rank score
        parties {
          partyIndex
          slots {
            slotIndex tier
            student { studentId name }
          }
        }
      }
    }
  }
`);

export type RaidRanksData = {
  rankVisible: boolean;
  ranks: RaidRank[];
};

export const loader = async ({ request, context, params }: LoaderFunctionArgs) => {
  const raidId = params.id;
  if (!raidId) {
    throw new Response("Raid ID is required", { status: 400 });
  }

  const url = new URL(request.url);
  const filterByStates = url.searchParams.get("filterByStates") === "true";
  let filter = undefined;
  if (filterByStates) {
    const filterByTier = url.searchParams.get("filterByTier") === "true";

    const sensei = await getAuthenticator(context.cloudflare.env).isAuthenticated(request);
    if (sensei) {
      const studentStates = await getUserStudentStates(context.cloudflare.env, sensei.username, true);
      filter = (studentStates ?? []).filter((state) => state.owned).map((state) => ({
        studentId: state.student.id,
        tier: filterByTier ? (state.tier ?? state.student.initialTier) : 8,
      }));
    }
  }

  if (filter) {
    const futureStudentIds = url.searchParams.get("futureStudentIds")?.split(",");
    if (futureStudentIds) {
      futureStudentIds.forEach((studentId) => filter.push({ studentId, tier: 8 }));
    }
  }

  const { data, error } = await runQuery<RaidRanksQuery>(raidRanksQuery, { raidId, filter });
  if (error || !data?.raid?.ranks) {
    return json({ error: error?.message ?? "순위 정보를 가져오는 중 오류가 발생했어요" }, { status: 500 });
  }

  return json({
    rankVisible: data.raid.rankVisible,
    ranks: data.raid.ranks,
  });
};
