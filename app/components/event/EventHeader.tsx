import { Suspense, useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import dayjs from "dayjs";
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/16/solid";
import type { EventType } from "~/models/content.d";
import { eventTypeLocale, relativeTime } from "~/locales/ko";
import { sanitizeClassName } from "~/prophandlers";
import MultilineText from "~/components/atoms/typography/MultilineText";

type Video = {
  title: string;
  youtube: string;
  start: number | null;
};

type EventHeaderProps = {
  imageUrl: string | null;
  name: string;
  type: EventType;
  rerun: boolean;
  since: Date;
  until: Date;
  endless: boolean;

  videos?: Video[];
};

export default function EventHeader({ imageUrl, name, type, rerun, since, until, endless, videos }: EventHeaderProps) {
  const sinceDayjs = dayjs(since);
  const untilDayjs = dayjs(until);
  const now = dayjs();

  // Calculate remaining time
  let timeLabel = null;
  if (sinceDayjs.isAfter(now)) {
    timeLabel = `${relativeTime(sinceDayjs)} 시작`;
  } else if (!endless && untilDayjs.isAfter(now)) {
    timeLabel = `${relativeTime(untilDayjs)} 종료`;
  }

  // States about videos
  const [currentVideo, setCurrentVideo] = useState<Video | null>(videos?.[0] ?? null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoEndTimer, setVideoEndTimer] = useState<NodeJS.Timeout | null>(null);

  const playerRef = useRef<any | null>(null);
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    if (!playerRef?.current) {
      return;
    }

    if (muted) {
      playerRef.current.mute();
    } else {
      playerRef.current.unMute();
      playerRef.current.setVolume(30);
    }
  }, [muted, playerRef]);

  let aspectRatioClass = "";
  if (!imageUrl) {
    aspectRatioClass = "";
  } else if (videos && videos.length > 0) {
    aspectRatioClass = "aspect-video";
  } else {
    aspectRatioClass = "aspect-video md:aspect-2/1";
  }

  return (
    <>
      <div className={`relative overflow-hidden -mx-4 md:mx-0 md:rounded-xl shadow-lg ${aspectRatioClass}`}>
        {/* Videos */}
        {currentVideo && (
          <Suspense>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden md:rounded-xl">
              <YouTube
                videoId={currentVideo.youtube}
                className="w-full h-full"
                iframeClassName="w-full h-full -z-10"
                opts={{
                  playerVars: { autoplay: 1, mute: 1, controls: 0, rel: 0, start: currentVideo.start ?? 0 },
                }}
                // @ts-ignore
                onReady={(ytEvent: any) => {
                  playerRef.current = ytEvent.target;
                  setMuted(true);
                }}
                // @ts-ignore
                onPlay={(ytEvent: any) => {
                  if (videoEndTimer) {
                    clearTimeout(videoEndTimer);
                  }

                  setVideoPlaying(true);
                  setVideoEndTimer(
                    setTimeout(
                      () => { setVideoPlaying(false); },
                      (ytEvent.target.getDuration() - (currentVideo.start ?? 0) - 1.0) * 1000,
                    ),
                  );
                }}
                onEnd={() => setVideoPlaying(false)}
              />
            </div>
          </Suspense>
        )}

        {/* Background Image */}
        {imageUrl && (
          <img
            src={imageUrl} alt={name}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${videoPlaying ? "opacity-0" : "opacity-100"}`}
          />
        )}

        {/* Action Buttons */}
        <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
          {videos && videos.length > 0 && (
            <div className="p-2 rounded-full bg-neutral-900/75 hover:bg-neutral-700/75 transition backdrop-blur-sm cursor-pointer text-white" onClick={() => setMuted((prev) => !prev)}>
              {muted ? <SpeakerXMarkIcon className="size-4" /> : <SpeakerWaveIcon className="size-4" />}
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className={`p-4 md:p-6 ${imageUrl ? "absolute bottom-0 left-0 right-0 text-white bg-linear-to-t from-black/80 via-black/60 to-transparent via-75%" : "bg-linear-to-br from-neutral-900 via-neutral-800 to-neutral-700 via-75%"}`}>
          {/* Event Type and Status */}
          <span className="text-sm md:text-base text-white">
            {eventTypeLocale[type]}
          </span>

          {/* Event Name */}
          <h3 className="my-1">
            <MultilineText className="text-xl md:text-2xl font-bold text-white" texts={name.split("\n")} />
          </h3>

          <div className="flex items-end gap-1">
            <p className="grow text-xs md:text-sm text-neutral-300">
              {`${sinceDayjs.format("YYYY-MM-DD")} ~ ${untilDayjs.format("YYYY-MM-DD")}`}
            </p>
            {rerun && <Label text="복각" />}
            {timeLabel && <Label text={timeLabel} showRedDot={sinceDayjs.isBefore(now)} />}
            {!endless && untilDayjs.isBefore(now) && <Label text="종료" />}
          </div>
        </div>
      </div>

      {videos && videos.length > 0 && <VideoList videos={videos} currentVideo={currentVideo} onVideoSelect={setCurrentVideo} />}
    </>
  );
}

function Label({ text, showRedDot = false }: { text: string, showRedDot?: boolean }): React.ReactNode {
  return (
    <span className="flex items-center gap-1.5 px-2 md:px-3 py-1 text-xs md:text-sm bg-black/40 backdrop-blur-sm rounded-full text-white border border-white/20">
      {showRedDot && <div className="size-2 bg-red-500 rounded-full animate-pulse" />}
      {text}
    </span>
  );
};

type VideoListProps = {
  videos: Video[];
  currentVideo: Video | null;
  onVideoSelect: (video: Video) => void;
};

function VideoList({ videos, currentVideo, onVideoSelect }: VideoListProps): React.ReactNode {
  const videoListRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!currentVideo || !videoListRef.current) {
      return;
    }

    const target = videoListRef.current.children[videos!.findIndex((video) => video.youtube === currentVideo.youtube)] as HTMLElement;
    videoListRef.current.scrollTo({
      left: target.offsetLeft - 40,
      behavior: "smooth",
    });
  }, [currentVideo, videoListRef]);

  const changeVideo = (indexDiff: 1 | -1) => {
    if (!currentVideo) {
      return;
    }

    const newIndex = (videos.findIndex((video) => video.youtube === currentVideo.youtube) + indexDiff + videos.length) % videos.length;
    onVideoSelect(videos[newIndex]);
  };

  return (
    <div className="w-full my-2 md:my-4 relative">
      <div className="w-full px-10 flex flex-nowrap overflow-x-scroll no-scrollbar" ref={videoListRef}>
        {videos.map((video) => (
          <span
            key={video.youtube}
            className={sanitizeClassName(`
              -mx-1 px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition text-sm cursor-pointer shrink-0
              ${currentVideo?.youtube === video.youtube ? "bg-neutral-100 dark:bg-neutral-700 font-bold" : ""}
            `)}
            onClick={() => onVideoSelect(video)}
          >
            {video.title}
          </span>
        ))}
      </div>
      <div className="h-full w-8 absolute left-0 top-0 flex items-center justify-center bg-white dark:bg-neutral-800">
        <ChevronDoubleLeftIcon
          className="p-1 size-6 hover:bg-black hover:text-white rounded-full transition cursor-pointer" strokeWidth={2}
          onClick={() => changeVideo(-1)}
        />
      </div>
      <div className="h-full w-8 absolute right-0 top-0 flex items-center justify-center bg-white dark:bg-neutral-800">
        <ChevronDoubleRightIcon
          className="p-1 size-6 hover:bg-black hover:text-white rounded-full transition cursor-pointer" strokeWidth={2}
          onClick={() => changeVideo(1)}
        />
      </div>
    </div>
  );
}
