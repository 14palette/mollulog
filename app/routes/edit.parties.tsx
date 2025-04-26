import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { useLoaderData } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { AddContentButton } from "~/components/molecules/editor";
import { PartyView } from "~/components/organisms/party";
import { graphql } from "~/graphql";
import type { RaidForPartyEditQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { getUserParties, removePartyByUid } from "~/models/party";
import { getUserStudentStates } from "~/models/student-state";

export const raidForPartyEditQuery = graphql(`
  query RaidForPartyEdit {
    raids {
      nodes { raidId name type boss terrain since until }
    }
  }
`);

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect("/unauthorized");
  }

  const raidQueryResult = await runQuery<RaidForPartyEditQuery>(raidForPartyEditQuery, {});
  if (!raidQueryResult.data) {
    throw "failed to load data";
  }

  const parties = (await getUserParties(env, currentUser.username)).reverse();
  const states = await getUserStudentStates(env, currentUser.username, true);
  return { parties, states, raids: raidQueryResult.data.raids.nodes };
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
  }

  const formData = await request.formData();
  await removePartyByUid(env, sensei, formData.get("uid") as string);
  return redirect("/edit/parties");
};

export default function EditParties() {
  const { parties, states, raids } = useLoaderData<typeof loader>();
  return (
    <div className="max-w-4xl">
      <AddContentButton text="새로운 편성 추가하기" link="/edit/parties/new" />
      {parties.map((party) => (
        <PartyView
          key={party.uid}
          party={party}
          raids={raids.map((raid) => ({
            ...raid,
            since: new Date(raid.since),
            until: new Date(raid.until),
          }))}
          studentStates={states || []}
          editable
        />
      ))}
    </div>
  );
}
