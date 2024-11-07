import { Env } from "~/env.server";
import { AllStudentsQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { fetchCached } from "./base";
import { graphql } from "~/graphql";
import { AttackType, DefenseType } from "./content";

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

export async function getAllStudentsMap(env: Env, includeUnreleased: boolean = false): Promise<StudentMap> {
  return fetchCached(env, `students::includeUnreleased=${includeUnreleased}`, async () => {
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
