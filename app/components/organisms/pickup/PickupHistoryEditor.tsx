import { useState } from "react";
import { Button, Input, Label } from "~/components/atoms/form";
import { PickupStudentSelectCard } from "~/components/molecules/pickup";
import { StudentSearch } from "~/components/molecules/student";

type PickupHistoryEditorProps = {
  tier3Students: {
    studentId: string;
    name: string;
  }[];

  initialTotalCount?: number;
  initialTier3Count?: number;
  initialTier3StudentIds?: string[];

  onComplete: (pickupData: {
    totalCount: number;
    tier3Count: number;
    tier3StudentIds: string[];
  }) => void;
};

export default function PickupHistoryEditor(
  { tier3Students, initialTotalCount, initialTier3Count, initialTier3StudentIds, onComplete }: PickupHistoryEditorProps,
) {
  const [totalCount, setTotlaCount] = useState(initialTotalCount);
  const [tier3Count, setTier3Count] = useState(initialTier3Count);
  const [tier3StudentIds, setTier3StudentIds] = useState(initialTier3StudentIds ?? []);

  const studentCards = tier3StudentIds.map((studentId) => ({
    studentId,
    name: tier3Students.find((student) => student.studentId === studentId)?.name,
  }));
  if (tier3Count && tier3Count > tier3StudentIds.length) {
    studentCards.push(...Array(tier3Count - tier3StudentIds.length).fill({ studentId: null }));
  }

  return (
    <>
      <Input
        type="number" label="총 모집 횟수" description="전체 모집 횟수를 입력해주세요 (예: 200)"
        defaultValue={initialTotalCount?.toString()}
        onChange={(value) => setTotlaCount(parseInt(value))}
      />
      <Input
        type="number" label="모집한 ★3 횟수"
        defaultValue={initialTier3Count?.toString()}
        onChange={(value) => {
          const newCount = parseInt(value);
          setTier3Count(isNaN(newCount) ? 0 : newCount);
          if (tier3StudentIds.length > newCount) {
            setTier3StudentIds((prev) => prev.slice(0, newCount));
          }
        }}
      />

      {(tier3Count !== undefined && tier3Count > 0) && (
        <div className="max-w-2xl">
          <Label text="모집한 ★3 학생" />
          {studentCards.map((student, index) => {
            return (
              <PickupStudentSelectCard
                key={`student-${index}`}
                studentId={student.studentId}
                name={student.name}
                tier3Students={tier3Students}
                onChange={(newStudentId) => {
                  const newStudentIds = [...tier3StudentIds];
                  newStudentIds[index] = newStudentId;
                  setTier3StudentIds(newStudentIds);
                }}
              />
            );
          })}
          {(tier3StudentIds.length < tier3Count) && (
            <StudentSearch
              placeholder="이름으로 찾기..."
              students={tier3Students}
              onSelect={(studentId) => setTier3StudentIds((prev) => [...prev, studentId])}
            />
          )}
        </div>
      )}

      <div className="my-8">
        {tier3StudentIds.length > 0 && (
          <Button text="초기화" color="red" onClick={() => setTier3StudentIds([])} />
        )}
        {totalCount && totalCount > 0 && (tier3Count === tier3StudentIds.length) && (
          <Button text="완료" color="primary" onClick={() => onComplete({ totalCount, tier3Count, tier3StudentIds })} />
        )}
      </div>
    </>
  );
};
