import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Callout } from "~/components/atoms/typography";
import { AddContentButton } from "~/components/molecules/editor";
import { PartyView } from "~/components/organisms/party";
import { graphql } from "~/graphql";
import type { RaidForPartyQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { getUserParties } from "~/models/party";
import { getUserStudentStates } from "~/models/student-state";
import { getRouteSensei } from "./$username";

export const raidForPartyQuery = graphql(`
  query RaidForParty {
    raids {
      nodes { raidId name type boss terrain since }
    }
  }
`);

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""} - 편성 | 몰루로그`.trim() },
    { name: "description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
    { name: "og:title", content: `${params.username || ""} - 편성 | 몰루로그`.trim() },
    { name: "og:description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
  ];
};

export const loader = async ({ context, request, params }: LoaderFunctionArgs) => {
  const { data } = await runQuery<RaidForPartyQuery>(raidForPartyQuery, {});
  if (!data) {
    throw new Error("failed to load data");
  }

  const env = context.cloudflare.env;
  const sensei = await getRouteSensei(env, params);
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  const parties = (await getUserParties(env, sensei.username)).reverse();
  const states = await getUserStudentStates(env, sensei.username, true);

  return json({
    me: sensei.username === currentUser?.username,
    states: states!,
    parties,
    raids: data.raids.nodes,
  });
};

export default function UserPartyPage() {
  const { me, states, parties, raids } = useLoaderData<typeof loader>();
  const isNewbee = me && parties.length === 0;

  return (
    <div className="my-8">
      {isNewbee && (
        <Callout className="my-4 flex">
          <span className="grow">✨ 학생 편성을 등록해보세요.</span>
          <Link to="/edit/parties" className="ml-1 underline">등록하러 가기 →</Link>
        </Callout>
      )}

      {parties.length === 0 && (
        <p className="my-16 text-center">
          아직 등록한 편성이 없어요
        </p>
      )}

      {me && <AddContentButton text="새로운 편성 추가하기" link="/edit/parties/new" />}

      {parties.map((party) => (
        <PartyView
          key={`party-${party.uid}`}
          party={party}
          studentStates={states}
          raids={raids.map((raid) => ({ ...raid, since: new Date(raid.since) }))}
          editable={me}
        />
      ))}
    </div>
  );
}
