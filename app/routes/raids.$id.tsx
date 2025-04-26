import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { getAuthenticator } from "~/auth/authenticator.server";
import { EmptyView, SubTitle } from "~/components/atoms/typography";
import { ContentHeader } from "~/components/organisms/content";
import { Navigation } from "~/components/organisms/navigation";
import { graphql } from "~/graphql";
import type { RaidDetailQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { raidTypeLocale } from "~/locales/ko";
import { bossBannerUrl } from "~/models/assets";
import { getAllStudents } from "~/models/student";

const raidDetailQuery = graphql(`
  query RaidDetail($raidId: String!) {
    raid(raidId: $raidId) {
      defenseTypes { defenseType difficulty }
      raidId type name boss since until terrain attackType rankVisible
    }
  }
`);

export const buttonColors = {
  "light": "bg-linear-to-r from-red-500 to-orange-400",
  "heavy": "bg-linear-to-r from-amber-500 to-yellow-400",
  "special": "bg-linear-to-r from-blue-500 to-sky-400",
  "elastic": "bg-linear-to-r from-purple-500 to-fuchsia-400",
};

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
  return {
    raid: data!.raid!,
    signedIn: sensei !== null,
    allStudents: allStudents.map((student) => ({
      studentId: student.id,
      name: student.name,
    })),
  };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: "이벤트 정보 | 몰루로그" }];
  }

  const { raid } = data;
  const title = `${raidTypeLocale[raid.type]} ${raid.name} 정보`;
  const description = `블루 아카이브 ${raidTypeLocale[raid.type]} ${raid.name} 랭킹, 공략 정보 모음`;
  return [
    { title: `${title} | 몰루로그` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}

export type OutletContext = {
  raid: NonNullable<RaidDetailQuery["raid"]>;
  signedIn: boolean;
  allStudents: {
    studentId: string;
    name: string;
  }[];
};

export default function RaidDetail() {
  const { raid, signedIn, allStudents } = useLoaderData<typeof loader>();

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

      {raid.rankVisible ?
        <>
          <div>
            <SubTitle className="inline" text="일본 서비스 편성 정보 " />
            <sup>beta</sup>
          </div>
          <p className="mt-2 mb-4 text-sm text-neutral-500">상위 2만명의 편성 정보를 제공해요.</p>

          <Navigation links={[
            { to: `/raids/${raid.raidId}/`, text: "순위" },
            { to: `/raids/${raid.raidId}/statistics`, text: "통계" },
          ]} />

          <Outlet context={{ raid, signedIn, allStudents }} />
        </> :
        <EmptyView text="순위 정보를 준비중이에요" />
      }
    </>
  );
}
