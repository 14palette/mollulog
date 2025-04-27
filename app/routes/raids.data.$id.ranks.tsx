import type { LoaderFunctionArgs } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { graphql } from "~/graphql";
import type { Defense, RaidRank, RaidRanksQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { getUserStudentStates } from "~/models/student-state";

const raidRanksQuery = graphql(`
  query RaidRanks($defenseType: Defense, $raidId: String!, $includeStudents: [RaidRankFilter!], $excludeStudents: [RaidRankFilter!], $rankAfter: Int, $rankBefore: Int) {
    raid(raidId: $raidId) {
      rankVisible
      ranks(defenseType: $defenseType, first: 11, rankAfter: $rankAfter, rankBefore: $rankBefore, includeStudents: $includeStudents, excludeStudents: $excludeStudents) {
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
  hasMore: boolean;
};

export const loader = async ({ request, context, params }: LoaderFunctionArgs) => {
  const raidId = params.id;
  if (!raidId) {
    throw new Response("Raid ID is required", { status: 400 });
  }

  const url = new URL(request.url);
  const includeStudentIds: string[] = url.searchParams.get("includeStudentIds")?.split(",") ?? [];
  let excludeStudentIds: string[] = url.searchParams.get("excludeStudentIds")?.split(",") ?? [];

  const filterNotOwned = url.searchParams.get("filterNotOwned") === "true";
  if (filterNotOwned) {
    const sensei = await getAuthenticator(context.cloudflare.env).isAuthenticated(request);
    if (sensei) {
      const ownedStudentIds = ((await getUserStudentStates(context.cloudflare.env, sensei.username)) ?? [])
        .filter((state) => !state.owned)
        .map((state) => state.student.id);

      excludeStudentIds = excludeStudentIds.concat(ownedStudentIds);
    }
  }

  const includeStudents = includeStudentIds.map((studentId) => ({ studentId, tier: 3 }));
  const excludeStudents = excludeStudentIds.map((studentId) => ({ studentId, tier: 8 }));

  const { data, error } = await runQuery<RaidRanksQuery>(raidRanksQuery, {
    raidId,
    defenseType: url.searchParams.get("defenseType") ? (url.searchParams.get("defenseType") as Defense) : undefined,
    includeStudents: includeStudents.length > 0 ? includeStudents : undefined,
    excludeStudents: excludeStudents.length > 0 ? excludeStudents : undefined,
    rankAfter: url.searchParams.get("rankAfter") ? Number.parseInt(url.searchParams.get("rankAfter")!) : undefined,
    rankBefore: url.searchParams.get("rankBefore") ? Number.parseInt(url.searchParams.get("rankBefore")!) : undefined,
  });
  if (error || !data?.raid?.ranks) {
    return { error: error?.message ?? "순위 정보를 가져오는 중 오류가 발생했어요" };
  }

  return {
    rankVisible: data.raid.rankVisible,
    ranks: url.searchParams.get("rankBefore") ? data.raid.ranks.slice(1, 11) : data.raid.ranks.slice(0, 10),
    hasMore: data.raid.ranks.length === 11,
  };
};
