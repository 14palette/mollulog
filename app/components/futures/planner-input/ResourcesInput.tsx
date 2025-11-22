import { useState } from "react";
import { PickupResources } from "..";
import { ResourceCard } from "../../atoms/item";
import { Button, NumberInput } from "../../atoms/form";
import { ResourceTypeEnum } from "~/graphql/graphql";
import dayjs from "dayjs";

type ResourcesInputProps = {
  description?: string;
  onSaveResources: (resources: PickupResources, description?: string, date?: Date) => void;

  descriptionInput?: boolean;
  dateInput?: boolean;
  vertical?: boolean;
};

export default function ResourcesInput({ description, onSaveResources, descriptionInput, dateInput, vertical }: ResourcesInputProps) {
  const [resources, setResources] = useState<PickupResources>({
    pyroxene: 0,
    oneTimeTicket: 0,
    tenTimeTicket: 0,
  });

  const [descriptionValue, setDescriptionValue] = useState<string>(description ?? "");
  const [date, setDate] = useState<Date>(new Date());
  return (
    <div>
      {description && <p className="mt-2 mb-4 text-sm text-neutral-500">{description}</p>}
      <div className={vertical ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-3 gap-4"}>
        {dateInput && (
          <div className="w-full">
            <p className="mb-1 text-sm text-neutral-700 dark:text-neutral-200 font-medium">획득 날짜</p>
            <input
              type="date"
              className="w-full px-2 py-1 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg disabled:opacity-40 transition-all"
              value={dayjs(date).format("YYYY-MM-DD")}
              onChange={(e) => setDate(new Date(e.target.value))}
            />
          </div>
        )}
        {descriptionInput && (
          <div className="w-full">
            <p className="mb-1 text-sm text-neutral-700 dark:text-neutral-200 font-medium">획득 사유</p>
            <input
              type="text"
              className="w-full px-2 py-1 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg disabled:opacity-40 transition-all"
              onChange={(e) => setDescriptionValue(e.target.value)}
              placeholder="20자 이하 (예: 점검 보상)"
            />
          </div>
        )}
        <div className="flex items-center justify-center gap-2">
          <ResourceCard resourceType={ResourceTypeEnum.Currency} itemUid="2" />
          <NumberInput label="청휘석" onChange={(value) => setResources((prev) => ({ ...prev, pyroxene: value }))} />
        </div>
        <div className="flex items-center justify-center gap-2">
          <ResourceCard resourceType={ResourceTypeEnum.Item} itemUid="6999" />
          <NumberInput label="10회 모집 티켓" onChange={(value) => setResources((prev) => ({ ...prev, tenTimeTicket: value }))} />
        </div>
        <div className="flex items-center justify-center gap-2">
          <ResourceCard resourceType={ResourceTypeEnum.Item} itemUid="6998" />
          <NumberInput label="1회 모집 티켓" onChange={(value) => setResources((prev) => ({ ...prev, oneTimeTicket: value }))} />
        </div>
      </div>
      <div className="mt-4 -mr-2 flex justify-end">
        <Button text="저장" color="primary" onClick={() => onSaveResources(resources, descriptionInput ? descriptionValue : undefined, dateInput ? date : undefined)} />
      </div>
    </div>
  );
}
