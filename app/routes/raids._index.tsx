import dayjs from "dayjs";
import { redirect, data as routeData } from "react-router";
import { graphql } from "~/graphql";
import { runQuery } from "~/lib/baql";

const latestRaidQuery = graphql(`
  query LatestRaid($untilAfter: ISO8601DateTime!) {
    raids(types: [total_assault, elimination], untilAfter: $untilAfter) {
      nodes { uid type name boss since until terrain attackType rankVisible }
    }
  }
`);

export const loader = async () => {
  const { data, error } = await runQuery(latestRaidQuery, { untilAfter: new Date() });
  if (error || !data) {
    throw routeData(
      { error: { message: "총력전/대결전 정보를 찾을 수 없어요" } },
      { status: 404 },
    );
  }

  const latestRaid = data.raids.nodes.filter((raid) => raid.rankVisible).sort((a, b) => dayjs(a.since).diff(dayjs(b.since)))[0];
  if (!latestRaid) {
    throw routeData(
      { error: { message: "총력전/대결전 정보를 찾을 수 없어요" } },
      { status: 404 },
    );
  }
  return redirect(`/raids/${latestRaid.uid}`);
};
