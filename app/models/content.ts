import { and, eq, inArray, not, or, sql, type SQLWrapper } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { Env } from "~/env.server";
import { nanoid } from "nanoid/non-secure";
import { senseisTable } from "./sensei";


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

export async function setMemoVisibility(env: Env, userId: number, contentId: string, visibility: ContentMemoVisibility): Promise<void> {
  const db = drizzle(env.DB);
  await db.update(futureContentMemo)
    .set({ visibility, updatedAt: sql`current_timestamp` })
    .where(and(eq(futureContentMemo.userId, userId), eq(futureContentMemo.contentId, contentId)));
}

function visibilityFilter(userId?: number): SQLWrapper[] {
  const filters: SQLWrapper[] = [eq(futureContentMemo.visibility, "public")];
  if (userId) {
    filters.push(eq(futureContentMemo.userId, userId));
  }
  return filters;
}
