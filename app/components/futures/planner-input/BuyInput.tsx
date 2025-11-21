import dayjs from "dayjs";
import { useState } from "react";
import { Button, NumberInput } from "~/components/atoms/form";
import { ResourceCard } from "~/components/atoms/item";
import { ResourceTypeEnum } from "~/graphql/graphql";

type BuyInputProps = {
  onSaveBuy: (quantity: number, date: Date) => void;
};

export default function BuyInput({ onSaveBuy }: BuyInputProps) {
  const [quantity, setQuantity] = useState(6600);
  const [date, setDate] = useState(new Date());

  return (
    <div>
      <p className="mt-2 mb-4 text-sm text-neutral-500">구매할 날짜와 수량을 입력해주세요</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-center gap-2">
          <ResourceCard resourceType={ResourceTypeEnum.Currency} itemUid="2" />
          <NumberInput
            label="구매 수량"
            defaultValue={6600}
            onChange={(value) => setQuantity(value)}
          />
        </div>
        <div className="w-full">
          <p className="mb-1 text-sm text-neutral-700 dark:text-neutral-200 font-medium">구매할 날짜</p>
          <input
            type="date"
            className="w-full px-2 py-1 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg disabled:opacity-40"
            defaultValue={dayjs().format("YYYY-MM-DD")}
            onChange={(e) => setDate(new Date(e.target.value))}
          />
        </div>
      </div>
      <div className="mt-2 -mr-2 flex justify-end">
        <Button text="저장" color="primary" onClick={() => onSaveBuy(quantity, date)} />
      </div>
    </div>
  );
}