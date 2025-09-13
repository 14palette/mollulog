import { and, eq, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import type { Env } from "~/env.server";
import { nanoid } from "nanoid/non-secure";

export const studentGradingTagsTable = sqliteTable("student_grading_tags", {
  id: int().primaryKey({ autoIncrement: true }),
  uid: text().notNull(),
  gradingUid: text().notNull(),
  studentUid: text().notNull(), // Denormalized for efficient aggregation
  tagValue: text().notNull(),
  createdAt: text().notNull().default(sql`current_timestamp`),
});

// Tag constants for better maintainability
export const STUDENT_GRADING_TAG_CONSTANTS = {
  PERFORMANCE: "performance",
  UNIVERSAL: "universal",
  GROWTH: "growth",
  LOVE: "love",
} as const;

export type StudentGradingTagKey = keyof typeof STUDENT_GRADING_TAG_CONSTANTS;
export type StudentGradingTagValue = typeof STUDENT_GRADING_TAG_CONSTANTS[StudentGradingTagKey];

// Tag display mapping
export const STUDENT_GRADING_TAG_DISPLAY: Record<StudentGradingTagValue, string> = {
  [STUDENT_GRADING_TAG_CONSTANTS.PERFORMANCE]: "성능이 강해요",
  [STUDENT_GRADING_TAG_CONSTANTS.UNIVERSAL]: "범용적으로 활약해요",
  [STUDENT_GRADING_TAG_CONSTANTS.GROWTH]: "저성급으로 충분해요",
  [STUDENT_GRADING_TAG_CONSTANTS.LOVE]: "애정해요"
};

export type StudentGradingTag = {
  uid: string;
  gradingUid: string;
  studentUid: string;
  tagValue: StudentGradingTagValue;
};

// All available tag values for validation
export const ALL_STUDENT_GRADING_TAG_VALUES: StudentGradingTagValue[] = Object.values(STUDENT_GRADING_TAG_CONSTANTS);

function toModel(tag: typeof studentGradingTagsTable.$inferSelect): StudentGradingTag {
  return {
    uid: tag.uid,
    gradingUid: tag.gradingUid,
    studentUid: tag.studentUid,
    tagValue: tag.tagValue as StudentGradingTagValue,
  };
}

export async function getGradingTags(env: Env, gradingUid: string): Promise<StudentGradingTag[]> {
  const db = drizzle(env.DB);
  const tags = await db.select()
    .from(studentGradingTagsTable)
    .where(eq(studentGradingTagsTable.gradingUid, gradingUid));
  return tags.map(toModel);
}

export async function getGradingTagsByGradingUids(env: Env, gradingUids: string[]): Promise<Record<string, StudentGradingTag[]>> {
  if (gradingUids.length === 0) return {};
  
  const db = drizzle(env.DB);
  const tags = await db.select()
    .from(studentGradingTagsTable)
    .where(inArray(studentGradingTagsTable.gradingUid, gradingUids));
  
  const result: Record<string, StudentGradingTag[]> = {};
  gradingUids.forEach(uid => result[uid] = []);
  
  tags.forEach(tag => {
    const model = toModel(tag);
    result[model.gradingUid].push(model);
  });
  
  return result;
}

export async function createGradingTags(env: Env, gradingUid: string, studentUid: string, tagValues: StudentGradingTagValue[]): Promise<void> {
  if (tagValues.length === 0) return;
  
  // Validate tags
  const invalidTags = tagValues.filter(tag => !ALL_STUDENT_GRADING_TAG_VALUES.includes(tag));
  if (invalidTags.length > 0) {
    throw new Error(`Invalid tags: ${invalidTags.join(", ")}`);
  }
  
  const db = drizzle(env.DB);
  const tagRecords = tagValues.map(tagValue => ({
    uid: nanoid(8),
    gradingUid,
    studentUid,
    tagValue,
  }));
  
  await db.insert(studentGradingTagsTable).values(tagRecords);
}

export async function updateGradingTags(env: Env, gradingUid: string, studentUid: string, tagValues: StudentGradingTagValue[]): Promise<void> {
  const db = drizzle(env.DB);
  await db.delete(studentGradingTagsTable).where(eq(studentGradingTagsTable.gradingUid, gradingUid));
  await createGradingTags(env, gradingUid, studentUid, tagValues);
}

// Utility functions for tag aggregation and counting
export type StudentGradingTagCount = {
  tag: StudentGradingTagValue;
  displayName: string;
  count: number;
};

export async function getTagCountsByStudent(env: Env, studentUid: string): Promise<StudentGradingTagCount[]> {
  const db = drizzle(env.DB);

  // Get all tags for the student directly (much more efficient with denormalized studentUid)
  const tags = await db.select()
    .from(studentGradingTagsTable)
    .where(eq(studentGradingTagsTable.studentUid, studentUid));

  // Count occurrences of each tag
  const tagCounts: Record<StudentGradingTagValue, number> = {} as Record<StudentGradingTagValue, number>;

  // Initialize all tags with 0 count
  ALL_STUDENT_GRADING_TAG_VALUES.forEach((tag) => {
    tagCounts[tag] = 0;
  });

  // Count tags
  tags.forEach((tag) => {
    const tagValue = tag.tagValue as StudentGradingTagValue;
    if (ALL_STUDENT_GRADING_TAG_VALUES.includes(tagValue)) {
      tagCounts[tagValue]++;
    }
  });
  
  // Convert to array with display names
  return ALL_STUDENT_GRADING_TAG_VALUES.map((tag) => ({
    tag,
    displayName: STUDENT_GRADING_TAG_DISPLAY[tag],
    count: tagCounts[tag]
  }));
}
