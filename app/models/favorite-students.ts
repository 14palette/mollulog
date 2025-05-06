import { and, count, eq, inArray, sql, type SQLWrapper } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { Env } from "~/env.server";
import { nanoid } from "nanoid/non-secure";


type FavoriteStudent = {
  uid: string;
  studentId: string;
  contentId: string;
};

const favoriteStudentsTable = sqliteTable("content_favorite_students", {
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

export async function getUserFavoritedStudents(env: Env, userId: number, contentId?: string): Promise<FavoriteStudent[]> {
  const db = drizzle(env.DB);
  const filter: SQLWrapper[] = [eq(favoriteStudentsTable.userId, userId)];
  if (contentId) {
    filter.push(eq(favoriteStudentsTable.contentId, contentId));
  }

  return db.select(SELECT_USER_FAVORITE_STUDENTS_COLUMNS).from(favoriteStudentsTable).where(and(...filter)).all();
}


type FavoritedCount = {
  studentId: string;
  contentId: string;
  count: number;
}

export async function getFavoritedCounts(env: Env, studentIds: string[]): Promise<FavoritedCount[]> {
  const db = drizzle(env.DB);
  return db.select({
    studentId: contentFavoriteCountsTable.studentId,
    contentId: contentFavoriteCountsTable.contentId,
    count: contentFavoriteCountsTable.count,
  }).from(contentFavoriteCountsTable)
    .where(inArray(contentFavoriteCountsTable.studentId, studentIds))
    .all();
}

// Add new table definition
export const contentFavoriteCountsTable = sqliteTable("content_favorite_counts", {
  id: int().primaryKey({ autoIncrement: true }),
  studentId: text().notNull(),
  contentId: text().notNull(),
  count: int().notNull().default(0),
  createdAt: text().notNull().default(sql`current_timestamp`),
  updatedAt: text().notNull().default(sql`current_timestamp`),
});

export async function favoriteStudent(env: Env, userId: number, studentId: string, contentId: string): Promise<void> {
  const db = drizzle(env.DB);
  await db.insert(favoriteStudentsTable)
    .values({ uid: nanoid(8), userId, studentId, contentId })
    .onConflictDoNothing();

  await updateFavoritedCount(env, studentId, contentId);
}

export async function unfavoriteStudent(env: Env, userId: number, studentId: string, contentId: string): Promise<void> {
  const db = drizzle(env.DB);
  await db.delete(favoriteStudentsTable).where(and(
    eq(favoriteStudentsTable.userId, userId),
    eq(favoriteStudentsTable.studentId, studentId),
    eq(favoriteStudentsTable.contentId, contentId),
  ));

  await updateFavoritedCount(env, studentId, contentId);
}

async function updateFavoritedCount(env: Env, studentId: string, contentId: string): Promise<void> {
  const db = drizzle(env.DB);
  const [result] = await db.select({ count: count().as("count") })
    .from(favoriteStudentsTable)
    .where(and(
      eq(favoriteStudentsTable.studentId, studentId),
      eq(favoriteStudentsTable.contentId, contentId),
    ))
    .groupBy(favoriteStudentsTable.studentId)
    .all();

  const favoriteCount = result?.count ?? 0;
  await db.insert(contentFavoriteCountsTable)
    .values({ studentId, contentId, count: favoriteCount })
    .onConflictDoUpdate({
      target: [contentFavoriteCountsTable.studentId, contentFavoriteCountsTable.contentId],
      set: {
        count: favoriteCount,
        updatedAt: sql`current_timestamp`,
      },
    });
}

export async function migrateFavoriteCounts(env: Env): Promise<void> {
  const db = drizzle(env.DB);
  const results = await db.select({
    studentId: favoriteStudentsTable.studentId,
    contentId: favoriteStudentsTable.contentId,
    count: count().as("count")
  })
  .from(favoriteStudentsTable)
  .groupBy(favoriteStudentsTable.studentId, favoriteStudentsTable.contentId)
  .all();

  for (const result of results) {
    await db.insert(contentFavoriteCountsTable)
      .values({
        studentId: result.studentId,
        contentId: result.contentId,
        count: result.count
      })
      .onConflictDoUpdate({
        target: [contentFavoriteCountsTable.studentId, contentFavoriteCountsTable.contentId],
        set: {
          count: result.count,
          updatedAt: sql`current_timestamp`,
        },
      });
  }
}
