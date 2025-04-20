import dayjs from "dayjs";
import { KeyValueTable, SubTitle } from "~/components/atoms/typography";
import { ActionCard, type ActionCardAction } from "~/components/molecules/editor";
import { StudentCards } from "~/components/molecules/student";
import { EventTypeEnum } from "~/graphql/graphql";
import { eventTypeLocale } from "~/locales/ko";

type PickupHistoryViewProps = {
  uid: string;
  event: {
    name: string;
    type: EventTypeEnum;
    since: Date;
  };
  tier3Students: {
    studentId: string;
    name: string;
  }[];
  pickupStudentIds: string[];
  trial?: number;
  editable?: boolean;
};

function formatPercentage(ratio: number) {
  return `${(ratio * 100).toFixed(2)} %`;
}

export default function PickupHistoryView({ uid, event, tier3Students, pickupStudentIds, trial, editable }: PickupHistoryViewProps) {
  const actions: ActionCardAction[] = [];
  if (editable) {
    actions.push({ text: "편집", color: "default", link: `/edit/pickups/${uid}` });
    actions.push({ text: "삭제", color: "red", form: { method: "delete", hiddenInputs: [{ name: "uid", value: uid }] } });
  }

  const tier3StudentIds = tier3Students.map(({ studentId }) => studentId);
  const pickupCounts = pickupStudentIds.filter((studentId) => tier3StudentIds.includes(studentId)).length;
  const keyValueItems = [];
  if (trial !== undefined) {
    keyValueItems.push({ key: "모집 횟수", value: `${trial} 회` });
    keyValueItems.push({ key: "★3 학생 수", value: `${tier3Students.length} 회 (${formatPercentage(tier3StudentIds.length / trial)})` });
    keyValueItems.push({ key: "픽업 학생 수", value: `${pickupCounts} 회 (${formatPercentage(pickupCounts / trial)})` });
  }

  return (
    <ActionCard actions={actions}>
      <div className="-my-4">
        <SubTitle text={event.name} />
      </div>
      <p className="text-neutral-500 text-sm">
        {eventTypeLocale[event.type]} | {dayjs(event.since).format("YYYY-MM-DD")}
      </p>

      <p className="mt-4 mb-2 font-bold">모집한 ★3 학생</p>
      <StudentCards
        pcGrid={10}
        students={tier3Students.map(({ studentId, name }) => ({
          studentId,
          name,
          label: pickupStudentIds.includes(studentId) ? <span className="text-yellow-500">픽업</span> : undefined,
        }))}
      />

      <div className="mt-4">
        {keyValueItems.length > 0 && <KeyValueTable keyPrefix={`pickup-stats-${event.name}`} items={keyValueItems} />}
      </div>
    </ActionCard>
  );
}
