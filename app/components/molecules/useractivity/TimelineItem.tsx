import { Link } from "react-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ProfileImage } from "~/components/atoms/student";
import type { UserActivity } from "~/models/user-activity";

dayjs.extend(relativeTime);
dayjs.locale("ko");

type TimelineTiemProps = {
  activity: UserActivity;
  showProfile?: boolean;
  showTime?: boolean;
}

export default function TimelineItem({ activity, showProfile, showTime }: TimelineTiemProps) {
  const eventAt = dayjs(activity.eventAt).fromNow();
  if (activity.activityType === "following") {
    const { followee } = activity.following!;
    return (
      <>
        {(showProfile || showTime) && (
          <div className="mt-8 mb-2 px-2 flex items-center">
            {showProfile && (
              <Link to={`/@${activity.user.username}`}>
                <div className="flex items-center hover:underline cursor-pointer mr-2">
                  <ProfileImage studentId={activity.user.profileStudentId} imageSize={8} />
                  <span className="ml-2 font-semibold">{activity.user.username}</span>
                </div>
              </Link>
            )}
            {showTime && (
              <span className="text-xs text-neutral-500">{eventAt}</span>
            )}
          </div>
        )}
        <div className="my-2 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
          <div className="flex items-center">
            <ProfileImage studentId={followee.profileStudentId} />
            <p className="ml-2">
              <Link to={`/@${followee.username}`} className="font-semibold hover:underline">
                <span>@{followee.username}</span>
              </Link>
              &nbsp;선생님을 팔로우합니다.
            </p>
          </div>
        </div>
      </>
    )
  } 
  return null;
}
