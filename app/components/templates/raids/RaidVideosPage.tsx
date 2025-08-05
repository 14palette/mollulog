import { useFetcher } from "react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { EmptyView } from "~/components/atoms/typography";
import { LoadingSkeleton } from "~/components/atoms/layout";
import { RaidVideosData } from "~/routes/raids.data.$id.videos";
import { PlayIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { FilterButtons } from "~/components/molecules/content";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";

export type RaidVideosProps = {
  raid: {
    uid: string;
    type: string;
    defenseTypes: { defenseType: string; difficulty: string | null }[];
    rankVisible: boolean;
  };
};

export default function RaidVideosPage({ raid }: RaidVideosProps) {
  const [sort, setSort] = useState<"PUBLISHED_AT_DESC" | "SCORE_DESC">("SCORE_DESC");
  const [allVideos, setAllVideos] = useState<NonNullable<RaidVideosData>["videos"]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher<RaidVideosData>();

  // Load initial videos when sort changes
  useEffect(() => {
    setAllVideos([]);
    setHasNextPage(false);
    setEndCursor(null);
    setIsLoading(true);
    
    const params = new URLSearchParams();
    params.set("first", "12");
    params.set("sort", sort);
    
    fetcher.load(`/raids/data/${raid.uid}/videos?${params.toString()}`);
  }, [raid.uid, sort]);

  // Handle fetcher data updates
  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      if (allVideos.length === 0) {
        // Initial load
        setAllVideos(fetcher.data.videos || []);
        setHasNextPage(fetcher.data.pageInfo?.hasNextPage || false);
        setEndCursor(fetcher.data.pageInfo?.endCursor || null);
      } else {
        // Append new videos for infinite scroll
        setAllVideos(prev => [...prev, ...(fetcher.data!.videos || [])]);
        setHasNextPage(fetcher.data.pageInfo?.hasNextPage || false);
        setEndCursor(fetcher.data.pageInfo?.endCursor || null);
      }
      setIsLoading(false);
    }
  }, [fetcher.data, fetcher.state]);

  // Load more videos function
  const loadMoreVideos = useCallback(() => {
    if (isLoading || !hasNextPage || !endCursor) return;
    
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set("first", "12");
    params.set("sort", sort);
    params.set("after", endCursor);
    
    fetcher.load(`/raids/data/${raid.uid}/videos?${params.toString()}`);
  }, [isLoading, hasNextPage, endCursor, sort, raid.uid]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoading) {
          loadMoreVideos();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isLoading, loadMoreVideos]);

  return (
    <div className="w-full max-w-4xl">
      <p className="-mt-2 mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        제목을 기준으로 자동 분류되어 정확하지 않을 수 있어요.
      </p>
      <div className="my-4">
        <FilterButtons
          Icon={ArrowsUpDownIcon}
          buttonProps={[
            {
              text: "점수순",
              active: sort === "SCORE_DESC",
              onToggle: () => {
                setSort("SCORE_DESC");
              },
            },
            {
              text: "최신순",
              active: sort === "PUBLISHED_AT_DESC",
              onToggle: () => {
                setSort("PUBLISHED_AT_DESC");
              },
            },
          ]}
          exclusive
          atLeastOne
        />
      </div>

      {allVideos.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allVideos.map((video) => <VideoCard key={video.id} {...video} />)}
          </div>

          {/* Infinite scroll loading indicator */}
          {hasNextPage && (
            <div ref={loadingRef} className="flex justify-center py-8">
              {isLoading && <LoadingSkeleton />}
            </div>
          )}
        </div>
      ) : !isLoading ? (
        <EmptyView text="공략 영상을 준비중이에요" />
      ) : (
        <LoadingSkeleton />
      )}
    </div>
  );
}

type VideoCardProps = {
  title: string;
  score: number;
  youtubeId: string;
  thumbnailUrl: string;
  publishedAt: string;
};

function VideoCard({ title, score, youtubeId, thumbnailUrl, publishedAt }: VideoCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden transition-colors cursor-pointer">
      <div className="relative aspect-video">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <PlayIcon className="w-12 h-12 text-white" />
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0"
          aria-label={`${title} 영상 보기`}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm line-clamp-2 mb-2">
          {title}
        </h3>
        <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
          <span>{score.toLocaleString()}점</span>
          <span>{dayjs(publishedAt.slice(0, 10)).format("YYYY.MM.DD")}</span>
        </div>
      </div>
    </div>
  );
}
