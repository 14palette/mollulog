import hangul from 'hangul-js';
import type { StudentState } from "~/models/student-state";

const { search } = hangul;

export function filterStatesByName(keyword: string, states: StudentState[]): StudentState[] {
  return states.filter((state) => search(state.student.name, keyword) >= 0);
}

export function filterStudentByName<T extends { name: string }>(keyword: string, students: T[], count?: number): T[] {
  let currentCount = 0;
  return students.filter((student) => {
    if (currentCount >= (count ?? Number.POSITIVE_INFINITY)) {
      return false;
    }

    const matched = search(student.name, keyword) >= 0;
    if (matched) {
      currentCount++;
    }
    return matched;
  });
}
