import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import type { Env } from "~/env.server";
import { nanoid } from "nanoid/non-secure";

export const eventShopStatesTable = sqliteTable("event_shop_states", {
  id: int().primaryKey({ autoIncrement: true }),
  uid: text().notNull(),
  userId: int().notNull(),
  eventUid: text().notNull(),
  itemQuantities: text().notNull().default("{}"),
  selectedBonusStudentUids: text().notNull().default("[]"),
  enabledStages: text().notNull().default("{}"),
  selectedPaymentResourceUid: text(),
  includeRecruitedStudents: int().notNull().default(0),
  existingPaymentItemQuantities: text().notNull().default("{}"),
  createdAt: text().notNull().default(sql`current_timestamp`),
  updatedAt: text().notNull().default(sql`current_timestamp`),
});

export type EventShopState = {
  itemQuantities: Record<string, number>;
  selectedBonusStudentUids: string[];
  enabledStages: Record<string, boolean>;
  selectedPaymentResourceUid: string | null;
  includeRecruitedStudents: boolean;
  existingPaymentItemQuantities: Record<string, number>;
};

function toModel(state: typeof eventShopStatesTable.$inferSelect): EventShopState {
  return {
    itemQuantities: JSON.parse(state.itemQuantities),
    selectedBonusStudentUids: JSON.parse(state.selectedBonusStudentUids),
    enabledStages: JSON.parse(state.enabledStages),
    selectedPaymentResourceUid: state.selectedPaymentResourceUid ?? null,
    includeRecruitedStudents: state.includeRecruitedStudents === 1,
    existingPaymentItemQuantities: JSON.parse(state.existingPaymentItemQuantities || "{}"),
  };
}

export async function getEventShopState(
  env: Env,
  userId: number,
  eventUid: string,
): Promise<EventShopState | null> {
  const db = drizzle(env.DB);
  const states = await db
    .select()
    .from(eventShopStatesTable)
    .where(and(eq(eventShopStatesTable.userId, userId), eq(eventShopStatesTable.eventUid, eventUid)))
    .limit(1);

  return states.length > 0 ? toModel(states[0]) : null;
}

export async function upsertEventShopState(
  env: Env,
  userId: number,
  eventUid: string,
  state: EventShopState,
): Promise<void> {
  const db = drizzle(env.DB);
  const uid = nanoid(8);
  const itemQuantitiesJson = JSON.stringify(state.itemQuantities);
  const selectedBonusStudentUidsJson = JSON.stringify(state.selectedBonusStudentUids);
  const enabledStagesJson = JSON.stringify(state.enabledStages);
  const existingPaymentItemQuantitiesJson = JSON.stringify(state.existingPaymentItemQuantities || {});

  await db
    .insert(eventShopStatesTable)
    .values({
      uid,
      userId,
      eventUid,
      itemQuantities: itemQuantitiesJson,
      selectedBonusStudentUids: selectedBonusStudentUidsJson,
      enabledStages: enabledStagesJson,
      selectedPaymentResourceUid: state.selectedPaymentResourceUid,
      includeRecruitedStudents: state.includeRecruitedStudents ? 1 : 0,
      existingPaymentItemQuantities: existingPaymentItemQuantitiesJson,
    })
    .onConflictDoUpdate({
      target: [eventShopStatesTable.userId, eventShopStatesTable.eventUid],
      set: {
        itemQuantities: itemQuantitiesJson,
        selectedBonusStudentUids: selectedBonusStudentUidsJson,
        enabledStages: enabledStagesJson,
        selectedPaymentResourceUid: state.selectedPaymentResourceUid,
        includeRecruitedStudents: state.includeRecruitedStudents ? 1 : 0,
        existingPaymentItemQuantities: existingPaymentItemQuantitiesJson,
        updatedAt: sql`current_timestamp`,
      },
    });
}

export async function deleteEventShopState(env: Env, userId: number, eventUid: string): Promise<void> {
  const db = drizzle(env.DB);
  await db
    .delete(eventShopStatesTable)
    .where(and(eq(eventShopStatesTable.userId, userId), eq(eventShopStatesTable.eventUid, eventUid)));
}

