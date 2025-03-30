import { defenseTypeLocale, attackTypeLocale, terrainLocale, raidTypeLocale } from "~/locales/ko";
import { bossImageUrl } from "~/models/assets";
import { defenseTypeColorMap, attackTypeColorMap } from "~/models/content.d";
import type { AttackType, DefenseType, RaidType, Terrain } from "~/models/content.d";
import { Chip } from "~/components/atoms/button";
import dayjs from "dayjs";

type RaidCardProps = {
  name: string;
  since: Date;
  until: Date;
  boss: string;
  type: RaidType;
  attackType: AttackType;
  defenseType: DefenseType;
  terrain: Terrain;
};

export default function RaidCard({
  name, since: sinceDate, until: untilDate, boss, type, attackType, defenseType, terrain,
}: RaidCardProps,
) {
  const since = dayjs(sinceDate);
  const until = dayjs(untilDate);
  const now = dayjs();

  return (
    <div>
      <div className="relative w-full">
        <img
          className="rounded-t-lg bg-linear-to-br from-neutral-50 to-neutral-300 dark:from-neutral-600 dark:to-neutral-800"
          src={bossImageUrl(boss)} alt={`총력전 보스 ${name}`} loading="lazy"
        />
        {since.isBefore(now) && until.isAfter(now) && (
          <div className="absolute top-2 left-2 px-2 py-0.5 flex items-center bg-neutral-900 rounded-full">
            <div className="inline-block size-2 mr-1 bg-red-600 rounded-full animate-pulse" />
            <span className="text-sm text-white">
              진행중
            </span>
          </div>
        )}
        <div className="absolute bottom-0 right-0 flex gap-x-1 p-1 text-white text-sm">
          <Chip text={terrainLocale[terrain]} color="black" />
          <Chip text={attackTypeLocale[attackType]} color={attackTypeColorMap[attackType]} />
          <Chip text={defenseTypeLocale[defenseType]} color={defenseTypeColorMap[defenseType]} />
        </div>
      </div>
      <div className="p-4 border rounded-b-lg border-neutral-200 dark:border-neutral-700">
        <p className="text-lg font-bold">{name}</p>
        <p className="text-sm text-neutral-500">
          {raidTypeLocale[type]} | {since.format("MM/DD HH:mm")} ~ {until.format("MM/DD HH:mm")}
        </p>
      </div>
    </div>
  );
} 
