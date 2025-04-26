import type { Env } from "~/env.server";
import type { AllStudentsQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { fetchCached } from "./base";
import { graphql } from "~/graphql";
import type { AttackType, DefenseType } from "./content.d";

export type Role = "striker" | "special";
export type Student = {
  id: string;
  name: string;
  school: string;
  initialTier: number;
  order: number;
  attackType: AttackType;
  defenseType: DefenseType;
  role: Role;
  equipments: string[];
  released: boolean;
};

export type StudentMap = { [id: string]: Student };

const allStudentsQuery = graphql(`
  query AllStudents {
    students {
      id: studentId
      name
      school
      initialTier
      order
      attackType
      defenseType
      role
      equipments
      released
    }
  }
`);

export async function getAllStudents(env: Env, includeUnreleased = false): Promise<Student[]> {
  return fetchCached(env, `students::list::includeUnreleased=${includeUnreleased}`, async () => {
    const { data } = await runQuery<AllStudentsQuery>(allStudentsQuery, {});
    return (data?.students ?? []).filter(({ released }) => includeUnreleased || released);
  }, 10 * 60);
};

export async function getAllStudentsMap(env: Env, includeUnreleased = false): Promise<StudentMap> {
  return fetchCached(env, `students::map::includeUnreleased=${includeUnreleased}`, async () => {
    const { data } = await runQuery<AllStudentsQuery>(allStudentsQuery, {});
    const students = (data?.students ?? []).filter(({ released }) => includeUnreleased || released);
    return students.reduce((acc, student) => {
      acc[student.id] = student;
      return acc;
    }, {} as StudentMap);
  }, 10 * 60);
}

export async function getStudentsMap(env: Env, studentIds: string[]): Promise<StudentMap> {
  const allStudents = await getAllStudentsMap(env, true);
  return studentIds.reduce((acc, id) => {
    acc[id] = allStudents[id];
    return acc;
  }, {} as StudentMap);
}
