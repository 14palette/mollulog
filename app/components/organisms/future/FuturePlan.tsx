import { Link } from "react-router";
import dayjs from "dayjs";
import { MultilineText } from "~/components/atoms/typography";
import { ResourceCards, StudentCards } from "~/components/molecules/student";
import { pickupLabelLocale } from "~/locales/ko";
import { PickupType } from "~/models/content.d";

type FuturePlanProps = {
  events: {
    uid: string;
    name: string;
    since: Date;
    pickups: {
      type: PickupType;
      rerun: boolean;
      student: {
        uid: string;
        name: string;
        school: string;
        schaleDbId: string | null;
        equipments: string[];
      };
    }[];
  }[];
};

type MonthSummary = {
  month: dayjs.Dayjs;
  events: FuturePlanProps["events"];
  equipments: { [_: string]: number };
  schools: { [_: string]: number };
};

function toMonthString(month: dayjs.Dayjs): string {
  return month.format("YY/MM");
}

export default function FuturePlan({ events }: FuturePlanProps) {
  const beginMonth = dayjs().startOf("month");
  const endMonth = dayjs(events[events.length - 1].since).endOf("month");
  const months = Array.from({ length: endMonth.diff(beginMonth, "month") + 1 }, (_, i) => beginMonth.add(i, "month"));

  const monthSummaries: MonthSummary[] = months.map((month) => {
    const equipments: { [_: string]: number } = {};
    const schools: { [_: string]: number } = {};

    const monthEvents = events.filter((event) => dayjs(event.since).isSame(month, "month"));
    monthEvents.forEach((event) => {
      event.pickups.forEach(({ student }) => {
        student.equipments.forEach((equipment) => {
          if (!equipments[equipment]) {
            equipments[equipment] = 0;
          }
          equipments[equipment] += 1;
        });

        if (!schools[student.school]) {
          schools[student.school] = 0;
        }
        schools[student.school] += 1;
      });
    });

    return {
      month,
      events: monthEvents,
      equipments,
      schools,
    };
  });

  return (
    <table className="w-full md:mx-auto my-4 table-auto">
      <thead className="bg-neutral-100 dark:bg-neutral-900 text-left">
        <tr>
          <th className="p-2">일자</th>
          <th className="p-2">이벤트</th>
        </tr>
      </thead>
      <tbody>
        {monthSummaries.map(({ month, events, equipments, schools }) => {
          return (
            <tr key={toMonthString(month)}>
              <td className="md:px-2 py-2 align-text-top">
                <p className="my-4">{toMonthString(month)}</p>
              </td>
              <td className="px-2 py-4 border-b border-neutral-100 dark:border-neutral-700">
                {(events.length > 0) ? 
                  events.map((event) => {
                    return (
                      <div key={event.uid} className="my-1.5">
                        <Link to={`/events/${event.uid}`} className="hover:underline">
                          <MultilineText className="text-lg font-bold" texts={event.name.split("\n")} />
                          {/* <p className="font-bold text-lg">{event.name}</p> */}
                        </Link>
                        <p className="mb-2 text-neutral-500 text-sm">{dayjs(event.since).format("YYYY-MM-DD")}</p>
                        <StudentCards
                          mobileGrid={4}
                          students={event.pickups.map(({ student, type, rerun }) => ({
                            uid: student.uid,
                            name: student.name,
                            label: (
                              <span className={rerun ? "text-white" : "text-yellow-500"}>
                                {pickupLabelLocale({ type, rerun })}
                              </span>
                            ),
                          }))}
                        />
                      </div>
                    );
                  }) : <p className="my-2 text-neutral-300">(모집 일정 없음)</p>
                }
                {Object.keys(schools).length > 0 && (
                  <>
                    <p className="mt-4 font-bold">학원</p>
                    <ResourceCards
                      mobileGrid={5}
                      cardProps={Object.entries(schools).map(([school, count]) => ({
                        id: `school-${school}`,
                        imageUrl: `https://assets.mollulog.net/assets/images/schools/${school}`,
                        count,
                      }))}
                    />
                  </>
                )}
                {Object.keys(equipments).length > 0 && (
                  <>
                    <p className="mt-4 font-bold">장비</p>
                    <ResourceCards
                      mobileGrid={5}
                      cardProps={Object.entries(equipments).map(([equipment, count]) => ({
                        id: `equipment-${equipment}`,
                        imageUrl: `https://assets.mollulog.net/assets/images/equipments/${equipment}`,
                        count,
                      }))}
                    />
                  </>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
