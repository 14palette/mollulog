import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import type { ProfileCardProps } from "~/components/organisms/profile";
import { ProfileCard } from "~/components/organisms/profile";
import { getFollowerIds, getFollowingIds } from "~/models/followership";
import type { ActionData } from "./api.followerships";
import { getAuthenticator } from "~/auth/authenticator.server";
import { getRouteSensei } from "./$username";
import { useSignIn } from "~/contexts/SignInProvider";
import { StudentGradingComments } from "~/components/molecules/student";
import { SubTitle } from "~/components/atoms/typography";
import { getRecruitedStudents } from "~/models/recruited-student";
import { getStudentGradingsByUser } from "~/models/student-grading";
import { getAllStudentsMap } from "~/models/student";

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
  const recruitedStudents = await getRecruitedStudents(env, sensei.id);
  const tierCounts: { [key: number]: number } = {};
  recruitedStudents.forEach(({ tier }) => {
    tierCounts[tier] = (tierCounts[tier] ?? 0) + 1;
  });

  // Get all gradings by this user
  const gradings = await getStudentGradingsByUser(env, sensei.id);
  const allStudentsMap = await getAllStudentsMap(env, true);
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
    gradings: gradings.map((grading) => ({
      ...grading,
      studentName: allStudentsMap[grading.studentUid]!.name,
    })),
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
  const { sensei, currentUsername, tierCounts, gradings } = loaderData;

  let followability: ProfileCardProps["followability"] = loaderData.relationship.following ? "following" : "followable";
  if (currentUsername === sensei.username) {
    followability = "unable";
  }

  const fetcher = useFetcher<ActionData>();
  const { showSignIn } = useSignIn();

  return (
    <div className="my-8">
      <div className="my-8">
        <ProfileCard
          {...sensei}
          profileStudentUid={sensei.profileStudentId}
          tierCounts={tierCounts}
          followability={followability}
          followerCount={loaderData.followerCount}
          followingCount={loaderData.followingCount}
          loading={fetcher.state !== "idle"}
          onFollow={() => currentUsername ? fetcher.submit({ username: sensei.username }, { method: "post", action: "/api/followerships" }) : showSignIn()}
          onUnfollow={() => currentUsername ? fetcher.submit({ username: sensei.username }, { method: "delete", action: "/api/followerships" }) : showSignIn()}
        />
      </div>

      {/* Grading Comments Section */}
      {gradings.length > 0 && (
        <div className="my-8">
          <SubTitle text="학생 평가 내역" />
          <StudentGradingComments
            gradings={gradings.map((grading) => ({
              ...grading,
              student: {
                uid: grading.studentUid,
                name: grading.studentName,
              },
            }))}
          />
        </div>
      )}
    </div>
  );
}
