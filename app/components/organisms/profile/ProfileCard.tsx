import { Link } from "@remix-run/react";
import { Progress } from "~/components/atoms/profile";
import type { ProgressProps } from "~/components/atoms/profile/Progress";
import { ProfileUsername } from "~/components/molecules/profile";

export type ProfileCardProps = {
  imageUrl: string | null;
  username: string;
  bio: string | null;
  friendCode: string | null;
  tierCounts: { [key: number]: number };
  loading: boolean;
  followability: "followable" | "following" | "unable";
  following: number;
  followers: number;
  onFollow: () => void;
  onUnfollow: () => void;
};

const colors: { [tier: number]: ProgressProps["color"] } = {
  1: "red",
  2: "orange",
  3: "yellow",
  4: "green",
  5: "cyan",
  6: "blue",
  7: "purple",
  8: "fuchsia",
};

export default function ProfileCard(props: ProfileCardProps) {
  const { username, tierCounts } = props;

  let totalCount = 0;
  Object.values(tierCounts).forEach((count) => { totalCount += count; });

  return (
    <div className="my-4 border border-neutral-100 dark:border-neutral-700 rounded-lg shadow-lg">
      <ProfileUsername {...props} />

      <div className="m-4 md:m-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((tier) => (
          <div key={`tier-${tier}`} className="my-2">
            <div className="flex">
              <div className="w-fit shrink-0 flex items-center">
                {(tier <= 5) ?
                  <span className="w-4 mr-1 inline-block text-yellow-500">★</span> :
                  <img className="w-4 h-4 mr-1 inline-block" src="/icons/exclusive_weapon.png" alt="고유 장비" />
                }
                <span className="w-3 inline-block mr-1">{tier <= 5 ? tier : tier - 5}</span>
                <span className="w-16 inline-block">- {tierCounts[tier] ?? 0}명</span>
              </div>
              <div className="grow">
                <Progress ratio={totalCount > 0 ? (tierCounts[tier] ?? 0) / totalCount : 0} color={colors[tier]} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link to={`/@${username}/students`}>
        <p className="m-4 md:m-6 text-right">전체학생 목록 →</p>
      </Link>
    </div>
  );
}
