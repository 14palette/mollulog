import dayjs from "dayjs";
import SelectForm, { type SelectFormProps } from "./SelectForm";
import { StudentCards } from "../student";

type ContentSelectFormProps = Omit<SelectFormProps, "options"> & {
  contents: {
    uid: string;
    name: string;
    since: Date;
    until: Date;
    pickups: {
      student: { uid: string;} | null;
      studentName: string;
    }[];
  }[];
  onSelect?: (contentUid: string) => void;
};

export default function ContentSelectForm(props: ContentSelectFormProps) {
  return (
    <SelectForm
      {...props}
      options={props.contents.map((content) => ({
        label: content.name,
        value: content.uid,
        searchLabel: `${content.name} ${content.pickups.map((pickup) => pickup.studentName).join(" ")}`,
        element: (
          <div className="px-4 py-2">
            <p className="font-bold">{content.name}</p>
            <p className="mb-2 text-sm text-neutral-500">
              {dayjs(content.since).format("YYYY.MM.DD")} ~ {dayjs(content.until).format("YYYY.MM.DD")}
            </p>
            <StudentCards
              students={content.pickups.filter((pickup) => pickup.student).map((pickup) => pickup.student!)}
              pcGrid={12} mobileGrid={8}
            />
          </div>
        ),
      }))}
      useSearch
      searchPlaceholder="이벤트 또는 픽업 학생 이름으로 찾기..."
    />
  )
}
