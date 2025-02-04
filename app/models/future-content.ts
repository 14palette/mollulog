import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Env } from "~/env.server";
import { getFuturePlan } from "./future";
import { nanoid } from "nanoid/non-secure";

type FavoriteStudent = {
  uid: string;
  studentId: string;
  contentId: string;
};

export const favoriteStudentsTable = sqliteTable("favorite_students", {
  id: int().primaryKey({ autoIncrement: true }),
  uid: text().notNull(),
  userId: int().notNull(),
  studentId: text().notNull(),
  contentId: text().notNull(),
  createdAt: text().notNull().default(sql`current_timestamp`),
  updatedAt: text().notNull().default(sql`current_timestamp`),
});

const SELECT_USER_FAVORITE_STUDENTS_COLUMNS = {
  uid: favoriteStudentsTable.uid,
  studentId: favoriteStudentsTable.studentId,
  contentId: favoriteStudentsTable.contentId,
};

export async function getUserFavoriteStudents(env: Env, userId: number): Promise<FavoriteStudent[]> {
  const db = drizzle(env.DB);
  return await db.select(SELECT_USER_FAVORITE_STUDENTS_COLUMNS)
    .from(favoriteStudentsTable)
    .where(eq(favoriteStudentsTable.userId, userId))
    .all();
}


type FutureContentMemo = {
  uid: string;
  contentId: string;
  body: string;
};

export const futureContentMemo = sqliteTable("future_content_memos", {
  id: int().primaryKey({ autoIncrement: true }),
  uid: text().notNull(),
  userId: int().notNull(),
  contentId: text().notNull(),
  body: text().notNull(),
  createdAt: text().notNull().default(sql`current_timestamp`),
  updatedAt: text().notNull().default(sql`current_timestamp`),
});

const SELECT_USER_MEMOS_COLUMNS = {
  uid: futureContentMemo.uid,
  contentId: futureContentMemo.contentId,
  body: futureContentMemo.body,
};

export async function getUserMemos(env: Env, userId: number): Promise<FutureContentMemo[]> {
  const db = drizzle(env.DB);
  return await db.select(SELECT_USER_MEMOS_COLUMNS)
    .from(futureContentMemo)
    .where(eq(futureContentMemo.userId, userId))
    .all();
}


// Temporary function to migrate data
export async function migrateFavoriteStudents(env: Env): Promise<void> {
  const db = drizzle(env.DB);
  const firstRow = await db.select().from(favoriteStudentsTable).limit(1);
  if (firstRow.length > 0) {
    return;
  }

  const plans = await env.KV_USERDATA.list({ prefix: "future-plan:id:" });
  plans.keys.forEach(async (key) => {
    const userId = parseInt(key.name.slice("future-plan:id:".length));
    const futurePlan = await getFuturePlan(env, userId);
    if (futurePlan?.pickups) {
      for (const contentId of Object.keys(futurePlan.pickups)) {
        const studentIds = [...new Set(futurePlan.pickups[contentId])];
        const rows = studentIds.map((studentId) => ({ uid: nanoid(8), userId, studentId, contentId }));
        await db.insert(favoriteStudentsTable).values(rows).run();
      }
    }

    if (futurePlan?.memos) {
      const rows = Object.entries(futurePlan.memos).map(([contentId, body]) => ({ uid: nanoid(8), userId, contentId, body }));
      await db.insert(futureContentMemo).values(rows).run();
    }
  });
}
