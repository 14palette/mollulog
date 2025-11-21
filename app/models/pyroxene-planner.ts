import { nanoid } from "nanoid/non-secure";
import dayjs from "dayjs";
import { and, eq, isNotNull, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import type { Env } from "~/env.server";

export const pyroxeneOwnedResourcesTable = sqliteTable("pyroxene_owned_resources", {
  id: int().primaryKey({ autoIncrement: true }),
  uid: text().notNull(),
  userId: int().notNull(),
  eventUid: text(),
  inputAt: text().notNull(),
  pyroxene: int().notNull(),
  oneTimeTicket: int().notNull(),
  tenTimeTicket: int().notNull(),
  createdAt: text().notNull().default(sql`current_timestamp`),
  updatedAt: text().notNull().default(sql`current_timestamp`),
});

export type PyroxeneOwnedResource = {
  uid: string;
  userId: number;
  eventUid: string | null;
  inputAt: string;
  pyroxene: number;
  oneTimeTicket: number;
  tenTimeTicket: number;
};

function toOwnedResourceModel(resource: typeof pyroxeneOwnedResourcesTable.$inferSelect): PyroxeneOwnedResource {
  return {
    uid: resource.uid,
    userId: resource.userId,
    eventUid: resource.eventUid,
    inputAt: resource.inputAt,
    pyroxene: resource.pyroxene,
    oneTimeTicket: resource.oneTimeTicket,
    tenTimeTicket: resource.tenTimeTicket,
  };
}

export async function getLatestPyroxeneOwnedResource(env: Env, userId: number): Promise<PyroxeneOwnedResource | null> {
  const db = drizzle(env.DB);
  const [resource] = await db
    .select()
    .from(pyroxeneOwnedResourcesTable)
    .where(eq(pyroxeneOwnedResourcesTable.userId, userId))
    .orderBy(sql`inputAt DESC`)
    .limit(1);

  return resource ? toOwnedResourceModel(resource) : null;
}

export async function getLatestPyroxeneOwnedResourceWithEventUid(env: Env, userId: number): Promise<PyroxeneOwnedResource | null> {
  const db = drizzle(env.DB);
  const [resource] = await db
    .select()
    .from(pyroxeneOwnedResourcesTable)
    .where(and(eq(pyroxeneOwnedResourcesTable.userId, userId), isNotNull(pyroxeneOwnedResourcesTable.eventUid)))
    .orderBy(sql`inputAt DESC`)
    .limit(1);

  return resource ? toOwnedResourceModel(resource) : null;
}

export async function createPyroxeneOwnedResource(
  env: Env, userId: number, eventUid: string | null, resources: { pyroxene: number, oneTimeTicket: number, tenTimeTicket: number },
): Promise<void> {
  const db = drizzle(env.DB);
  const uid = nanoid(8);
  await db.insert(pyroxeneOwnedResourcesTable)
    .values({ uid, userId, eventUid, inputAt: new Date().toISOString(), ...resources });
}

export async function deletePyroxeneOwnedResource(env: Env, userId: number, uid: string): Promise<void> {
  const db = drizzle(env.DB);
  await db.delete(pyroxeneOwnedResourcesTable)
    .where(and(eq(pyroxeneOwnedResourcesTable.userId, userId), eq(pyroxeneOwnedResourcesTable.uid, uid)));
}

export async function deletePyroxeneOwnedResourceByEventUid(env: Env, userId: number, eventUid: string): Promise<void> {
  const db = drizzle(env.DB);
  await db.delete(pyroxeneOwnedResourcesTable)
    .where(and(eq(pyroxeneOwnedResourcesTable.userId, userId), eq(pyroxeneOwnedResourcesTable.eventUid, eventUid)));
}

export const pyroxeneTimelineItemsTable = sqliteTable("pyroxene_timeline_items", {
  id: int().primaryKey({ autoIncrement: true }),
  uid: text().notNull(),
  userId: int().notNull(),
  eventAt: text().notNull(),
  source: text().notNull(),
  repeatIntervalDays: int(),
  repeatCount: int(),
  description: text().notNull(),
  pyroxeneDelta: int().notNull(),
  oneTimeTicketDelta: int().notNull(),
  tenTimeTicketDelta: int().notNull(),
  createdAt: text().notNull().default(sql`current_timestamp`),
  updatedAt: text().notNull().default(sql`current_timestamp`),
});

export type PyroxeneTimelineItem = {
  uid: string;
  userId: number;
  eventAt: string;
  source: string;
  repeatIntervalDays: number | null;
  repeatCount: number | null;
  description: string;
  pyroxeneDelta: number;
  oneTimeTicketDelta: number;
  tenTimeTicketDelta: number;
};

function toTimelineItemModel(item: typeof pyroxeneTimelineItemsTable.$inferSelect): PyroxeneTimelineItem {
  return {
    uid: item.uid,
    userId: item.userId,
    eventAt: item.eventAt,
    source: item.source,
    repeatIntervalDays: item.repeatIntervalDays,
    repeatCount: item.repeatCount,
    description: item.description,
    pyroxeneDelta: item.pyroxeneDelta,
    oneTimeTicketDelta: item.oneTimeTicketDelta,
    tenTimeTicketDelta: item.tenTimeTicketDelta,
  };
}

export async function getPyroxeneTimelineItems(env: Env, userId: number): Promise<PyroxeneTimelineItem[]> {
  const db = drizzle(env.DB);
  const items = await db
    .select()
    .from(pyroxeneTimelineItemsTable)
    .where(eq(pyroxeneTimelineItemsTable.userId, userId))
    .orderBy(sql`eventAt ASC`);
  return items.map(toTimelineItemModel);
}

export async function createBuyPyroxene(env: Env, userId: number, date: Date, quantity: number): Promise<void> {
  const uid = nanoid(8);
  const eventAt = dayjs(date).utcOffset(9).hour(4).toISOString(); // KST 4:00 on the given date
  const db = drizzle(env.DB);
  await db.insert(pyroxeneTimelineItemsTable)
    .values({
      uid, userId, eventAt,
      source: "buy",
      description: "청휘석 구매",
      pyroxeneDelta: quantity,
      oneTimeTicketDelta: 0,
      tenTimeTicketDelta: 0,
    });
}

export async function deletePyroxeneTimelineItem(env: Env, userId: number, uid: string): Promise<void> {
  const db = drizzle(env.DB);
  const parsedUid = uid.split("-")[0];
  await db.delete(pyroxeneTimelineItemsTable)
    .where(and(
      eq(pyroxeneTimelineItemsTable.userId, userId),
      or(eq(pyroxeneTimelineItemsTable.uid, parsedUid), like(pyroxeneTimelineItemsTable.uid, `${parsedUid}%`)),
    ));
}


export async function createPyroxenePackage(env: Env, userId: number, startDate: Date, packageType: "half" | "full"): Promise<void> {
  const uid = nanoid(8);
  const eventAt = dayjs(startDate).utcOffset(9).hour(4).toISOString(); // KST 4:00 on the given date

  const packageName = packageType === "half" ? "하프 패키지" : "월간 패키지";
  const oneTimePyroxene = packageType === "half" ? 176 : 392;
  const dailyPyroxene = packageType === "half" ? 20 : 40;

  const db = drizzle(env.DB);
  await db.insert(pyroxeneTimelineItemsTable)
    .values([
      {
        uid: `${uid}-onetime`,
        userId, eventAt,
        source: "package_onetime",
        description: `${packageName} (초회)`,
        pyroxeneDelta: oneTimePyroxene,
        oneTimeTicketDelta: 0,
        tenTimeTicketDelta: 0,
      },
      {
        uid: `${uid}-daily`,
        userId, eventAt,
        source: "package_daily",
        description: `${packageName} (일간)`,
        pyroxeneDelta: dailyPyroxene,
        repeatIntervalDays: 1,
        repeatCount: 30,
        oneTimeTicketDelta: 0,
        tenTimeTicketDelta: 0,
      },
    ]);
}

export async function createAttendance(env: Env, userId: number, startDate: Date): Promise<void> {
  const db = drizzle(env.DB);
  await db.delete(pyroxeneTimelineItemsTable)
    .where(and(eq(pyroxeneTimelineItemsTable.userId, userId), eq(pyroxeneTimelineItemsTable.source, "attendance")));

  const uid = nanoid(8);
  const startAt = dayjs(startDate).utcOffset(9).hour(4); // KST 4:00 on the given date
  await db.insert(pyroxeneTimelineItemsTable)
    .values([
      {
        uid: `${uid}-5`,
        userId,
        eventAt: startAt.add(4, "day").toISOString(),
        source: "attendance",
        description: "출석 5일차",
        pyroxeneDelta: 50,
        oneTimeTicketDelta: 0,
        tenTimeTicketDelta: 0,
        repeatIntervalDays: 10,
        repeatCount: null,
      },
      {
        uid: `${uid}-10`,
        userId,
        eventAt: startAt.add(9, "day").toISOString(),
        source: "attendance",
        description: "출석 10일차",
        pyroxeneDelta: 100,
        oneTimeTicketDelta: 0,
        tenTimeTicketDelta: 0,
        repeatIntervalDays: 10,
        repeatCount: null
      },
    ]);
}

export async function createOtherPyroxeneGain(env: Env, userId: number, date: Date, pyroxene: number, oneTimeTicket: number, tenTimeTicket: number, description: string): Promise<void> {
  const db = drizzle(env.DB);
  await db.insert(pyroxeneTimelineItemsTable)
    .values({
      uid: nanoid(8),
      userId,
      eventAt: dayjs(date).utcOffset(9).hour(4).toISOString(),
      source: "other",
      description,
      pyroxeneDelta: pyroxene,
      oneTimeTicketDelta: oneTimeTicket,
      tenTimeTicketDelta: tenTimeTicket,
    });
}
