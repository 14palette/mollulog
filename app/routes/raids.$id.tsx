import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { useState } from "react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Callout, SubTitle } from "~/components/atoms/typography";
import { ContentHeader } from "~/components/organisms/content";
import { graphql } from "~/graphql";
import type { RaidDetailQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { defenseTypeLocale, raidTypeLocale } from "~/locales/ko";
import { bossBannerUrl } from "~/models/assets";
import { RaidRanks, RaidRankFilter } from "~/components/organisms/raid";
import type { RaidRankFilters } from "~/components/organisms/raid/RaidRanks";
import { getAllStudents } from "~/models/student";
import { FilterButtons } from "~/components/molecules/student";
import { useSignIn } from "~/contexts/SignInProvider";

const raidDetailQuery = graphql(`
  query RaidDetail($raidId: String!) {
    raid(raidId: $raidId) {
      defenseTypes { defenseType difficulty }
      raidId type name boss since until terrain attackType rankVisible
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

const buttonColors = {
  "light": "bg-linear-to-r from-red-500 to-orange-400",
  "heavy": "bg-linear-to-r from-amber-500 to-yellow-400",
  "special": "bg-linear-to-r from-blue-500 to-sky-400",
  "elastic": "bg-linear-to-r from-purple-500 to-fuchsia-400",
};

export default function RaidDetail() {
  const { raid, signedIn, allStudents } = useLoaderData<typeof loader>();
  const { showSignIn } = useSignIn();

  const [filters, setFilters] = useState<RaidRankFilters>({
    defenseType: raid.type === "elimination" ? raid.defenseTypes[0].defenseType : null,
    filterNotOwned: false,
    includeStudents: [],
    excludeStudents: [],
    rankAfter: null,
    rankBefore: null,
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

      <div className="xl:relative">
        {raid.rankVisible && (
          <div className="fixed bottom-8 w-full max-w-3xl px-2 -mx-4 xl:-mx-8 xl:px-0 xl:w-96 xl:absolute xl:right-0 xl:top-0 xl:translate-x-full z-10">
            <RaidRankFilter
              raidType={raid.type}
              defenseTypes={raid.defenseTypes}
              filters={filters}
              setRaidFilters={setFilters}
              signedIn={signedIn}
              students={allStudents}
            />
          </div>
        )}
        <div>
          <div className="mb-2">
            <SubTitle className="inline" text="일본 서비스 편성 정보 " />
            <sup>beta</sup>
          </div>
          <p className="mb-4 text-sm text-neutral-500">상위 2만명의 편성 정보를 제공해요.</p>
          {raid.rankVisible && raid.type === "elimination" && (
            <div className="mb-6">
              <FilterButtons exclusive={true} buttonProps={
                raid.defenseTypes.map(({ defenseType }, index) => ({
                  text: defenseTypeLocale[defenseType],
                  color: buttonColors[defenseType],
                  active: index === 0,
                  onToggle: () => setFilters((prev) => ({ ...prev, defenseType, rankAfter: null, rankBefore: null })),
                }))
              } />
            </div>
          )}
          {!signedIn && (
            <Callout className="my-4" emoji="✨">
              <p>
                <span className="cursor-pointer underline" onClick={() => showSignIn()}>로그인</span> 후 모집한 학생 정보를 등록하면 나에게 맞는 편성을 찾을 수 있어요.
              </p>
            </Callout>
          )}
          <RaidRanks
            raidId={raid.raidId}
            filters={filters}
            setFilters={setFilters}
          />
        </div>
        
      </div>
    </>
  );
}
