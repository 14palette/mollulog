import { and, eq, not, or, sql, SQLWrapper } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Env } from "~/env.server";
import { nanoid } from "nanoid/non-secure";
import { senseisTable } from "./sensei";


type ContentMemo = {
  uid: string;
  contentId: string;
  body: string;
  visibility: ContentMemoVisibility;
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

export async function getContentMemos(env: Env, contentId: string, userId?: number): Promise<(ContentMemo & { sensei: { username: string, profileStudentId: string | null } })[]> {
  const db = drizzle(env.DB);

  const visibilityFilter: SQLWrapper[] = [eq(futureContentMemo.visibility, "public")];
  if (userId) {
    visibilityFilter.push(eq(futureContentMemo.userId, userId));
  }

  const results = await db.select(SELECT_CONTENT_MEMOS_COLUMNS)
    .from(futureContentMemo)
    .where(and(
      not(eq(futureContentMemo.body, "")),
      eq(futureContentMemo.contentId, contentId),
      or(...visibilityFilter),
    ))
    .innerJoin(senseisTable, eq(futureContentMemo.userId, senseisTable.id))
    .all();

  return results.map(toModel);
}

function toModel<T extends { visibility: string }>(rows: T): (T & { visibility: ContentMemoVisibility }) {
  return { ...rows, visibility: rows.visibility as ContentMemoVisibility };
}

export async function setMemo(env: Env, userId: number, contentId: string, body: string, visibility: ContentMemoVisibility = "private"): Promise<void> {
  const db = drizzle(env.DB);
  await db.insert(futureContentMemo).values({ uid: nanoid(8), userId, contentId, body, visibility })
    .onConflictDoUpdate({
      target: [futureContentMemo.userId, futureContentMemo.contentId],
      set: { body, updatedAt: sql`current_timestamp` }
    });
}

export async function setMemoVisibility(env: Env, userId: number, contentId: string, visibility: ContentMemoVisibility): Promise<void> {
  const db = drizzle(env.DB);
  await db.update(futureContentMemo)
    .set({ visibility, updatedAt: sql`current_timestamp` })
    .where(and(eq(futureContentMemo.userId, userId), eq(futureContentMemo.contentId, contentId)));
}
