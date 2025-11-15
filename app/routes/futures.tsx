import { useEffect, useState } from "react";
import { Outlet, useLocation, type MetaFunction } from "react-router";
import { Title } from "~/components/atoms/typography";
import { ContentFilter, ContentFilterState } from "~/components/contents";
import { ScreenSelector } from "~/components/navigation";

export const meta: MetaFunction = () => {
  const title = "블루 아카이브 이벤트, 픽업 미래시";
  const description = "블루 아카이브 한국 서버의 이벤트 및 총력전, 픽업 미래시 정보 모음";
  return [
    { title: `${title} | 몰루로그` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
};

const futuresContentFilterKey = "futures::content-filter";

export default function Futures() {
  const location = useLocation();
  const [filter, setFilter] = useState<ContentFilterState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(futuresContentFilterKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn("Failed to parse saved content filter:", e);
        }
      }
    }
    return { types: [], onlyPickups: false };
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(futuresContentFilterKey, JSON.stringify(filter));
    }
  }, [filter]);

  return (
    <div className="flex flex-col xl:flex-row">
      <div className="w-full xl:max-w-sm xl:mr-8 xl:sticky xl:top-6 xl:self-start">
        <Title
          text="미래시"
          description="컨텐츠 일정은 일본 서버를 바탕으로 추정된 것으로 실제 일정과 다를 수 있어요"
        />

        <ScreenSelector
          text="미래시 타임라인"
          description="컨텐츠 예상 일정을 확인해보세요"
          active={location.pathname === "/futures"}
          link="/futures"
        />

        <ContentFilter initialFilter={filter} onFilterChange={setFilter} />
      </div>

      <div className="grow mt-6 xl:mt-0 xl:p-8 max-w-3xl">
        <Outlet context={{ filter }} />
      </div>
    </div>
  );
}
