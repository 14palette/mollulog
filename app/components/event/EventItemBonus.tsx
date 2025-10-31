import Decimal from "decimal.js";
import { StudentCards } from "~/components/molecules/student";

type EventItemBonusProps = {
  itemUid: string;
  itemName: string;
  appliedRatio: Decimal;
  maxRatio: Decimal;
  rewardBonuses: {
    ratio: string;
    student: {
      uid: string;
      role: string;
    };
  }[];

  selectedBonusStudentUids?: string[];
  setSelectedBonusStudentUid?: (studentUid: string) => void;
};

export default function EventItemBonus({ itemUid, itemName, appliedRatio, maxRatio, rewardBonuses, selectedBonusStudentUids = [], setSelectedBonusStudentUid }: EventItemBonusProps) {
  return (
    <div key={itemUid} className="mt-4 mb-8">
      <div className="my-2 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center gap-2">
        <img src={`https://baql-assets.mollulog.net/images/items/${itemUid}`} alt={itemName} className="size-8 object-contain" />
        <div>
          <p className="font-bold">{itemName}</p>
          <p className="text-sm text-neutral-500">
            적용 {appliedRatio.mul(100).toFixed(0)}% / 최대 {maxRatio.mul(100).toFixed(0)}%
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="mb-2 font-bold">스트라이커</p>
          <StudentCards
            mobileGrid={8} pcGrid={6}
            students={rewardBonuses.filter(({ student }) => student.role === "striker").map(({ student, ratio }) => ({
              uid: student.uid,
              grayscale: !selectedBonusStudentUids.includes(student.uid),
              checked: setSelectedBonusStudentUid ? selectedBonusStudentUids.includes(student.uid) : false,
              label: <span className="text-white font-normal">{new Decimal(ratio).mul(100).toFixed(0)}%</span>,
            }))}
            onSelect={setSelectedBonusStudentUid}
          />
        </div>
        <div>
          <p className="mb-2 font-bold">스페셜</p>
          <StudentCards
            mobileGrid={8} pcGrid={6}
            students={rewardBonuses.filter(({ student }) => student.role === "special").map(({ student, ratio }) => ({
              uid: student.uid,
              grayscale: !selectedBonusStudentUids.includes(student.uid),
              checked: setSelectedBonusStudentUid ? selectedBonusStudentUids.includes(student.uid) : false,
              label: <span className="text-white font-normal">{new Decimal(ratio).mul(100).toFixed(0)}%</span>,
            }))}
            onSelect={setSelectedBonusStudentUid}
          />
        </div>
      </div>
    </div>
  );
}