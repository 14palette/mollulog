import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { Env } from "~/env.server";
import { senseisTable } from "./sensei";
import { getUserStudentStates } from "./student-state";
import { nanoid } from "nanoid/non-secure";

export const recruitedStudentsTable = sqliteTable("recruited_students", {
  id: int().primaryKey({ autoIncrement: true }),
  uid: text().notNull(),
  userId: int().notNull(),
  studentUid: text().notNull(),
  tier: int().notNull(),
  createdAt: text().notNull().default(sql`current_timestamp`),
  updatedAt: text().notNull().default(sql`current_timestamp`),
});

type RecruitedStudent = {
  uid: string;
  studentUid: string;
  tier: number;
};

function toModel(recruitedStudent: typeof recruitedStudentsTable.$inferSelect): RecruitedStudent {
  return {
    uid: recruitedStudent.uid,
    studentUid: recruitedStudent.studentUid,
    tier: recruitedStudent.tier,
  };
}

export async function getRecruitedStudents(env: Env, senseiId: number): Promise<RecruitedStudent[]> {
  const db = drizzle(env.DB);
  const recruitedStudents = await db.select().from(recruitedStudentsTable).where(eq(recruitedStudentsTable.userId, senseiId));
  return recruitedStudents.map(toModel);
}

export async function getRecruitedStudentTiers(env: Env, senseiId: number): Promise<Record<string, number>> {
  const recruitedStudents = await getRecruitedStudents(env, senseiId);
  return recruitedStudents.reduce((acc, { studentUid, tier }) => {
    acc[studentUid] = tier;
    return acc;
  }, {} as Record<string, number>);
}

export async function upsertRecruitedStudent(env: Env, senseiId: number, studentUid: string, tier: number) {
  const db = drizzle(env.DB);
  const uid = nanoid(8);
  await db.insert(recruitedStudentsTable).values({ uid, userId: senseiId, studentUid, tier }).onConflictDoUpdate({
    target: [recruitedStudentsTable.userId, recruitedStudentsTable.studentUid],
    set: { tier },
  });
}

// Temporary function: migrate from student states
export async function migrateRecruitedStudents(env: Env) {
  const db = drizzle(env.DB);
  const allSenseis = await db.select({ id: senseisTable.id, username: senseisTable.username }).from(senseisTable);
  for (const sensei of allSenseis) {
    const senseiId = sensei.id;
    console.log(`Migrating recruited students for sensei ${sensei.username} (${senseiId})`);

    const studentStates = await getUserStudentStates(env, sensei.username);
    if (!studentStates) {
      continue;
    }

    const recruitedStudents = studentStates.filter((state) => state.owned).map((state) => ({
      uid: state.student.uid,
      userId: senseiId,
      studentUid: state.student.uid,
      tier: state.tier ?? state.student.initialTier,
    }));

    await Promise.all(recruitedStudents.map((recruitedStudent) =>
      db.insert(recruitedStudentsTable).values(recruitedStudent).onConflictDoNothing(),
    ));

    console.log(`Migrated ${recruitedStudents.length} recruited students for sensei ${sensei.username} (${senseiId})`);
  }
}
