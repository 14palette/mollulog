import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { Callout, SubTitle } from "~/components/atoms/typography";
import type { ProfileCardProps } from "~/components/organisms/profile";
import { ProfileCard } from "~/components/organisms/profile";
import { getFollowerIds, getFollowingIds } from "~/models/followership";
import { getUserStudentStates } from "~/models/student-state";
import type { ActionData } from "./api.followerships";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Timeline } from "~/components/organisms/useractivity";
import { studentImageUrl } from "~/models/assets";
import { getRouteSensei } from "./$username";
import { useSignIn } from "~/contexts/SignInProvider";

export const loader = async ({ context, request, params }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const sensei = await getRouteSensei(env, params);

  // Get a relationship
  const followingIds = await getFollowingIds(env, sensei.id);
  const followerIds = await getFollowerIds(env, sensei.id);

  const relationship = { followed: false, following: false };
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (currentUser) {
    relationship.followed = followingIds.includes(currentUser.id);
    relationship.following = followerIds.includes(currentUser.id);
  }

  // Get student tiers
  const states = await getUserStudentStates(env, sensei.username) ?? [];
  const tierCounts: { [key: number]: number } = {};
  states.forEach(({ student, tier, owned }) => {
    if (owned) {
      const studentTier = tier ?? student.initialTier;
      tierCounts[studentTier] = (tierCounts[studentTier] ?? 0) + 1;
    }
  });

  return {
    currentUsername: currentUser?.username ?? null,
    sensei: {
      username: sensei.username,
      profileStudentId: sensei.profileStudentId ?? null,
      bio: sensei.bio ?? null,
      friendCode: sensei.friendCode ?? null,
    },
    relationship,
    followingCount: followingIds.length,
    followerCount: followerIds.length,
    tierCounts,
  };
};

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""} - 프로필 | 몰루로그`.trim() },
    { name: "description", content: `${params.username} 선생님의 프로필과 최근 활동을 확인해보세요.` },
    { name: "og:title", content: `${params.username || ""} - 프로필 | 몰루로그`.trim() },
    { name: "og:description", content: `${params.username} 선생님의 프로필과 최근 활동을 확인해보세요.` },
  ];
};

export default function UserIndex() {
  const loaderData = useLoaderData<typeof loader>();
  const { sensei, currentUsername, tierCounts } = loaderData;

  let followability: ProfileCardProps["followability"] = loaderData.relationship.following ? "following" : "followable";
  if (currentUsername === sensei.username) {
    followability = "unable";
  }

  const fetcher = useFetcher<ActionData>();

  let imageUrl: string | null = null;
  if (sensei.profileStudentId !== null) {
    imageUrl = studentImageUrl(sensei.profileStudentId);
  }

  const isNewbee = sensei.username === currentUsername && Object.values(tierCounts).every((count) => count === 0);

  const { showSignIn } = useSignIn();

  return (
    <div className="my-8">
      {isNewbee && (
        <Callout className="my-8" emoji="✨">
          <span className="grow">모집한 학생을 등록해보세요.</span>
          <Link to="/edit/students" className="ml-1 underline">등록하러 가기 →</Link>
        </Callout>
      )}

      <div className="my-8">
        <ProfileCard
          {...sensei}
          imageUrl={imageUrl}
          tierCounts={tierCounts}
          followability={followability}
          followerCount={loaderData.followerCount}
          followingCount={loaderData.followingCount}
          loading={fetcher.state !== "idle"}
          onFollow={() => currentUsername ? fetcher.submit({ username: sensei.username }, { method: "post", action: "/api/followerships" }) : showSignIn()}
          onUnfollow={() => currentUsername ? fetcher.submit({ username: sensei.username }, { method: "delete", action: "/api/followerships" }) : showSignIn()}
        />
      </div>

      <div className="md:my-8 my-16">
        <SubTitle text="최근 활동" />
        <Timeline activities={[]} />
      </div>
    </div>
  );
}
