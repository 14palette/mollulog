import dayjs from "dayjs";
import { useState } from "react";
import { Button } from "~/components/atoms/form";

type AttendanceInputProps = {
  onSaveAttendance: (startDate: Date) => void;
};

export default function AttendanceInput({ onSaveAttendance }: AttendanceInputProps) {
  const [startDate, setStartDate] = useState(new Date());

  const startDateIsBeforeToday = dayjs(startDate).isBefore(dayjs());
  return (
    <div>
      <p className="mt-2 mb-4 text-sm text-neutral-500">
        출석 1일차 기준 날짜를 입력해주세요.<br/>
        5일차에 50개, 10일치에 100개의 청휘석을 획득해요.<br/><br/>
        새로운 날짜를 입력하면 기존 입력값은 삭제돼요.
      </p>
      <p className="mb-1 text-sm text-neutral-700 dark:text-neutral-200 font-medium">출석 1일차</p>
      <input
        type="date"
        className="w-full px-2 py-1 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg disabled:opacity-40"
        defaultValue={dayjs().format("YYYY-MM-DD")}
        onChange={(e) => setStartDate(new Date(e.target.value))}
      />
      <div className="mt-2 -mr-2 flex justify-end">
        <Button text="저장" color="primary" onClick={() => onSaveAttendance(startDate)} disabled={startDateIsBeforeToday} />
      </div>
    </div>
  );
}
