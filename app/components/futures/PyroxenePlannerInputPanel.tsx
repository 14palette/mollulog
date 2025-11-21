import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { ScreenPanel } from "~/components/navigation";
import FilterButtons from "~/components/navigation/FilterButtons";
import type { PickupResources } from ".";
import ResourcesInput from "./planner-input/ResourcesInput";
import BuyInput from "./planner-input/BuyInput";
import PackageInput from "./planner-input/PackageInput";
import AttendanceInput from "./planner-input/AttendanceInput";

type PyroxenePlannerInputPanelProps = {
  onSaveBuy: (quantity: number, date: Date) => void;
  onSavePackage: (startDate: Date, packageType: "half" | "full") => void;
  onSaveAttendance: (startDate: Date) => void;
  onSaveOther: (resources: PickupResources, description: string, date: Date) => void;
};

type InputMode = "buy" | "package" | "attendance" | "other";

export default function PyroxenePlannerInputPanel({ onSaveBuy, onSavePackage, onSaveAttendance, onSaveOther }: PyroxenePlannerInputPanelProps) {
  const [inputMode, setInputMode] = useState<InputMode | null>(null);
  const toggle = (mode: InputMode, activated: boolean) => {
    if (activated) {
      setInputMode(mode);
    } else {
      setInputMode(null);
    }
  };

  return (
    <ScreenPanel Icon={PlusIcon} title="재화 수급처" description="재화 획득 날짜와 수량을 입력해주세요" foldable>
      <div className="mb-2">
        <FilterButtons
          buttonProps={[
            {
              text: "청휘석 구매",
              active: inputMode === "buy",
              onToggle: (activated) => toggle("buy", activated),
            },
            {
              text: "월간 패키지",
              active: inputMode === "package",
              onToggle: (activated) => toggle("package", activated),
            },
            {
              text: "출석",
              active: inputMode === "attendance",
              onToggle: (activated) => toggle("attendance", activated),
            },
            {
              text: "기타",
              active: inputMode === "other",
              onToggle: (activated) => toggle("other", activated),
            }
          ]}
          exclusive
        />

        <div className="mb-3" />

        {inputMode === "buy" && (
          <BuyInput
            onSaveBuy={(quantity, date) => {
              onSaveBuy(quantity, date);
              setInputMode(null);
            }}
          />
        )}
        {inputMode === "package" && (
          <PackageInput
            onSavePackage={(startDate, packageType) => {
              onSavePackage(startDate, packageType);
              setInputMode(null);
            }}
          />
        )}
        {inputMode === "attendance" && (
          <AttendanceInput
            onSaveAttendance={(startDate) => {
              onSaveAttendance(startDate);
              setInputMode(null);
            }}
          />
        )}
        {inputMode === "other" && (
          <ResourcesInput
            onSaveResources={(resources, description, date) => {
              onSaveOther(resources, description!, date!);
              setInputMode(null);
            }}
            descriptionInput dateInput vertical
          />
        )}
      </div>
    </ScreenPanel>
  );
}
