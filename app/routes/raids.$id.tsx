import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { useState } from "react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { SubTitle } from "~/components/atoms/typography";
import { ContentHeader } from "~/components/organisms/content";
import { graphql } from "~/graphql";
import type { RaidDetailQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { raidTypeLocale } from "~/locales/ko";
import { bossBannerUrl } from "~/models/assets";
import { RaidRanks } from "~/components/organisms/raid";
import type { RaidRankFilters } from "~/components/organisms/raid/RaidRanks";
import { getAllStudents } from "~/models/student";

const raidDetailQuery = graphql(`
  query RaidDetail($raidId: String!) {
    raid(raidId: $raidId) {
      raidId type name boss since until terrain attackType defenseType
    }
  }
`);

export const loader = async ({ request, context, params }: LoaderFunctionArgs) => {
  const raidId = params.id;
  if (!raidId) {
    throw new Response(
      JSON.stringify({ error: { message: "이벤트 정보를 찾을 수 없어요" } }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const env = context.cloudflare.env;
  const { data, error } = await runQuery<RaidDetailQuery>(raidDetailQuery, { raidId });
  let errorMessage: string | null = null;
  if (error || !data) {
    errorMessage = error?.message ?? "이벤트 정보를 가져오는 중 오류가 발생했어요";
  } else if (!data.raid) {
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

  const sensei = await getAuthenticator(env).isAuthenticated(request);
  const allStudents = await getAllStudents(env, true);
  return json({
    raid: data!.raid!,
    signedIn: sensei !== null,
    allStudents: allStudents.map((student) => ({
      studentId: student.id,
      name: student.name,
    })),
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: "이벤트 정보 | 몰루로그" }];
  }

  const { raid } = data;
  const title = `${raidTypeLocale[raid.type]} ${raid.name} 정보`;
  const description = `블루 아카이브 ${raidTypeLocale[raid.type]} ${raid.name} 이벤트의 공략 정보 모음`;
  return [
    { title: `${title} | 몰루로그` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}

export default function RaidDetail() {
  const { raid, signedIn, allStudents } = useLoaderData<typeof loader>();

  const [filters, setFilters] = useState<RaidRankFilters>({
    byStates: false,
    byTier: false,
    byFutures: false,
    futureStudentIds: [],
  });

  return (
    <>
      <div className="my-8">
        <ContentHeader
          name={raid.name}
          type={raidTypeLocale[raid.type]}
          since={dayjs(raid.since)}
          until={dayjs(raid.until)}
          image={bossBannerUrl(raid.boss)}
          videos={null}
        />
      </div>

      <div className="mb-2">
        <SubTitle className="inline" text="일본 서비스 순위 정보 " />
        <sup>beta</sup>
      </div>
      <p className="mb-4 text-sm text-neutral-500">상위 2만명의 순위 정보를 제공해요.</p>
      <RaidRanks
        raidId={raid.raidId}
        students={allStudents}
        signedIn={signedIn}
        filters={filters}
        onFilterChange={setFilters}
      />
    </>
  );
}
