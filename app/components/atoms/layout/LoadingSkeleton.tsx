import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton className="my-2" key={i} style={{ width: "75%", height: "32px" }} />
      ))}
    </div>
  );
}
