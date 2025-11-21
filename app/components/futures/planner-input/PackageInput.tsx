import dayjs from "dayjs";
import { useState } from "react";
import { Button } from "~/components/atoms/form";
import FilterButtons from "~/components/navigation/FilterButtons";

type PackageInputProps = {
  onSavePackage: (startDate: Date, packageType: "half" | "full") => void;
};

export default function PackageInput({ onSavePackage }: PackageInputProps) {
  const [packageType, setPackageType] = useState<"half" | "full">("full");
  const [startDate, setStartDate] = useState(new Date());

  const startDateIsBeforeToday = dayjs(startDate).isBefore(dayjs());
  return (
    <div>
      <p className="mt-2 mb-4 text-sm text-neutral-500">패키지 시작 날짜를 입력해주세요</p>
      <p className="mb-1 text-sm text-neutral-700 dark:text-neutral-200 font-medium">시작 날짜</p>
      <input
        type="date"
        className="w-full px-2 py-1 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg disabled:opacity-40"
        defaultValue={dayjs().format("YYYY-MM-DD")}
        onChange={(e) => setStartDate(new Date(e.target.value))}
      />
      <FilterButtons
        buttonProps={[
          {
            text: "월간",
            active: packageType === "full",
            onToggle: () => setPackageType(packageType === "full" ? "half" : "full"),
          },
          {
            text: "하프",
            active: packageType === "half",
            onToggle: () => setPackageType(packageType === "half" ? "full" : "half"),
          },
        ]}
        atLeastOne exclusive
      />
      <div className="mt-2 -mr-2 flex justify-end">
        <Button text="저장" color="primary" onClick={() => onSavePackage(startDate, packageType)} disabled={startDateIsBeforeToday} />
      </div>
      {startDateIsBeforeToday && (
        <p className="mt-2 text-sm text-red-500 text-right">패키지 시작 날짜가 오늘보다 이전이에요</p>
      )}
    </div>
  );
}
