import dayjs from "dayjs";
import { useState } from "react";
import { ButtonForm, InputForm } from "~/components/molecules/form";
import { FormGroup } from "~/components/organisms/form";

type BuyInputProps = {
  onSaveBuy: (quantity: number, date: Date) => void;
};

export default function BuyInput({ onSaveBuy }: BuyInputProps) {
  const [quantity, setQuantity] = useState(6600);
  const [date, setDate] = useState(new Date());

  // Check if the date (without time) is before today
  const dateIsBeforeToday = dayjs(date).startOf("day").isBefore(dayjs().startOf("day"));

  return (
    <>
      <p className="mb-2 text-sm text-neutral-500">구매할 청휘석의 수량과 날짜를 입력해주세요</p>
      <FormGroup>
        <InputForm
          label="구매 수량"
          type="number"
          defaultValue="6600"
          onChange={(value) => setQuantity(Number(value))}
        />
        <InputForm
          label="구매 날짜"
          type="date"
          defaultValue={dayjs().format("YYYY-MM-DD")}
          onChange={(value) => setDate(new Date(value))}
        />
        {!dateIsBeforeToday && (
          <ButtonForm
            label="저장"
            color="blue"
            onClick={() => onSaveBuy(quantity, date)}
          />
        )}
      </FormGroup>
      {dateIsBeforeToday && (
        <p className="text-sm text-red-500">구매 날짜가 오늘보다 이전이에요</p>
      )}
    </>
  )
}
