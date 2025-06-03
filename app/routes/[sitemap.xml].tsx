import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { graphql } from "~/graphql";
import type { SitemapQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";

const sitemapQuery = graphql(`
  query Sitemap {
    contents {
      nodes {
        __typename uid until
      }
    }
  }
`);

type SitemapItem = {
  link: string;
  lastmod: Dayjs;
  changefreq: string;
  priority: number;
};

const HOST = "https://mollulog.net";

export const loader = async () => {
  const items: SitemapItem[] = [
    { link: `${HOST}/events`, lastmod: dayjs(), changefreq: "daily", priority: 1.0 },
  ];

  const { data, error } = await runQuery<SitemapQuery>(sitemapQuery, {});
  if (error || !data) {
    throw error ?? "failed to fetch events";
  }

  const now = dayjs();
  data.contents.nodes.forEach((content) => {
    const until = dayjs(content.until);
    const isOutdated = until.isBefore(now);
    items.push({
      link: `${HOST}/${content.__typename.toLowerCase()}s/${content.uid}`,
      lastmod: isOutdated ? until : now,
      changefreq: isOutdated ? "yearly" : "daily",
      priority: isOutdated ? 0.3 : 1.0,
    });
  });

  const xmlUrls = items.map((item) => {
    return `
<url>
  <loc>${item.link}</loc>
  <lastmod>${item.lastmod.format("YYYY-MM-DD")}</lastmod>
  <priority>${item.priority.toFixed(1)}</priority>
</url>`.trim();
  }).join("\n");

  const xmlPrefix = "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">";
  const xmlPostfix = "</urlset>";
  const sitemap = [xmlPrefix, xmlUrls, xmlPostfix].join("\n");

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "xml-version": "1.0",
      "encoding": "utf-8",
    },
  });
};
