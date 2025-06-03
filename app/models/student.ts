import type { Env } from "~/env.server";
import type { AllStudentsQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { fetchCached } from "./base";
import { graphql } from "~/graphql";
import type { AttackType, DefenseType } from "./content.d";

export type Role = "striker" | "special";
export type Student = {
  uid: string;
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
      uid
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
  return fetchCached(env, `students::v2::list::includeUnreleased=${includeUnreleased}`, async () => {
    const { data } = await runQuery<AllStudentsQuery>(allStudentsQuery, {});
    return (data?.students ?? []).filter(({ released }) => includeUnreleased || released);
  }, 10 * 60);
};

export async function getAllStudentsMap(env: Env, includeUnreleased = false): Promise<StudentMap> {
  return fetchCached(env, `students::v2::map::includeUnreleased=${includeUnreleased}`, async () => {
    const { data } = await runQuery<AllStudentsQuery>(allStudentsQuery, {});
    const students = (data?.students ?? []).filter(({ released }) => includeUnreleased || released);
    return students.reduce((acc, student) => {
      acc[student.uid] = student;
      return acc;
    }, {} as StudentMap);
  }, 10 * 60);
}

export async function getStudentsMap(env: Env, uids: string[]): Promise<StudentMap> {
  const allStudents = await getAllStudentsMap(env, true);
  return uids.reduce((acc, uid) => {
    acc[uid] = allStudents[uid];
    return acc;
  }, {} as StudentMap);
}
