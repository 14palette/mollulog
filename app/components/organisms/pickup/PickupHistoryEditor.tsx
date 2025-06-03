import { useEffect, useState } from "react";
import { Button, Input, Label } from "~/components/atoms/form";
import { PickupStudentSelectCard } from "~/components/molecules/pickup";
import { StudentSearch } from "~/components/molecules/student";

type PickupHistoryEditorProps = {
  tier3Students: {
    uid: string;
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

  const [studentCards, setStudentCards] = useState<{ uid: string | null; name: string | null }[]>([]);
  useEffect(() => {
    const newStudentCards = tier3StudentIds.map((uid) => ({
      uid,
      name: tier3Students.find((student) => student.uid === uid)?.name ?? null,
    }));

    if (tier3Count && tier3Count > newStudentCards.length) {
      newStudentCards.push(...Array(tier3Count - newStudentCards.length).fill({ uid: null }));
    }

    setStudentCards(newStudentCards);
  }, [tier3StudentIds]);

  return (
    <>
      <Input
        type="number" label="총 모집 횟수" description="전체 모집 횟수를 입력해주세요 (예: 200)"
        defaultValue={initialTotalCount?.toString()}
        onChange={(value) => setTotlaCount(Number.parseInt(value))}
      />
      <Input
        type="number" label="모집한 ★3 횟수"
        defaultValue={initialTier3Count?.toString()}
        onChange={(value) => {
          const newCount = Number.parseInt(value);
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
                uid={student.uid}
                name={student.name}
                tier3Students={tier3Students}
                onChange={(newStudentUid) => {
                  setTier3StudentIds((prev) => {
                    const newStudentUids = [...prev];
                    newStudentUids[index] = newStudentUid;
                    return newStudentUids;
                  });
                }}
              />
            );
          })}
          {(tier3StudentIds.length < tier3Count) && (
            <StudentSearch
              placeholder="이름으로 찾기..."
              students={tier3Students}
              onSelect={(studentUid) => setTier3StudentIds((prev) => [...prev, studentUid])}
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
