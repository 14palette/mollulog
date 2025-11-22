import { useState } from "react";
import dayjs from "dayjs";
import { ButtonForm, InputForm, SelectForm } from "~/components/molecules/form";
import { FormGroup } from "~/components/organisms/form";

type PackageInputProps = {
  onSavePackage: (startDate: Date, packageType: "half" | "full") => void;
};

export default function PackageInput({ onSavePackage }: PackageInputProps) {
  const [packageType, setPackageType] = useState<"half" | "full">("full");
  const [startDate, setStartDate] = useState(new Date());

  return (
    <>
      <p className="mb-2 text-sm text-neutral-500">월간 패키지의 구매 정보를 입력해주세요</p>
      <FormGroup>
        <SelectForm
          label="패키지 종류"
          options={[
            { label: "월간", value: "full" },
            { label: "하프", value: "half" },
          ]}
          initialValue={packageType}
          onSelect={(value) => setPackageType(value as "half" | "full")}
        />
        <InputForm
          label="패키지 시작 날짜"
          type="date"
          defaultValue={dayjs().format("YYYY-MM-DD")}
          onChange={(value) => setStartDate(new Date(value))}
        />
        <ButtonForm
          label="저장"
          color="blue"
          onClick={() => onSavePackage(startDate, packageType)}
        />
      </FormGroup>
    </>
  );
}
