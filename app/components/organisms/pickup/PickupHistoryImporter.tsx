import { useState } from "react";
import { Button, Textarea } from "~/components/atoms/form";
import { PickupStudentSelectCard } from "~/components/molecules/pickup";
import { parsePickupHistory, PickupHistory } from "~/models/pickup-history";

type PickupHistoryImporterProps = {
  tier3Students: {
    studentId: string;
    name: string;
  }[];
  initialResult?: PickupHistory["result"];
  initialRawResult?: string;
  onComplete: ({ result, rawResult }: { result: PickupHistory["result"], rawResult?: string }) => void;
};

export default function PickupHistoryImporter(
  { tier3Students, initialResult, initialRawResult, onComplete }: PickupHistoryImporterProps,
) {
  const [rawResult, setRawResult] = useState<string | undefined>(initialRawResult);
  const [parsedResult, setParsedResult] = useState<PickupHistory["result"]>(initialResult ?? []);

  return (
    <>
     <Textarea
        className="h-64"
        label="모집 결과"
        description="10연 모집 결과를 한 줄에 하나씩 입력"
        placeholder="1/2/7 드요코&#10;1 3 6 밴즈사&#10;..."
        defaultValue={initialRawResult}
        onChange={(value) => {
          setRawResult(value);
          setParsedResult(parsePickupHistory(value, tier3Students));
        }}
      />

      {parsedResult.length > 0 && (
        <>
          <p className="my-2 text-sm text-neutral-500 dark:text-neutral-300">
            학생 이미지를 클릭하여 모집한 학생을 수정할 수 있어요.
          </p>
          <table className="w-full md:w-fit">
            <thead className="bg-neutral-100 dark:bg-neutral-900 rounded-lg">
              <tr>
                <th className="text-left px-4 py-2 rounded-l-lg">횟수</th>
                <th className="text-left min-w-96 p-2 pr-4 rounded-r-lg">모집한 ★3 학생</th>
              </tr>
            </thead>
            <tbody>
              {parsedResult.map((eachResult) => {
                const resultTier3Students = new Array(eachResult.tier3Count).fill(null);
                eachResult.tier3StudentIds.forEach((studentId, index) => {
                  if (index < resultTier3Students.length) {
                    resultTier3Students[index] = studentId;
                  }
                });

                return (
                  <tr key={`trial-${eachResult.trial}`} className="relative py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition">
                    <td className="px-4 p-2 h-16 font-bold rounded-l-lg">{eachResult.trial}</td>
                    <td className="rounded-r-lg">
                      <div className="flex gap-x-2">
                        {resultTier3Students.length === 0 && <span className="text-neutral-300">(★3 학생 없음)</span>}
                        {resultTier3Students.map((studentId, index) => (
                          <PickupStudentSelectCard
                            key={`student-${studentId ?? "unselected"}-${index}`}
                            studentId={studentId}
                            tier3Students={tier3Students}
                            onChange={(newStudentId) => {
                              setParsedResult((prev) => {
                                const newResult = [...prev];
                                newResult.find((result) => result.trial === eachResult.trial)!.tier3StudentIds[index] = newStudentId;
                                return newResult;
                              });
                            }}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      <div className="my-8">
        {parsedResult.length > 0 && parsedResult.every((result) => result.tier3StudentIds.length === result.tier3Count) && (
          <Button
            text="완료" color="primary"
            onClick={() => onComplete({ result: parsedResult, rawResult })}
          />
        )}
      </div>
    </>
  );
}
