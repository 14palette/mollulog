import type { Env } from "~/env.server";
import type { Sensei } from "./sensei";
import { getSenseiByUsername } from "./sensei";
import { getAllStudentsMap, type Student } from "./student";

export type StudentState = {
  student: Student;
  owned: boolean;
  tier?: number | null;
};

type StudentStateRaw = {
  student: Omit<Student, "uid"> & { id: string };
  owned: boolean;
  tier?: number | null;
};

export function userStateKeyById(id: number) {
  return `student-states:id:${id}`;
}

export async function getUserStudentStates(env: Env, username: string, includeUnreleased = false): Promise<StudentState[] | null> {
  const sensei = await getSenseiByUsername(env, username);
  if (!sensei) {
    return null;
  }

  const rawStates = await env.KV_USERDATA.get(userStateKeyById(sensei.id));
  const allStudents = await getAllStudentsMap(env, includeUnreleased);
  const states = (rawStates ? JSON.parse(rawStates) : []) as StudentStateRaw[];
  return Object.entries(allStudents).map(([studentUid, student]) => {
    const state = states.find((state) => state.student.id === studentUid);
    if (state) {
      return { ...state, student };
    } else {
      return { student, owned: false, tier: student.initialTier };
    }
  });
}

export async function updateStudentStates(env: Env, sensei: Sensei, states: StudentState[]) {
  const rawStates: StudentStateRaw[] = states.map((state) => ({
    student: {
      ...state.student,
      id: state.student.uid,
    },
    owned: state.owned,
    tier: state.tier,
  }));
  await env.KV_USERDATA.put(userStateKeyById(sensei.id), JSON.stringify(rawStates));
}
