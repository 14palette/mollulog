import type { Env } from "~/env.server";
import type { Sensei } from "./sensei";
import { getSenseisById } from "./sensei";
import { deleteCache, fetchCached } from "./base";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { and, count, eq, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

const followershipsTable = sqliteTable("followerships", {
  id: int().primaryKey({ autoIncrement: true }),
  followerId: int().notNull(),
  followeeId: int().notNull(),
  createdAt: text().notNull().default(sql`current_timestamp`),
  updatedAt: text().notNull().default(sql`current_timestamp`),
});

export type Followership = {
  followerId: number;
  followeeId: number;
}

export type Relationship = {
  followed: boolean;
  following: boolean;
};

export async function follow(env: Env, followerId: number, followeeId: number) {
  const db = drizzle(env.DB);
  await db.insert(followershipsTable).values({ followerId, followeeId }).run();
  await deleteCache(env, followersCacheKey(followeeId), followingCacheKey(followerId));
}

export async function unfollow(env: Env, followerId: number, followeeId: number) {
  const db = drizzle(env.DB);
  await db.delete(followershipsTable).where(
    and(eq(followershipsTable.followerId, followerId), eq(followershipsTable.followeeId, followeeId)),
  ).run();
  await deleteCache(env, followersCacheKey(followeeId), followingCacheKey(followerId));
}

export async function getFollowershipCount(env: Env, userId: number): Promise<{ followers: number, followings: number }> {
  const db = drizzle(env.DB);
  const result = await db.select({
    followers: count(followershipsTable.followerId),
    followings: count(followershipsTable.followeeId),
  }).from(followershipsTable).where(or(eq(followershipsTable.followerId, userId), eq(followershipsTable.followeeId, userId)));

  return {
    followers: result[0].followers,
    followings: result[0].followings,
  };
}

export async function getFollowers(env: Env, followeeId: number): Promise<Sensei[]> {
  return fetchCached(env, followersCacheKey(followeeId), async () => {
    const db = drizzle(env.DB);
    const result = await db.select().from(followershipsTable).where(eq(followershipsTable.followeeId, followeeId));
    const followerIds = result.map((each) => each.followerId);

    return getSenseisById(env, [...new Set(followerIds)]);
  });
}

export async function getFollowings(env: Env, followerId: number): Promise<Sensei[]> {
  return fetchCached(env, followingCacheKey(followerId), async () => {
    const db = drizzle(env.DB);
    const result = await db.select().from(followershipsTable).where(eq(followershipsTable.followerId, followerId));
    const followeeIds = result.map((each) => each.followeeId);

    return getSenseisById(env, [...new Set(followeeIds)]);
  });
}

function followersCacheKey(followeeId: number) {
  return `followerships:followers:${followeeId}`;
}

function followingCacheKey(followerId: number) {
  return `followerships:following:${followerId}`;
}
