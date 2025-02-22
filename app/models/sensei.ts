import { nanoid } from "nanoid/non-secure";
import type { Env } from "~/env.server";
import { isUniqueConstraintError } from "./base";
import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";

export const senseisTable = sqliteTable("senseis", {
  id: int().primaryKey({ autoIncrement: true }),
  uid: text().notNull(),
  username: text().notNull().unique(),
  friendCode: text(),
  profileStudentId: text(),
  googleId: text(),
  active: int().notNull().default(0),
});


export type DBSensei = {
  id: number;
  uid: string;
  username: string;
  friendCode: string | null;
  profileStudentId: string | null;
  googleId: string | null;
  active: number;
};

export type Sensei = {
  id: number;
  uid: string;
  username: string;
  friendCode: string | null;
  profileStudentId: string | null;
  active: boolean;
  config?: {
    darkMode?: boolean;
  };
};

// Get a sensei by a single field
export async function getSenseiById(env: Env, id: number): Promise<Sensei | null> {
  const result = await env.DB.prepare("select * from senseis where id = ?1").bind(id).first<DBSensei>();
  return result ? toModel(result) : null;
}

export async function getSenseiByUsername(env: Env, username: string): Promise<Sensei | null> {
  const result = await env.DB.prepare("select * from senseis where username = ?1").bind(username).first<DBSensei>();
  return result ? toModel(result) : null;
}

export async function getSenseisById(env: Env, ids: number[]): Promise<Sensei[]> {
  const uniqueIds = [...new Set(ids)];
  const senseis = await env.DB
    .prepare(`select * from senseis where id in (${uniqueIds.map((_, idx) => `?${idx + 1}`).join(", ")})`)
    .bind(...uniqueIds)
    .all<DBSensei>();

  return senseis.results.map((row) => toModel(row));
}

export async function getSenseiByRandom(env: Env): Promise<Sensei> {
  const result = await env.DB.prepare("select * from senseis order by random() limit 1").first<DBSensei>();
  return toModel(result!);
}

// Get or create a sensei by googleId
const CREATE_SENSEI_QUERY = "insert into senseis (uid, username, googleId) values (?1, ?2, ?3)";

export async function getOrCreateSenseiByGoogleId(env: Env, googleId: string): Promise<Sensei> {
  const result = await env.DB.prepare("select * from senseis where googleId = ?1").bind(googleId).first<DBSensei>();
  if (result) {
    return toModel(result);
  }

  const createResult = await env.DB.prepare(CREATE_SENSEI_QUERY).bind(nanoid(8), nanoid(8), googleId).run();
  if (createResult.error) {
    throw createResult.error;
  }

  return getOrCreateSenseiByGoogleId(env, googleId);
}

// Update a sensei
type SenseiUpdateFields = Partial<Pick<Sensei, "username" | "friendCode" | "profileStudentId" | "active">>

const UPDATE_SENSEI_QUERY = "update senseis set username = ?1, friendCode = ?2, profileStudentId = ?3, active = ?4 where id = ?5";

function nullableFieldToUpdate<T>(value: T | null | undefined, existingValue: T | null): T | null {
  if (value === undefined) {
    return existingValue;
  }
  return value;
}

export async function updateSensei(env: Env, id: number, fields: SenseiUpdateFields): Promise<{ error?: { username?: string } }> {
  const existingSensei = await getSenseiById(env, id);
  if (!existingSensei) {
    return {};
  }

  let result: D1Response;
  try {
    result = await env.DB.prepare(UPDATE_SENSEI_QUERY).bind(
      fields.username ?? existingSensei.username,
      nullableFieldToUpdate(fields.friendCode, existingSensei.friendCode),
      nullableFieldToUpdate(fields.profileStudentId, existingSensei.profileStudentId),
      fields.active ?? existingSensei.active,
      id,
    ).run();
  } catch (e) {
    const err = e as Error;
    const uniqueError = isUniqueConstraintError(err);
    if (uniqueError && uniqueError.column === "username") {
      return { error: { username: "이미 사용중인 닉네임입니다." } };
    }

    console.error(e);
    throw e;
  }

  if (result.error) {
    console.error(result.error);
  }
  return {};
}

function toModel(row: DBSensei): Sensei {
  return {
    id: row.id,
    uid: row.uid,
    username: row.username,
    friendCode: row.friendCode,
    profileStudentId: row.profileStudentId,
    active: row.active === 1,
  };
}
