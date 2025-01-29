import { nanoid } from "nanoid/non-secure";
import { Env } from "~/env.server";

export type PickupHistory = {
  uid: string;
  userId: number;
  eventId: string;
  result: {
    trial: number;
    tier3Count: number;
    tier2Count: number;
    tier1Count: number;
    tier3StudentIds: string[];
  }[];
};

export type DBPickupHistory = {
  uid: string;
  userId: number;
  eventId: string;
  result: string;
  rawResult: string;
};

const GET_PICKUP_HISTORY_QUERY = "select * from pickup_histories where uid = ?1 and userId = ?2";

export async function getPickupHistory(env: Env, userId: number, uid: string): Promise<PickupHistory | null> {
  const dbResult = await env.DB.prepare(GET_PICKUP_HISTORY_QUERY).bind(uid, userId).first<DBPickupHistory>();
  return dbResult ? toModel(dbResult) : null;
}

const GET_PICKUP_HISTORIES_QUERY = "select * from pickup_histories where userId = ?1";

export async function getPickupHistories(env: Env, userId: number): Promise<PickupHistory[]> {
  const dbResult = await env.DB.prepare(GET_PICKUP_HISTORIES_QUERY).bind(userId).all<DBPickupHistory>();
  if (dbResult.error) {
    console.error(dbResult.error);
    return [];
  }
  return dbResult.results.map(toModel);
}

const CREATE_PICKUP_HISTORY_QUERY = "insert into pickup_histories (uid, userId, eventId, result, rawResult) values (?1, ?2, ?3, ?4, ?5)";

export async function createPickupHistory(env: Env, userId: number, eventId: string, result: PickupHistory["result"], rawResult: string) {
  const dbResult = await env.DB.prepare(CREATE_PICKUP_HISTORY_QUERY).bind(
    nanoid(8),
    userId,
    eventId,
    JSON.stringify(result),
    rawResult,
  ).run();

  if (dbResult.error) {
    console.error(dbResult.error);
  }
  return;
}

const DELETE_PICKUP_HISTORY_QUERY = "delete from pickup_histories where uid = ?1 and userId = ?2";

export async function deletePickupHistory(env: Env, userId: number, uid: string) {
  const dbResult = await env.DB.prepare(DELETE_PICKUP_HISTORY_QUERY).bind(uid, userId).run();
  if (dbResult.error) {
    console.error(dbResult.error);
  }
  return;
}

export function parsePickupHistory(raw: string, studentMap: Map<string, string>): PickupHistory["result"] {
  const studentNames = Array.from(studentMap.keys());

  const result: PickupHistory["result"] = [];
  let trial = 0;
  raw.split("\n").forEach((line) => {
    const matched = line.matchAll(/(?<!\d)\d{1}(?!\d)/g);
    const [count1, count2, count3] = Array.from(matched).map((m) => parseInt(m[0]));
    if (count1 === undefined || count2 === undefined || count3 === undefined) {
      return;
    }

    trial += 10;

    const names = Array.from(line.matchAll(/[가-힣]+/g)).map((m) => m[0]);
    let tierOrderAsc;
    if (names.length === count1 || names.length === count3) {
      tierOrderAsc = (names.length === count3);
    } else {
      tierOrderAsc = (count1 > count3);
    }

    let tier1Count, tier2Count, tier3Count;
    if (tierOrderAsc) {
      tier1Count = count1;
      tier2Count = count2;
      tier3Count = count3;
    } else {
      tier1Count = count3;
      tier2Count = count2;
      tier3Count = count1;
    }

    const tier3StudentIds = names.map((searchName) => {
      const studentId = studentMap.get(searchName);
      if (studentId) {
        return studentId;
      }

      const [namePart1, namePart2] = [searchName.slice(0, 1), searchName.slice(1)];
      const expectingName = studentNames.find((name) => {
        const [originalName, skinName] = name.split("(").map((each) => each.replace(")", ""));
        return originalName.includes(namePart2) && skinName?.includes(namePart1);
      })

      return expectingName ? studentMap.get(expectingName) ?? null : null;
    }).filter((studentId) => studentId !== null);

    result.push({
      trial,
      tier3Count,
      tier2Count,
      tier1Count,
      tier3StudentIds,
    });
  });

  return result;
}

function toModel(pickupHistory: DBPickupHistory): PickupHistory {
  return {
    uid: pickupHistory.uid,
    userId: pickupHistory.userId,
    eventId: pickupHistory.eventId,
    result: JSON.parse(pickupHistory.result),
  };
}
