import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, Link, useLoaderData } from "@remix-run/react";
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
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { FloatingButton } from "~/components/atoms/button";

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

  const [openFilter, setOpenFilter] = useState(false);

  return (
    <>
      <Link to="/futures" className="xl:hidden">
        <p className="-mx-1 py-4 text-sm text-neutral-700 dark:text-neutral-300">← 전체 이벤트 미래시 보기</p>
      </Link>
      <div className="mb-8 xl:mt-8 max-w-3xl mx-auto">
        <ContentHeader
          name={raid.name}
          type={raidTypeLocale[raid.type]}
          since={dayjs(raid.since)}
          until={dayjs(raid.until)}
          image={bossBannerUrl(raid.boss)}
          videos={null}
        />
      </div>

      <div className="flex flex-col-reverse xl:flex-row">
        <div className="xl:w-3/5 shrink-0">
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

        {raid.rankVisible && (
          <>
            <div className={`${openFilter ? "block" : "hidden"} -mx-4 xl:mx-4 xl:block w-full fixed bottom-0 xl:grow xl:sticky xl:top-4 xl:self-start`}>
              <RaidRankFilter
                filters={filters}
                setRaidFilters={setFilters}
                signedIn={signedIn}
                students={allStudents}
                onClose={() => setOpenFilter(false)}
              />
            </div>
            {!openFilter && (
              <div className="xl:hidden">
                <FloatingButton
                  Icon={<MagnifyingGlassIcon className="size-4 mr-2" strokeWidth={2} />}
                  text="편성 찾기"
                  onClick={() => setOpenFilter(true)}
                />
              </div>
            )}
          </>
        )}
      </div>
      
    </>
  );
}
