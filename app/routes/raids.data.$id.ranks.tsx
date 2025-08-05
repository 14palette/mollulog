import type { LoaderFunctionArgs } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { graphql } from "~/graphql";
import type { Defense, RaidRank } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { getRecruitedStudentTiers } from "~/models/recruited-student";
import { getAllStudents } from "~/models/student";

const raidRanksQuery = graphql(`
  query RaidRanks($defenseType: Defense, $raidUid: String!, $includeStudents: [RaidRankFilter!], $excludeStudents: [RaidRankFilter!], $rankAfter: Int, $rankBefore: Int) {
    raid(uid: $raidUid) {
      rankVisible
      ranks(defenseType: $defenseType, first: 11, rankAfter: $rankAfter, rankBefore: $rankBefore, includeStudents: $includeStudents, excludeStudents: $excludeStudents) {
        rank score
        parties {
          partyIndex
          slots {
            slotIndex tier level isAssist
            student { uid name }
          }
        }
        video { youtubeId }
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
  const raidUid = params.id;
  if (!raidUid) {
    throw new Response("Raid ID is required", { status: 400 });
  }

  const url = new URL(request.url);
  const includeStudentUids: string[] = url.searchParams.get("includeStudentIds")?.split(",") ?? [];
  let excludeStudentUids: string[] = url.searchParams.get("excludeStudentIds")?.split(",") ?? [];

  const filterNotOwned = url.searchParams.get("filterNotOwned") === "true";
  if (filterNotOwned) {
    const sensei = await getAuthenticator(context.cloudflare.env).isAuthenticated(request);
    if (sensei) {
      const allStudents = await getAllStudents(context.cloudflare.env);
      const recruitedStudentTiers = await getRecruitedStudentTiers(context.cloudflare.env, sensei.id);
      const unrecruitedStudentUids = allStudents
        .filter((student) => !recruitedStudentTiers[student.uid])
        .map((student) => student.uid);

      excludeStudentUids = excludeStudentUids.concat(unrecruitedStudentUids);
    }
  }

  const includeStudents = includeStudentUids.map((studentUid) => ({ uid: studentUid, tier: 3 }));
  const excludeStudents = excludeStudentUids.map((studentUid) => ({ uid: studentUid, tier: 8 }));

  const { data, error } = await runQuery(raidRanksQuery, {
    raidUid,
    defenseType: url.searchParams.get("defenseType") ? (url.searchParams.get("defenseType") as Defense) : null,
    includeStudents: includeStudents.length > 0 ? includeStudents : null,
    excludeStudents: excludeStudents.length > 0 ? excludeStudents : null,
    rankAfter: url.searchParams.get("rankAfter") ? Number.parseInt(url.searchParams.get("rankAfter")!) : null,
    rankBefore: url.searchParams.get("rankBefore") ? Number.parseInt(url.searchParams.get("rankBefore")!) : null,
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
