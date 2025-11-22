import { useState } from "react";
import dayjs from "dayjs";
import { ButtonForm, InputForm } from "~/components/molecules/form";
import { FormGroup } from "~/components/organisms/form";

type AttendanceInputProps = {
  onSaveAttendance: (startDate: Date) => void;
};

export default function AttendanceInput({ onSaveAttendance }: AttendanceInputProps) {
  const [startDate, setStartDate] = useState(new Date());

  return (
    <>
      <p className="mb-2 text-sm text-neutral-500">
        출석 1일차 기준 날짜를 입력해주세요.<br/>
        5일차에 50개, 10일치에 100개의 청휘석을 획득해요.
      </p>
      <FormGroup>
        <InputForm
          label="출석 1일차 기준 날짜"
          type="date"
          defaultValue={dayjs().format("YYYY-MM-DD")}
          onChange={(value) => setStartDate(new Date(value))}
        />
        <ButtonForm
          label="저장"
          color="blue"
          onClick={() => onSaveAttendance(startDate)}
        />
      </FormGroup>
    </>
  );
}
