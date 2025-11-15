import { and, eq, inArray, not, or, sql, type SQLWrapper } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { Env } from "~/env.server";
import { nanoid } from "nanoid/non-secure";
import { senseisTable } from "./sensei";
import { graphql } from "~/graphql";
import { FutureContentsQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { fetchCached } from "./base";


type ContentMemo = {
  uid: string;
  contentId: string;
  body: string;
  visibility: ContentMemoVisibility;
};

type ContentMemoWithSensei = ContentMemo & {
  sensei: {
    username: string;
    profileStudentId: string | null;
  };
};

type ContentMemoVisibility = "private" | "public";

export const futureContentMemo = sqliteTable("content_memos", {
  id: int().primaryKey({ autoIncrement: true }),
  uid: text().notNull(),
  userId: int().notNull(),
  contentId: text().notNull(),
  body: text().notNull(),
  visibility: text().notNull().default("private"),
  createdAt: text().notNull().default(sql`current_timestamp`),
  updatedAt: text().notNull().default(sql`current_timestamp`),
});

const SELECT_USER_MEMOS_COLUMNS = {
  uid: futureContentMemo.uid,
  contentId: futureContentMemo.contentId,
  body: futureContentMemo.body,
  visibility: futureContentMemo.visibility,
};

export async function getUserMemos(env: Env, userId: number): Promise<ContentMemo[]> {
  const db = drizzle(env.DB);
  const results = await db.select(SELECT_USER_MEMOS_COLUMNS)
    .from(futureContentMemo)
    .where(eq(futureContentMemo.userId, userId))
    .all()

  return results.map(toModel);
}

const SELECT_CONTENT_MEMOS_COLUMNS = {
  ...SELECT_USER_MEMOS_COLUMNS,
  sensei: {
    username: senseisTable.username,
    profileStudentId: senseisTable.profileStudentId,
  },
};

export async function getContentMemos(env: Env, contentId: string, userId?: number): Promise<ContentMemoWithSensei[]> {
  return (await getContentsMemos(env, [contentId], userId))[contentId] ?? [];
}

export async function getContentsMemos(env: Env, contentIds: string[], userId?: number): Promise<Record<string, ContentMemoWithSensei[]>> {
  const db = drizzle(env.DB);
  const results = await db.select(SELECT_CONTENT_MEMOS_COLUMNS)
    .from(futureContentMemo)
    .where(and(
      not(eq(futureContentMemo.body, "")),
      inArray(futureContentMemo.contentId, contentIds),
      or(...visibilityFilter(userId)),
    ))
    .innerJoin(senseisTable, eq(futureContentMemo.userId, senseisTable.id))
    .all();

  return results.reduce((acc, result) => {
    acc[result.contentId] = [...(acc[result.contentId] ?? []), toModel(result)];
    return acc;
  }, {} as Record<string, ContentMemoWithSensei[]>);
}

function toModel<T extends { visibility: string }>(rows: T): (T & { visibility: ContentMemoVisibility }) {
  return { ...rows, visibility: rows.visibility as ContentMemoVisibility };
}

export async function setMemo(env: Env, userId: number, contentId: string, body: string, visibility: ContentMemoVisibility = "private"): Promise<void> {
  const db = drizzle(env.DB);
  await db.insert(futureContentMemo).values({ uid: nanoid(8), userId, contentId, body, visibility })
    .onConflictDoUpdate({
      target: [futureContentMemo.userId, futureContentMemo.contentId],
      set: { body, visibility, updatedAt: sql`current_timestamp` }
    });
}

function visibilityFilter(userId?: number): SQLWrapper[] {
  const filters: SQLWrapper[] = [eq(futureContentMemo.visibility, "public")];
  if (userId) {
    filters.push(eq(futureContentMemo.userId, userId));
  }
  return filters;
}

const futureContentsQuery = graphql(`
  query FutureContents($now: ISO8601DateTime!) {
    contents(untilAfter: $now, first: 9999) {
      nodes {
        __typename uid name since until confirmed
        ... on Event {
          eventType: type
          rerun endless
          shopResources { uid }
          pickups {
            type rerun since until studentName
            student { uid attackType defenseType role schaleDbId }
          }
        }
        ... on Raid {
          raidType: type
          rankVisible boss terrain attackType
          defenseTypes { defenseType difficulty }
        }
      }
    }
  }
`);

export async function getFutureContents(env: Env, forceRefresh = false): Promise<FutureContentsQuery["contents"]["nodes"]> {
  const truncatedNow = new Date();
  truncatedNow.setMinutes(0, 0, 0);

  return fetchCached(env, "future-contents", async () => {
    const { data, error } = await runQuery(futureContentsQuery, { now: truncatedNow });
    if (error || !data) {
      throw error ?? "failed to fetch events";
    }
    return data.contents.nodes;
  }, 60 * 10, forceRefresh);
}
