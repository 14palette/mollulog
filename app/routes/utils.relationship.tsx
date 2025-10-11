import { useEffect, useState, useMemo } from "react";
import { useFetcher, useLoaderData, useRevalidator } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "react-router";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { HeartIcon, BookmarkIcon } from "@heroicons/react/16/solid";
import { SubTitle, Title } from "~/components/atoms/typography";
import { Input, Toggle, Button } from "~/components/atoms/form";
import { ResourceCard } from "~/components/atoms/item";
import { filterStudentByName } from "~/filters/student";
import { getAuthenticator } from "~/auth/authenticator.server";
import { useSignIn } from "~/contexts/SignInProvider";
import { StudentRelationships } from "~/components/molecules/student";
import { getAllStudents } from "~/models/student";
import { upsertRelationshipLevel, getRelationshipLevels, removeRelationshipLevel, type RelationshipLevel } from "~/models/relationship-level";
import { redirect } from "react-router";

// Experience table data from Blue Archive
const EXP_TABLE = [
  { level: 1, expToNext: 15, accumulatedExp: 0 },
  { level: 2, expToNext: 30, accumulatedExp: 15 },
  { level: 3, expToNext: 30, accumulatedExp: 45 },
  { level: 4, expToNext: 35, accumulatedExp: 75 },
  { level: 5, expToNext: 35, accumulatedExp: 110 },
  { level: 6, expToNext: 35, accumulatedExp: 145 },
  { level: 7, expToNext: 40, accumulatedExp: 180 },
  { level: 8, expToNext: 40, accumulatedExp: 220 },
  { level: 9, expToNext: 40, accumulatedExp: 260 },
  { level: 10, expToNext: 60, accumulatedExp: 300 },
  { level: 11, expToNext: 90, accumulatedExp: 360 },
  { level: 12, expToNext: 105, accumulatedExp: 450 },
  { level: 13, expToNext: 120, accumulatedExp: 555 },
  { level: 14, expToNext: 140, accumulatedExp: 675 },
  { level: 15, expToNext: 160, accumulatedExp: 815 },
  { level: 16, expToNext: 180, accumulatedExp: 975 },
  { level: 17, expToNext: 205, accumulatedExp: 1155 },
  { level: 18, expToNext: 230, accumulatedExp: 1360 },
  { level: 19, expToNext: 255, accumulatedExp: 1590 },
  { level: 20, expToNext: 285, accumulatedExp: 1845 },
  { level: 21, expToNext: 315, accumulatedExp: 2130 },
  { level: 22, expToNext: 345, accumulatedExp: 2445 },
  { level: 23, expToNext: 375, accumulatedExp: 2790 },
  { level: 24, expToNext: 410, accumulatedExp: 3165 },
  { level: 25, expToNext: 445, accumulatedExp: 3575 },
  { level: 26, expToNext: 480, accumulatedExp: 4020 },
  { level: 27, expToNext: 520, accumulatedExp: 4500 },
  { level: 28, expToNext: 560, accumulatedExp: 5020 },
  { level: 29, expToNext: 600, accumulatedExp: 5580 },
  { level: 30, expToNext: 645, accumulatedExp: 6180 },
  { level: 31, expToNext: 690, accumulatedExp: 6825 },
  { level: 32, expToNext: 735, accumulatedExp: 7515 },
  { level: 33, expToNext: 780, accumulatedExp: 8250 },
  { level: 34, expToNext: 830, accumulatedExp: 9030 },
  { level: 35, expToNext: 880, accumulatedExp: 9860 },
  { level: 36, expToNext: 930, accumulatedExp: 10740 },
  { level: 37, expToNext: 985, accumulatedExp: 11670 },
  { level: 38, expToNext: 1040, accumulatedExp: 12655 },
  { level: 39, expToNext: 1095, accumulatedExp: 13695 },
  { level: 40, expToNext: 1155, accumulatedExp: 14790 },
  { level: 41, expToNext: 1215, accumulatedExp: 15945 },
  { level: 42, expToNext: 1275, accumulatedExp: 17160 },
  { level: 43, expToNext: 1335, accumulatedExp: 18435 },
  { level: 44, expToNext: 1400, accumulatedExp: 19770 },
  { level: 45, expToNext: 1465, accumulatedExp: 21170 },
  { level: 46, expToNext: 1530, accumulatedExp: 22635 },
  { level: 47, expToNext: 1600, accumulatedExp: 24165 },
  { level: 48, expToNext: 1670, accumulatedExp: 25765 },
  { level: 49, expToNext: 1740, accumulatedExp: 27435 },
  { level: 50, expToNext: 1815, accumulatedExp: 29175 },
  { level: 51, expToNext: 1890, accumulatedExp: 30990 },
  { level: 52, expToNext: 1965, accumulatedExp: 32880 },
  { level: 53, expToNext: 2040, accumulatedExp: 34845 },
  { level: 54, expToNext: 2120, accumulatedExp: 36885 },
  { level: 55, expToNext: 2200, accumulatedExp: 39005 },
  { level: 56, expToNext: 2280, accumulatedExp: 41205 },
  { level: 57, expToNext: 2365, accumulatedExp: 43485 },
  { level: 58, expToNext: 2450, accumulatedExp: 45850 },
  { level: 59, expToNext: 2535, accumulatedExp: 48300 },
  { level: 60, expToNext: 2625, accumulatedExp: 50835 },
  { level: 61, expToNext: 2715, accumulatedExp: 53460 },
  { level: 62, expToNext: 2805, accumulatedExp: 56175 },
  { level: 63, expToNext: 2895, accumulatedExp: 58980 },
  { level: 64, expToNext: 2990, accumulatedExp: 61875 },
  { level: 65, expToNext: 3085, accumulatedExp: 64865 },
  { level: 66, expToNext: 3180, accumulatedExp: 67950 },
  { level: 67, expToNext: 3280, accumulatedExp: 71130 },
  { level: 68, expToNext: 3380, accumulatedExp: 74410 },
  { level: 69, expToNext: 3480, accumulatedExp: 77790 },
  { level: 70, expToNext: 3585, accumulatedExp: 81270 },
  { level: 71, expToNext: 3690, accumulatedExp: 84855 },
  { level: 72, expToNext: 3795, accumulatedExp: 88545 },
  { level: 73, expToNext: 3900, accumulatedExp: 92340 },
  { level: 74, expToNext: 4010, accumulatedExp: 96240 },
  { level: 75, expToNext: 4120, accumulatedExp: 100250 },
  { level: 76, expToNext: 4230, accumulatedExp: 104370 },
  { level: 77, expToNext: 4345, accumulatedExp: 108600 },
  { level: 78, expToNext: 4460, accumulatedExp: 112945 },
  { level: 79, expToNext: 4575, accumulatedExp: 117405 },
  { level: 80, expToNext: 4695, accumulatedExp: 121980 },
  { level: 81, expToNext: 4815, accumulatedExp: 126675 },
  { level: 82, expToNext: 4935, accumulatedExp: 131490 },
  { level: 83, expToNext: 5055, accumulatedExp: 136425 },
  { level: 84, expToNext: 5180, accumulatedExp: 141480 },
  { level: 85, expToNext: 5305, accumulatedExp: 146660 },
  { level: 86, expToNext: 5430, accumulatedExp: 151965 },
  { level: 87, expToNext: 5560, accumulatedExp: 157395 },
  { level: 88, expToNext: 5690, accumulatedExp: 162955 },
  { level: 89, expToNext: 5820, accumulatedExp: 168645 },
  { level: 90, expToNext: 5955, accumulatedExp: 174465 },
  { level: 91, expToNext: 6090, accumulatedExp: 180420 },
  { level: 92, expToNext: 6225, accumulatedExp: 186510 },
  { level: 93, expToNext: 6360, accumulatedExp: 192735 },
  { level: 94, expToNext: 6500, accumulatedExp: 199095 },
  { level: 95, expToNext: 6640, accumulatedExp: 205595 },
  { level: 96, expToNext: 6780, accumulatedExp: 212235 },
  { level: 97, expToNext: 6925, accumulatedExp: 219015 },
  { level: 98, expToNext: 7070, accumulatedExp: 225940 },
  { level: 99, expToNext: 7215, accumulatedExp: 233010 },
  { level: 100, expToNext: 0, accumulatedExp: 240225 },
];

// Function to get accumulated experience for a given level
function getAccumulatedExp(level: number): number {
  const levelData = EXP_TABLE.find(entry => entry.level === level);
  return levelData ? levelData.accumulatedExp : 0;
}

// Function to get remaining EXP to next level
function getRemainingExpTo(currentExp: number, targetLevel: number): number {
  const nextLevelData = EXP_TABLE.find(entry => entry.level === targetLevel);
  if (!nextLevelData || targetLevel < nextLevelData.level) {
    return 0
  }

  const remainingExp = nextLevelData.accumulatedExp - currentExp;
  return Math.max(0, remainingExp);
}

// Function to calculate expected level from current level and total EXP
function calculateExpectedLevel(currentLevel: number, totalExp: number): number {
  if (currentLevel < 1 || currentLevel > 100) return currentLevel;

  const currentLevelData = EXP_TABLE.find(entry => entry.level === currentLevel);
  if (!currentLevelData) return currentLevel;

  // Calculate current accumulated EXP (from level 1 to current level)
  const currentAccumulatedExp = currentLevelData.accumulatedExp;

  // Add the total EXP from items
  const newAccumulatedExp = currentAccumulatedExp + totalExp;

  // Find the highest level that can be reached with this EXP
  for (let i = EXP_TABLE.length - 1; i >= 0; i--) {
    if (newAccumulatedExp >= EXP_TABLE[i].accumulatedExp) {
      return EXP_TABLE[i].level;
    }
  }
  return 1; // Fallback
}


export const meta: MetaFunction = () => {
  const title = "인연 랭크 계산기 | 몰루로그";
  const description = "블루 아카이브 학생들의 인연 랭크를 계산하고 관리해보세요";
  return [
    { title },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
};

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const allStudents = await getAllStudents(env, true);

  // Get saved relationship levels from database if user is authenticated
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  let savedRelationships: Record<string, RelationshipLevel> = {};
  if (currentUser) {
    const relationLevels = await getRelationshipLevels(env, currentUser.id);
    savedRelationships = relationLevels.reduce((acc, rel) => {
      acc[rel.studentId] = rel;
      return acc;
    }, {} as Record<string, RelationshipLevel>);
  }

  // Merge students with their relationship levels (only for authenticated users)
  const studentsWithRelationships = allStudents.map((student) => {
    const savedLevel = savedRelationships[student.uid];
    return {
      ...student,
      currentLevel: savedLevel?.currentLevel ?? null,
      targetLevel: savedLevel?.targetLevel ?? null,
      items: savedLevel?.items ?? {},
    };
  });

  return {
    students: studentsWithRelationships.sort((a, b) => {
      const aLevel = a.currentLevel ?? 0;
      const bLevel = b.currentLevel ?? 0;
      if (aLevel === bLevel) {
        return a.order - b.order;
      }
      return bLevel - aLevel;
    }),
    isAuthenticated: !!currentUser,
  };
};

export type ActionData = {
  studentId: string;
  currentLevel: number;
  targetLevel: number;
  items: Record<string, number>;
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect("/unauthorized");
  }

  if (request.method === "DELETE") {
    const actionData = await request.json<{ studentId: string }>();
    await removeRelationshipLevel(env, currentUser.id, actionData.studentId);
  } else if (request.method === "POST") {
    const actionData = await request.json<ActionData>();
    await upsertRelationshipLevel(
      env,
      currentUser.id,
      actionData.studentId,
      actionData.currentLevel,
      actionData.targetLevel,
      actionData.items
    );
  }

  return null;
};

const emptyRelationshipLevel = {
  currentLevel: 1,
  targetLevel: 50,
  items: {},
};

const expTypes = [
  { type: "item", name: "일반 선물", item: { favoriteLevel: 2, rarity: 3 }, exp: 40 },
  { type: "item", name: "일반 선물", item: { favoriteLevel: 3, rarity: 3 }, exp: 60 },
  { type: "item", name: "일반 선물", item: { favoriteLevel: 4, rarity: 3 }, exp: 80 },
  { type: "item", name: "고급 선물", item: { favoriteLevel: 2, rarity: 4 }, exp: 120 },
  { type: "item", name: "고급 선물", item: { favoriteLevel: 3, rarity: 4 }, exp: 180 },
  { type: "item", name: "고급 선물", item: { favoriteLevel: 4, rarity: 4 }, exp: 240 },
  { type: "cafe", name: "카페 쓰다듬기", exp: 15 },
  { type: "schedule", name: "스케줄", exp: 25 },
];

export default function Relationship() {
  const { students, isAuthenticated } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof import("./api.students.$uid.items").loader>();
  const saveFetcher = useFetcher<typeof action>();
  const revalidator = useRevalidator();
  const { showSignIn } = useSignIn();

  const [filteredStudents, setFilteredStudents] = useState<{ uid: string; name: string; currentLevel: number | null; targetLevel: number | null }[]>(students.slice(0, 20));
  const [selectedStudentUid, setSelectedStudent] = useState<string | null>(null);

  // Update filteredStudents when students data changes (e.g., after revalidation)
  useEffect(() => {
    const newFilteredStudents = students.slice(0, 20);
    if (selectedStudentUid && !newFilteredStudents.find((s) => s.uid === selectedStudentUid)) {
      // Add selected student to the top of the filtered students
      newFilteredStudents.unshift(students.find((s) => s.uid === selectedStudentUid)!);
    }
    setFilteredStudents(newFilteredStudents.slice(0, 20));
  }, [students]);

  // RelationshipLevel fields merged into one state
  const [relationshipLevel, setRelationshipLevel] = useState<{
    currentLevel: number;
    targetLevel: number;
    items: Record<string, number>;
  }>(emptyRelationshipLevel);

  // UI-only states remain separate
  const [expectingLevel, setExpectingLevel] = useState<number>(1);
  const [expectedExp, setExpectedExp] = useState<number>(0);
  useEffect(() => {
    if (selectedStudentUid) {
      const student = students.find(s => s.uid === selectedStudentUid);
      setRelationshipLevel({
        currentLevel: student?.currentLevel ?? emptyRelationshipLevel.currentLevel,
        targetLevel: student?.targetLevel ?? emptyRelationshipLevel.targetLevel,
        items: student?.items ?? emptyRelationshipLevel.items,
      });

      // load favorite items for selected student
      fetcher.load(`/api/students/${selectedStudentUid}/items`);
    }
  }, [selectedStudentUid]);

  // Handle action success feedback
  const [actionSuccess, setActionSuccess] = useState<"save" | "delete" | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Handle fetcher completion
  useEffect(() => {
    if (saveFetcher.state === "idle" && saveFetcher.data !== undefined && actionSuccess) {
      if (actionSuccess === "delete") {
        // Reset relationship level to empty state after delete
        setRelationshipLevel(emptyRelationshipLevel);
      }

      // Revalidate loader data to refresh the StudentRelationships component
      revalidator.revalidate();
    }
  }, [saveFetcher.state, saveFetcher.data, actionSuccess, revalidator]);

  // Handle success message timeout
  useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => setActionSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess]);

  const handleSave = () => {
    if (!selectedStudentUid) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      showSignIn();
      return;
    }

    if (relationshipLevel.currentLevel < 1 || relationshipLevel.currentLevel > 100 || relationshipLevel.targetLevel < 1 || relationshipLevel.targetLevel > 100) {
      setSaveError("인연 랭크는 1부터 100 사이만 가능해요");
      return;
    }
    if (relationshipLevel.targetLevel < relationshipLevel.currentLevel) {
      setSaveError("목표 랭크는 현재 랭크보다 높아야 해요");
      return;
    }
    setSaveError(null);
    setActionSuccess("save");

    saveFetcher.submit(
      {
        studentId: selectedStudentUid,
        currentLevel: relationshipLevel.currentLevel,
        targetLevel: relationshipLevel.targetLevel,
        items: relationshipLevel.items,
      },
      {
        method: "POST",
        encType: "application/json",
      }
    );
  };

  const handleDelete = () => {
    if (!selectedStudentUid) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      showSignIn();
      return;
    }

    setActionSuccess("delete");
    saveFetcher.submit(
      {
        studentId: selectedStudentUid,
      },
      {
        method: "DELETE",
        encType: "application/json",
      }
    );
  };

  // Check if current student has saved data
  const hasSavedData = selectedStudentUid && students.find(s => s.uid === selectedStudentUid)?.currentLevel !== null;

  return (
    <>
      <Title
        text="인연 랭크 계산기"
        description="학생들의 목표 인연 레벨까지 필요한 선물 개수를 계산할 수 있어요."
      />
      <SubTitle text="학생 선택" />
      <Input
        placeholder="이름으로 찾기..."
        onChange={(value) => {
          const filtered = filterStudentByName(value, students, 20);
          const sorted = filtered.sort((a, b) => {
            const aLevel = students.find(s => s.uid === a.uid)?.currentLevel ?? 0;
            const bLevel = students.find(s => s.uid === b.uid)?.currentLevel ?? 0;
            return bLevel - aLevel;
          });
          setFilteredStudents(sorted);
        }}
      />

      <div className="-mt-4">
        <StudentRelationships
          students={filteredStudents.map((student) => ({ 
            uid: student.uid,
            name: student.name,
            level: student.currentLevel,
          }))}
          selectedStudent={selectedStudentUid}
          onSelect={(uid) => {
            setSelectedStudent(uid);
          }}
        />
      </div>

      {selectedStudentUid && (
        <div className="mt-8">
          <SubTitle text="인연 랭크" description="기존 경험치에 따라 다소 차이가 생길 수 있어요" />
          <div className="sticky top-4 z-10 p-4 bg-neutral-100/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <LevelInput
                label="현재 랭크"
                value={relationshipLevel.currentLevel}
                onChange={(value) => setRelationshipLevel(prev => ({ ...prev, currentLevel: value }))}
                expLabel={`${getAccumulatedExp(relationshipLevel.currentLevel).toLocaleString()} EXP`}
              />
              <ChevronRightIcon className="hidden md:block mt-2 size-6 text-neutral-500 dark:text-neutral-400 shrink-0" strokeWidth={2} />
              <LevelInput
                label="선물 후 랭크"
                value={expectingLevel}
                expLabel={expectingLevel === 100 ? "최고 레벨에 도달했어요" : `다음 랭크까지 +${getRemainingExpTo(expectedExp, expectingLevel + 1).toLocaleString()} EXP`}
                readOnly
              />
              <ChevronRightIcon className="hidden md:block mt-2 size-6 text-neutral-500 dark:text-neutral-400 shrink-0" strokeWidth={2} />
              <LevelInput
                label="목표 랭크"
                value={relationshipLevel.targetLevel}
                onChange={(value) => setRelationshipLevel(prev => ({ ...prev, targetLevel: value }))}
                expLabel={relationshipLevel.targetLevel <= relationshipLevel.currentLevel ? "목표 랭크에 도달했어요" : `목표 랭크까지 +${getRemainingExpTo(expectedExp, relationshipLevel.targetLevel).toLocaleString()} EXP`}
              />
            </div>
          </div>

          <SubTitle text="목표 랭크까지 필요한 선물 개수" />
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {expTypes.map(({ type, name, exp, item }) => (
              <div key={`${type}-${name}-${exp}`} className="p-3 flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                {item && <ResourceCard rarity={item.rarity} imageUrl={`https://assets.mollulog.net/assets/images/ui/gift-reaction-${item.favoriteLevel}.png`} />}
                {(type === "schedule") && <ResourceCard rarity={1} imageUrl="https://assets.mollulog.net/assets/images/ui/menu-schedule.webp" />}
                {(type === "cafe") && <ResourceCard rarity={1} imageUrl="https://assets.mollulog.net/assets/images/ui/menu-cafe.webp" />}
                <div className="w-full">
                  <div className="text-sm md:text-base w-full flex items-center justify-between gap-1">
                    <span className="grow font-medium">{name}</span>
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {Math.ceil((getRemainingExpTo(expectedExp, relationshipLevel.targetLevel) / exp)).toLocaleString()}{item ? "개" : "번"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Favorite items from API */}
          {(fetcher.state !== "idle" && fetcher.data === undefined) ? (
            <div className="mt-4 text-neutral-500 dark:text-neutral-400">불러오는 중...</div>
          ) : fetcher.data ? (
            <div className="mt-8">
              <FavoriteItemList 
                items={fetcher.data.favoriteItems} 
                currentLevel={relationshipLevel.currentLevel}
                onExpectedLevelChange={setExpectingLevel}
                onExpectedExpChange={setExpectedExp}
                quantities={relationshipLevel.items}
                onQuantitiesChange={(items) => setRelationshipLevel(prev => ({ ...prev, items }))}
              />
              
              {/* Save and Delete buttons with feedback */}
              <div className="mt-6 flex flex-col items-end gap-2">
                <div className="flex gap-1">
                  {hasSavedData && (
                    <Button
                      text="초기화"
                      onClick={handleDelete}
                      disabled={saveFetcher.state !== "idle" || !selectedStudentUid}
                    />
                  )}
                  <Button
                    text={saveFetcher.state === "submitting" ? "저장중..." : "저장하기"}
                    Icon={BookmarkIcon}
                    color="primary"
                    onClick={handleSave}
                    disabled={saveFetcher.state !== "idle" || !selectedStudentUid}
                  />
                </div>
                {actionSuccess && (
                  <div className="mr-2 text-sm text-green-600 dark:text-green-400">
                    {actionSuccess === "delete" ? "저장된 데이터를 초기화했어요" : "성공적으로 저장했어요"}
                  </div>
                )}
                {saveError && (
                  <div className="mr-2 text-sm text-red-600 dark:text-red-400">
                    {saveError}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}

type LevelInputProps = {
  label: string;
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  expLabel?: string;
};

function LevelInput({ label, value, onChange, readOnly = false, expLabel }: LevelInputProps) {
  return (
    <div className="w-full sm:flex-1">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          className={`
            w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-semibold appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] ${
            readOnly ? "bg-pink-50 dark:bg-pink-700 cursor-not-allowed" : "bg-white dark:bg-neutral-700"
          }`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => {
            const inputValue = e.target.value;
            // Only allow digits and remove leading zeros
            const digitsOnly = inputValue.replace(/[^0-9]/g, "");
            const cleanValue = digitsOnly.replace(/^0+/, "") || "0";
            let numValue = Number(cleanValue);

            // Validate range: 1-100
            if (numValue < 0) numValue = 0;
            if (numValue > 100) numValue = 100;
            onChange?.(numValue);
          }}
          readOnly={readOnly}
        />
        <HeartIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-neutral-600 dark:text-neutral-400" />
      </div>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 text-left md:text-center">
        {expLabel}
      </p>
    </div>
  );
}


type FavoriteItemListProps = {
  items: {
    item: {
      uid: string;
      name: string;
      rarity: number;
    };
    favorited: boolean;
    favoriteLevel: number;
    exp: number;
  }[];
  currentLevel: number;
  onExpectedLevelChange: (level: number) => void;
  onExpectedExpChange: (exp: number) => void;
  quantities: Record<string, number>;
  onQuantitiesChange: (quantities: Record<string, number>) => void;
};

function FavoriteItemList({ items, currentLevel, onExpectedLevelChange, onExpectedExpChange, quantities, onQuantitiesChange }: FavoriteItemListProps) {
  const [filterFavorited, setFilterFavorited] = useState(true);
  
  const filteredItems = useMemo(() => items.filter(({ favorited }) => filterFavorited ? favorited : true).sort((a, b) => {
    if (a.item.rarity === b.item.rarity) {
      return b.favoriteLevel - a.favoriteLevel;
    }
    return b.item.rarity - a.item.rarity;
  }), [items, filterFavorited]);

  const totalExp = useMemo(() => 
    filteredItems.reduce((total, { item, exp }) => {
      const quantity = quantities[item.uid] || 0;
      return total + (exp * quantity);
    }, 0), [filteredItems, quantities]
  );

  // Calculate expected level and experience whenever totalExp or currentLevel changes
  useEffect(() => {
    const expectedLevel = calculateExpectedLevel(currentLevel, totalExp);
    const currentAccumulatedExp = getAccumulatedExp(currentLevel);
    const expectedExp = currentAccumulatedExp + totalExp;
    onExpectedLevelChange(expectedLevel);
    onExpectedExpChange(expectedExp);
  }, [currentLevel, totalExp, onExpectedLevelChange, onExpectedExpChange]);

  const updateQuantity = (itemUid: string, quantity: number) => {
    onQuantitiesChange({
      ...quantities,
      [itemUid]: Math.max(0, quantity)
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <SubTitle text="선물 목록" />
        <Toggle label="좋아하는 선물만 보기" initialState={filterFavorited} onChange={setFilterFavorited} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.map(({ item, favoriteLevel, exp }) => {
          const quantity = quantities[item.uid] || 0;
          const totalItemExp = exp * quantity;
          return (
            <div
              key={item.uid}
              className="group p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow transition-shadow duration-200"
            >
              <div className="flex items-start">
                <ResourceCard rarity={item.rarity} favoriteLevel={favoriteLevel} itemUid={item.uid} />

                <div className="ml-3 grow min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">{item.name}</p>
                    {quantity > 0 && (
                      <span className="shrink-0 rounded-full bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 text-xs border border-green-200 dark:border-green-800">
                        +{totalItemExp.toLocaleString()} EXP
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">인연 랭크 경험치: {exp}</div>

                  <div className="mt-3 flex items-center gap-2">
                    <label className="text-sm text-neutral-600 dark:text-neutral-400">수량</label>
                    <div className="inline-flex items-center rounded-md border border-neutral-300 dark:border-neutral-700 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.uid, (quantities[item.uid] || 0) - 1)}
                        className="px-2 py-1 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40"
                        disabled={quantity <= 0}
                        aria-label="감소"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={quantity}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // Only allow digits and remove leading zeros
                          const digitsOnly = inputValue.replace(/[^0-9]/g, "");
                          const cleanValue = digitsOnly.replace(/^0+/, "") || "0";

                          let numValue = Number(cleanValue);
                          // Validate range: 0-(inf)
                          if (numValue < 0) numValue = 0;
                          updateQuantity(item.uid, numValue);
                        }}
                        className="w-16 px-2 py-1 text-center text-sm bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        aria-label={`${item.name} 수량`}
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.uid, (quantities[item.uid] || 0) + 1)}
                        className="px-2 py-1 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        aria-label="증가"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
