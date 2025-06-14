import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { AddContentButton } from "~/components/molecules/editor";
import { PartyView } from "~/components/organisms/party";
import { graphql } from "~/graphql";
import type { RaidForPartyQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { getUserParties, removePartyByUid } from "~/models/party";
import { getAllStudents } from "~/models/student";
import { getRouteSensei } from "./$username";
import { getRecruitedStudentTiers } from "~/models/recruited-student";

export const raidForPartyQuery = graphql(`
  query RaidForParty {
    raids {
      nodes { uid name type boss terrain since }
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

  const allStudents = await getAllStudents(env, true);
  const recruitedStudentTiers = await getRecruitedStudentTiers(env, sensei.id);

  const parties = (await getUserParties(env, sensei.username)).reverse();
  return {
    me: sensei.username === currentUser?.username,
    parties,
    students: allStudents.map((student) => ({
      uid: student.uid,
      name: student.name,
      tier: recruitedStudentTiers[student.uid] ?? null,
    })),
    raids: data.raids.nodes,
  };
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
  }

  const formData = await request.formData();
  await removePartyByUid(env, sensei.id, formData.get("uid") as string);
  return null;
};

export default function UserPartyPage() {
  const { me, parties, students, raids } = useLoaderData<typeof loader>();

  return (
    <div className="my-8">
      {parties.length === 0 && (
        <p className="my-16 text-center">
          아직 등록한 공략 정보가 없어요
        </p>
      )}

      {me && <AddContentButton text="새로운 공략 추가하기" link={`./edit/new`} />}

      {parties.map((party) => (
        <PartyView
          key={`party-${party.uid}`}
          party={party}
          students={students}
          raids={raids.map((raid) => ({ ...raid, raidId: raid.uid, since: new Date(raid.since) }))}
          editable={me}
        />
      ))}
    </div>
  );
}
