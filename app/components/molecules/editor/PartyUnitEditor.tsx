import { UserPlus, ChatBubbleXmark, Search } from "iconoir-react";
import { useEffect, useState } from "react";
import { Label, Toggle } from "~/components/atoms/form";
import { StudentCard } from "~/components/atoms/student";
import { StudentCards } from "~/components/molecules/student";
import { filterStudentByName } from "~/filters/student";
import { Role } from "~/models/content";

type EditorStudent = {
  studentId: string;
  name: string;
  tier?: number;
  role: Role;
};

type PartyUnitEditorProps = {
  index: number;
  students: EditorStudent[];
  onComplete(studentIds: (string | null)[]): void;
  onCancel(): void;
};

export default function PartyUnitEditor(
  { index, students, onComplete, onCancel }: PartyUnitEditorProps,
) {
  const [filteredStudents, setFilteredStudents] = useState<EditorStudent[]>(students);
  const [partySize, setPartySize] = useState<6 | 10>(6);
  const [unitStudents, setUnitStudents] = useState<(EditorStudent | null)[]>(new Array(6).fill(null));

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (partySize === unitStudents.length) {
      return;
    }

    const newUnitStudents = new Array(partySize).fill(null);
    if (partySize === 10) {
      unitStudents.forEach((student, index) => {
        newUnitStudents[index < 4 ? index : index + 2] = student;
      });
    } else {
      unitStudents.forEach((student, index) => {
        if (0 <= index && index < 4) {
          newUnitStudents[index] = student;
        } else if (6 <= index && index < 8) {
          newUnitStudents[index - 2] = student;
        }
      });
    }
    setUnitStudents(newUnitStudents);
  }, [partySize]);

  const onSearch = (search: string) => {
    if (search.length === 0) {
      return setFilteredStudents(students);
    }
    setFilteredStudents(filterStudentByName(search, students));
  };

  const addPartyStudent = (newStudentId: string) => {
    const student = students.find((each) => each.studentId === newStudentId);
    if (!student) {
      return;
    }

    // 학생은 최대 6명까지 편성 가능하며, 중복 편성 불가능
    if (unitStudents.find((each) => each?.studentId === newStudentId)) {
      return setError("학생은 중복해서 편성할 수 없어요.");
    }
    if (unitStudents.filter((each) => each !== null).length >= partySize) {
      return setError(`학생은 최대 ${partySize}명까지만 편성할 수 있어요.`);
    }

    const [strikerCount, specialCount] = partySize === 6 ? [4, 2] : [6, 4];
    if (student.role === "striker") {
      // 스트라이커는 최대 4/6명까지 편성 가능하며 항상 앞을 차지
      const emptyIndex = unitStudents.indexOf(null);
      if (emptyIndex >= strikerCount) {
        return setError(`스트라이커 학생은 최대 ${strikerCount}명까지 편성할 수 있어요.`);
      }

      setUnitStudents((prev) => {
        const newPartyStudents = [...prev];
        newPartyStudents[emptyIndex] = student;
        return newPartyStudents;
      });
    } else {
      // 스페셜은 최대 2/4명까지 편성 가능하며 항상 뒤의 2자리를 차지
      let firstEmptyIndex = null;
      for (let i = strikerCount; i < partySize; i += 1) {
        if (unitStudents[i] === null) {
          firstEmptyIndex = i;
          break;
        }
      }

      if (firstEmptyIndex === null) {
        return setError(`스페셜 학생은 최대 ${specialCount}명까지 편성할 수 있어요.`);
      }

      setError(null);
      setUnitStudents((prev) => {
        const newPartyStudents = [...prev];
        newPartyStudents[firstEmptyIndex] = student;
        return newPartyStudents;
      });
    }
  };

  const completable = (unitStudents.filter((state) => state !== null).length > 0);

  return (
    <>
      <Label text={`${index + 1}번째 파티`} />
      <div className="mt-4 p-4 flex items-center border border-neutral-200 bg-neutral-100 rounded-t-lg">
        <Search className="h-4 w-4 mr-2" strokeWidth={2} />
        <input
          className="w-full bg-neutral-100"
          placeholder="이름으로 찾기..."
          onChange={(e) => onSearch(e.currentTarget.value)}
        />
      </div>

      <div className="max-h-64 md:max-h-80 overflow-auto p-4 bg-neutral-100 border-l border-r border-neutral-200">
        {filteredStudents.length > 0 ?
          <StudentCards
            students={filteredStudents}
            onSelect={(studentId) => addPartyStudent(studentId)}
            mobileGrid={6}
            pcGrid={10}
          /> :
          <div className="w-full h-64 md:h-80 flex flex-col items-center justify-center text-neutral-500">
            <ChatBubbleXmark className="my-2 w-16 h-16" strokeWidth={2} />
            <p className="my-2 text-sm">검색 결과가 없어요</p>
          </div>
        }
      </div>

      <div className="p-4 border border-neutral-200 bg-neutral-100 rounded-b-lg">
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="my-4">
          <Toggle
            label={`파티 인원 조정 (${partySize}명)`}
            onChange={(value) => setPartySize(value ? 10 : 6)}
            colorClass="bg-blue-500 data-[checked]:bg-purple-500"
          />
        </div>

        <Label text="선택한 학생" />
        {unitStudents.find((student) => student !== null) ?
          <div className="grid grid-cols-6 md:grid-cols-10 gap-1 gap-2">
            {unitStudents.map((student, index) => (
              <div
                key={`partyGen-${student?.studentId ?? index}`}
                className="bg-neutral-100 rounded-lg"
              >
                {student ?
                  <StudentCard {...student} nameSize="small" /> :
                  <div className="w-full h-full bg-neutral-200 rounded-lg flex items-center justify-center">
                    <UserPlus />
                  </div>
                }
              </div>
            ))}
          </div> :
          <p className="my-4 text-center text-sm text-neutral-500">파티에 추가할 학생을 선택하세요</p>
        }

        <div className="flex justify-end">
          <button
            type="button"
            className="py-2 px-4 hover:bg-neutral-100 text-red-500 font-bold transition rounded-lg"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="py-2 px-4 hover:bg-neutral-100 text-neutral-700 font-bold transition rounded-lg"
            onClick={() => {
              setError(null);
              setUnitStudents(new Array(partySize).fill(null));
            }}
          >
            초기화
          </button>
          <button
            type="button"
            className={`py-2 px-4 hover:bg-neutral-100 font-bold transition rounded-lg transition
                        ${completable ? "text-blue-500" : "text-neutral-300"}`}
            onClick={() => {
              if (completable) {
                onComplete(unitStudents.map((student) => student?.studentId ?? null));
              }
            }}
          >
            완료
          </button>
        </div>
      </div>
    </>
  );
}
