import { useState } from "react";
import { PickupResources } from "..";
import { ResourceCard } from "../../atoms/item";
import { NumberInput } from "../../atoms/form";
import { ButtonForm, InputForm } from "~/components/molecules/form";
import { FormGroup } from "~/components/organisms/form";
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
    <>
      {description && <p className="mb-2 text-sm text-neutral-500">{description}</p>}
      <FormGroup>
        {dateInput && (
          <InputForm
            label="획득 날짜"
            type="date"
            defaultValue={dayjs(date).format("YYYY-MM-DD")}
            onChange={(value) => setDate(new Date(value))}
          />
        )}
        {descriptionInput && (
          <InputForm
            label="획득 사유"
            type="text"
            placeholder="20자 이하 (예: 점검 보상)"
            onChange={(value) => setDescriptionValue(value)}
          />
        )}
        <div className={`p-4 ${vertical ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-3 gap-4"}`}>
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
        <ButtonForm
          label="저장"
          color="blue"
          onClick={() => onSaveResources(resources, descriptionInput ? descriptionValue : undefined, dateInput ? date : undefined)}
        />
      </FormGroup>
    </>
  );
}
