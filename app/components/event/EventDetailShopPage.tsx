import { useFetcher } from "react-router";
import { SetStateAction, Dispatch, useMemo, useState, useEffect, useCallback, memo, useRef } from "react";
import Decimal from "decimal.js";
import { BoltIcon, ExclamationCircleIcon, UserIcon, ArrowPathIcon } from "@heroicons/react/16/solid";
import { ResourceTypeEnum } from "~/graphql/graphql";
import { sanitizeClassName } from "~/prophandlers";
import { ResourceCard } from "~/components/atoms/item";
import { SubTitle } from "~/components/atoms/typography";
import { Button, NumberInput, Toggle } from "~/components/atoms/form";
import EventInfoCard from "./EventInfoCard";
import { StudentCards } from "~/components/molecules/student";
import { useSignIn } from "~/contexts/SignInProvider";
import type { EventShopState } from "~/models/event-shop-state";
import EventItemBonus from "./EventItemBonus";

type EventDetailShopPageProps = {
  stages: {
    uid: string;
    name: string;
    entryAp: number;
    index: string;
    difficulty: number;
    rewards: {
      amount: number;
      rewardRequirement: string | null;
      chance: string | null;
      item: {
        uid: string;
        name: string;
        category: string;
        rarity: number;
      } | null;
    }[];
  }[];

  shopResources: {
    uid: string;
    resource: {
      type: ResourceTypeEnum;
      uid: string;
      name: string;
      rarity: number;
    };
    resourceAmount: number;
    paymentResource: {
      uid: string;
      name: string;
    };
    paymentResourceAmount: number;
    shopAmount: number | null;
  }[];

  eventRewardBonus: {
    uid: string;
    name: string;
    rewardBonuses: {
      student: {
        uid: string;
        role: string;
      };
      ratio: string;  // decimal string
    }[];
  }[];

  recruitedStudentUids: string[];
  eventUid: string;
  savedShopState: EventShopState | null;
  signedIn: boolean;
};

export default function EventDetailShopPage({ stages, shopResources, eventRewardBonus, recruitedStudentUids, eventUid, savedShopState, signedIn }: EventDetailShopPageProps) {
  const collectableResources = useMemo(() => {
    const items: { uid: string; name: string, forPayment: boolean }[] = [];
    shopResources.forEach(({ paymentResource }) => {
      if (!items.some(({ uid }) => uid === paymentResource.uid)) {
        items.push({ uid: paymentResource.uid, name: paymentResource.name, forPayment: true });
      }
    });

    stages.forEach((stage) => {
      stage.rewards.forEach(({ item }) => {
        if (item && item.category === "coin" && !items.some(({ uid }) => uid === item.uid)) {
          items.push({ uid: item.uid, name: item.name, forPayment: false });
        }
      });
    });

    return items.sort((a, b) => a.uid.localeCompare(b.uid));
  }, [stages, shopResources]);

  const { showSignIn } = useSignIn();

  const fetcher = useFetcher();
  const saveIntervalRef = useRef<NodeJS.Timeout>();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const lastSavedStateRef = useRef<EventShopState | null>(null);

  // Initialize state from saved state or defaults
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    savedShopState?.itemQuantities ?? {}
  );
  const [selectedBonusStudentUids, setSelectedBonusStudentUids] = useState<string[]>(
    savedShopState?.selectedBonusStudentUids ?? recruitedStudentUids
  );
  const [includeRecruitedStudents, setIncludeRecruitedStudents] = useState<boolean>(
    savedShopState?.includeRecruitedStudents ?? true
  );
  const [enabledStages, setEnabledStages] = useState<Record<string, boolean>>(
    savedShopState?.enabledStages ?? stages.reduce((acc, stage) => ({ ...acc, [stage.uid]: parseInt(stage.index) >= 9 }), {})
  );
  const [existingPaymentItemQuantities, setExistingPaymentItemQuantities] = useState<Record<string, number>>(
    savedShopState?.existingPaymentItemQuantities ?? {}
  );
  const [includeFirstClear, setIncludeFirstClear] = useState<boolean>(
    savedShopState?.includeFirstClear ?? true
  );
  const [extraStageRuns, setExtraStageRuns] = useState<Record<string, number>>(
    savedShopState?.extraStageRuns ?? {}
  );

  const [appliedBonusRatio, setAppliedBonusRatio] = useState<Record<string, Decimal>>({});

  // Initialize lastSavedStateRef on mount with the initial saved state
  useEffect(() => {
    if (savedShopState && lastSavedStateRef.current === null) {
      lastSavedStateRef.current = savedShopState;
      setIsInitialLoad(false);
    } else if (!savedShopState) {
      // No saved state - mark initialization as complete after a brief delay
      // This ensures state is fully initialized before starting auto-save
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []); // Only run on mount

  // Prevent re-render from revalidation: ignore savedShopState changes if they match what we last saved
  const prevSavedShopStateRef = useRef(savedShopState);
  useEffect(() => {
    if (savedShopState && savedShopState !== prevSavedShopStateRef.current) {
      const newState = savedShopState;
      prevSavedShopStateRef.current = newState;

      // Only update state if it matches what we last saved (confirmation from server)
      // or if we haven't saved anything yet (initial load)
      // This prevents re-render from revalidation when we save
      if (lastSavedStateRef.current === null) {
        // Initial load - apply saved state
        setItemQuantities(newState.itemQuantities);
        setSelectedBonusStudentUids(newState.selectedBonusStudentUids);
        setIncludeRecruitedStudents(newState.includeRecruitedStudents);
        setEnabledStages(newState.enabledStages);
        setExistingPaymentItemQuantities(newState.existingPaymentItemQuantities || {});
        setIncludeFirstClear(newState.includeFirstClear ?? true);
        setExtraStageRuns(newState.extraStageRuns || {});
        lastSavedStateRef.current = newState;
        setIsInitialLoad(false);
      } else {
        // Check if this matches what we last saved
        const stateMatches = JSON.stringify(lastSavedStateRef.current) === JSON.stringify(newState);
        if (stateMatches) {
          // This is a revalidation from our own save - ignore it to prevent re-render
          // Update the ref to the new state object reference
          lastSavedStateRef.current = newState;
        }
        // If it doesn't match, user might have changed data in another tab/session
        // But we don't apply it to avoid overwriting current user's changes
      }
    } else if (!savedShopState) {
      prevSavedShopStateRef.current = null;
      lastSavedStateRef.current = null;
    }
  }, [savedShopState]);

  // Periodic save check: every 3 seconds, check if state changed and save if needed
  useEffect(() => {
    if (!signedIn || isInitialLoad) {
      return;
    }

    // Clear any existing interval
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
    }

    // Set up interval to check for changes every 3 seconds
    saveIntervalRef.current = setInterval(() => {
      // Build current state
      const currentState: EventShopState = {
        itemQuantities,
        selectedBonusStudentUids,
        enabledStages,
        includeRecruitedStudents,
        existingPaymentItemQuantities,
        includeFirstClear,
        extraStageRuns,
      };

      // Check if state has changed compared to what we last saved
      const hasChanged = lastSavedStateRef.current === null ||
        JSON.stringify(lastSavedStateRef.current) !== JSON.stringify(currentState);

      // Only save if there are changes and we're not already saving
      if (hasChanged && fetcher.state === "idle") {
        // Track what we're saving
        lastSavedStateRef.current = currentState;

        // Submit the save
        fetcher.submit(
          { save: currentState },
          { method: "post", action: `/api/events/${eventUid}/shop-state`, encType: "application/json" }
        );
      }
    }, 1500);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [itemQuantities, selectedBonusStudentUids, enabledStages, includeRecruitedStudents, existingPaymentItemQuantities, includeFirstClear, extraStageRuns, signedIn, eventUid, fetcher, isInitialLoad]);

  const paymentItemQuantities = useMemo(() => {
    const quantities: Record<string, number> = {};
    collectableResources.forEach(({ uid, forPayment }) => {
      if (!forPayment) {
        return;
      }

      const required = shopResources.reduce((total, { uid: shopResourceUid, paymentResourceAmount, paymentResource }) => {
        if (paymentResource.uid !== uid) {
          return total;
        }
        return total + ((itemQuantities[shopResourceUid] || 0) * paymentResourceAmount);
      }, 0);
      const existing = existingPaymentItemQuantities[uid] || 0;
      quantities[uid] = Math.max(0, required - existing);
    });
    return quantities;
  }, [collectableResources, itemQuantities, shopResources, existingPaymentItemQuantities]);

  const isSaving = fetcher.state === "submitting" || fetcher.state === "loading";

  return (
    <>
      {/* Saving indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-8 z-50 flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg shadow-lg">
          <ArrowPathIcon className="size-4 animate-spin" />
          <span className="text-sm font-medium">저장중...</span>
        </div>
      )}

      <div className="my-8">
        <EventInfoCard
          Icon={ExclamationCircleIcon}
          title="데이터가 부정확할 수 있어요"
          description="오류가 있거나 일본 서비스와 차이가 있을 수 있으니 참고용으로만 사용해주세요"
        />
        {!signedIn && (
          <EventInfoCard
            Icon={UserIcon}
            title="로그인 후 더 많은 기능을 이용할 수 있어요"
            description="모집 학생 데이터가 자동으로 반영되며, 입력한 정보를 저장하고 언제든지 불러올 수 있어요"
            onClick={showSignIn}
            showArrow
          />
        )}
      </div>

      <StudentBonusSelector
        eventRewardBonus={eventRewardBonus}
        recruitedStudentUids={recruitedStudentUids}
        selectedBonusStudentUids={selectedBonusStudentUids}
        setSelectedBonusStudentUids={setSelectedBonusStudentUids}
        setAppliedBonusRatio={setAppliedBonusRatio}
        includeRecruitedStudents={includeRecruitedStudents}
        setIncludeRecruitedStudents={setIncludeRecruitedStudents}
        signedIn={signedIn}
      />

      {collectableResources && (
        <ShopResourceSelector
          shopResources={shopResources}
          collectableResources={collectableResources}
          itemQuantities={itemQuantities}
          setItemQuantities={setItemQuantities}
          paymentItemQuantities={paymentItemQuantities}
          existingPaymentItemQuantities={existingPaymentItemQuantities}
          setExistingPaymentItemQuantities={setExistingPaymentItemQuantities}
        />
      )}

      <Stages
        stages={stages}
        appliedBonusRatio={appliedBonusRatio}
        paymentItemQuantities={paymentItemQuantities}
        enabledStages={enabledStages}
        setEnabledStages={setEnabledStages}
        includeFirstClear={includeFirstClear}
        setIncludeFirstClear={setIncludeFirstClear}
        extraStageRuns={extraStageRuns}
        setExtraStageRuns={setExtraStageRuns}
        existingPaymentItemQuantities={existingPaymentItemQuantities}
      />
    </>
  );
}

type StudentBonusSelectorProps = {
  eventRewardBonus: EventDetailShopPageProps["eventRewardBonus"];
  recruitedStudentUids: string[];
  selectedBonusStudentUids: string[];
  setSelectedBonusStudentUids: Dispatch<SetStateAction<string[]>>;
  setAppliedBonusRatio: Dispatch<SetStateAction<Record<string, Decimal>>>;
  includeRecruitedStudents: boolean;
  setIncludeRecruitedStudents: Dispatch<SetStateAction<boolean>>;
  signedIn: boolean;
};

const StudentBonusSelector = memo(function StudentBonusSelector({
  eventRewardBonus, recruitedStudentUids, selectedBonusStudentUids, setSelectedBonusStudentUids, setAppliedBonusRatio,
  includeRecruitedStudents, setIncludeRecruitedStudents, signedIn,
}: StudentBonusSelectorProps) {
  const eventBonusStudentUids = useMemo(() => {
    return [...new Set(eventRewardBonus.flatMap(({ rewardBonuses }) => rewardBonuses.map(({ student }) => student.uid)))];
  }, [eventRewardBonus]);

  const handleSelectBonusStudent = useCallback((studentUid: string) => {
    setSelectedBonusStudentUids((prev) => {
      if (prev.includes(studentUid)) {
        return prev.filter((uid) => uid !== studentUid);
      }
      return [...prev, studentUid];
    });
  }, [setSelectedBonusStudentUids]);

  const appliedEventRewardBonus = useMemo(() => {
    return eventRewardBonus.map(({ uid, rewardBonuses }) => {
      let appliedStrikerRatio = new Decimal(0), appliedStrikerCount = 0, maxStrikerRatio = new Decimal(0), maxStrikerCount = 0;
      let appliedSpecialRatio = new Decimal(0), appliedSpecialCount = 0, maxSpecialRatio = new Decimal(0), maxSpecialCount = 0;
      const sortedRewardBonuses = [...rewardBonuses].sort((a, b) => Number(b.ratio) - Number(a.ratio));
      if (sortedRewardBonuses.length === 0 || Number(sortedRewardBonuses[0].ratio) === 0) {
        return null;
      }

      sortedRewardBonuses.forEach(({ student, ratio }) => {
        const selected = selectedBonusStudentUids.includes(student.uid);
        if (student.role === "striker") {
          if (maxStrikerCount < 4) {
            maxStrikerRatio = maxStrikerRatio.plus(ratio);
            maxStrikerCount += 1;
          }
          if (selected && appliedStrikerCount < 4) {
            appliedStrikerRatio = appliedStrikerRatio.plus(ratio);
            appliedStrikerCount += 1;
          }
        } else if (student.role === "special") {
          if (maxSpecialCount < 2) {
            maxSpecialRatio = maxSpecialRatio.plus(ratio);
            maxSpecialCount += 1;
          }
          if (selected && appliedSpecialCount < 2) {
            appliedSpecialRatio = appliedSpecialRatio.plus(ratio);
            appliedSpecialCount += 1;
          }
        }

        if (appliedStrikerCount === 4 && appliedSpecialCount === 2) {
          return;
        }
      });

      return { uid, appliedStrikerRatio, appliedSpecialRatio, maxStrikerRatio, maxSpecialRatio }
    }).filter((bonus) => bonus !== null);
  }, [eventRewardBonus, selectedBonusStudentUids]);

  // Update applied bonus ratio state when calculated values change
  useEffect(() => {
    const bonusRatios: Record<string, Decimal> = {};
    appliedEventRewardBonus.forEach(({ uid, appliedStrikerRatio, appliedSpecialRatio }) => {
      bonusRatios[uid] = appliedStrikerRatio.plus(appliedSpecialRatio);
    });
    
    setAppliedBonusRatio((prev) => {
      const hasChanges = Object.keys(bonusRatios).some(
        (uid) => !prev[uid] || !prev[uid].eq(bonusRatios[uid])
      );
      return hasChanges ? { ...prev, ...bonusRatios } : prev;
    });
  }, [appliedEventRewardBonus]);

  const studentCardsData = useMemo(() => {
    return eventBonusStudentUids.map((uid) => {
      const selected = selectedBonusStudentUids.includes(uid);
      return {
        uid,
        grayscale: !selected,
        checked: selected,
        label: recruitedStudentUids.includes(uid) ? <span className="text-white font-normal">모집</span> : undefined,
      };
    });
  }, [eventBonusStudentUids, selectedBonusStudentUids, recruitedStudentUids]);

  const handleToggleRecruitedStudents = useCallback((value: boolean) => {
    setIncludeRecruitedStudents(value);
    if (value) {
      setSelectedBonusStudentUids((prev) => [...new Set([...prev, ...recruitedStudentUids])]);
    } else {
      setSelectedBonusStudentUids((prev) => prev.filter((uid) => !recruitedStudentUids.includes(uid)));
    }
  }, [recruitedStudentUids, setSelectedBonusStudentUids]);

  const handleSelectAll = useCallback(() => {
    setSelectedBonusStudentUids(eventBonusStudentUids);
  }, [eventBonusStudentUids, setSelectedBonusStudentUids]);

  const handleResetAll = useCallback(() => {
    setSelectedBonusStudentUids(includeRecruitedStudents ? recruitedStudentUids : []);
  }, [includeRecruitedStudents, recruitedStudentUids, setSelectedBonusStudentUids]);

  const [tab, setTab] = useState<"student" | "item">("student");

  return (
    <div>
      <SubTitle
        text="학생 보너스"
        description={recruitedStudentUids.length === 0 ? "로그인 후 모집한 학생 정보를 등록하면 편리하게 이용할 수 있어요" : "편성 보너스를 적용할 학생을 선택하세요"}
      />
      <Toggle
        label="모집한 학생 일괄 반영"
        disabled={!signedIn}
        initialState={signedIn ? includeRecruitedStudents : false}
        onChange={handleToggleRecruitedStudents}
      />

      <Tabs
        tabs={[{ tabId: "student", name: "학생별" }, { tabId: "item", name: "아이템별" }]}
        activeTabId={tab}
        setActiveTabId={(value) => setTab(value as "student" | "item")}
      />
      {tab === "student" && (
        <>
          <StudentCards mobileGrid={8} pcGrid={12} students={studentCardsData} onSelect={handleSelectBonusStudent} />
          <div className="my-4 p-3 w-full border border-neutral-200 dark:border-neutral-700 rounded-lg grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {appliedEventRewardBonus.map(({ uid, appliedStrikerRatio, appliedSpecialRatio, maxStrikerRatio, maxSpecialRatio }) => {
              return (
                <div key={uid} className="flex flex-row items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <ResourceCard itemUid={uid} resourceType={ResourceTypeEnum.Item} rarity={1} />
                  <div>
                    <p>적용 : {appliedStrikerRatio.plus(appliedSpecialRatio).mul(100).toFixed(0)}%</p>
                    <p>최대 : {maxStrikerRatio.plus(maxSpecialRatio).mul(100).toFixed(0)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {tab === "item" && (
        <>
          {eventRewardBonus.filter(({ rewardBonuses }) => rewardBonuses.length > 0).map(({ uid, name, rewardBonuses }) => {
            const appliedItemBonus = appliedEventRewardBonus.find(({ uid: appliedUid }) => appliedUid === uid);
            const appliedRatio = appliedItemBonus?.appliedStrikerRatio.plus(appliedItemBonus?.appliedSpecialRatio) ?? new Decimal(0);
            const maxRatio = appliedItemBonus?.maxStrikerRatio.plus(appliedItemBonus?.maxSpecialRatio) ?? new Decimal(0);
            return (
              <EventItemBonus
                key={uid}
                itemUid={uid}
                itemName={name}
                appliedRatio={appliedRatio}
                maxRatio={maxRatio}
                rewardBonuses={rewardBonuses}
                selectedBonusStudentUids={selectedBonusStudentUids}
                setSelectedBonusStudentUid={handleSelectBonusStudent}
                signedIn={signedIn}
              />
            );
          })}
        </>
      )}

      <div className="my-4 flex justify-end gap-0.5">
        <Button text="모두 선택" color="primary" onClick={handleSelectAll} />
        <Button text="초기화" onClick={handleResetAll} />
      </div>
    </div>
  );
});

type ShopResourceSelectorProps = {
  shopResources: EventDetailShopPageProps["shopResources"];
  collectableResources: {
    uid: string;
    name: string;
    forPayment: boolean;
  }[];

  itemQuantities: Record<string, number>;
  setItemQuantities: Dispatch<SetStateAction<Record<string, number>>>;
  paymentItemQuantities: Record<string, number>;
  existingPaymentItemQuantities: Record<string, number>;
  setExistingPaymentItemQuantities: Dispatch<SetStateAction<Record<string, number>>>;
};

const ShopResourceSelector = memo(function ShopResourceSelector({
  shopResources, collectableResources, itemQuantities, setItemQuantities, paymentItemQuantities,
  existingPaymentItemQuantities, setExistingPaymentItemQuantities,
}: ShopResourceSelectorProps) {
  const [selectedPaymentResourceUid, setSelectedPaymentResourceUid] = useState<string>(collectableResources.find(({ forPayment }) => forPayment)?.uid ?? "");
  const selectedShopResources = useMemo(() => {
    return shopResources.filter(({ paymentResource }) => paymentResource.uid === selectedPaymentResourceUid);
  }, [shopResources, selectedPaymentResourceUid]);

  const handleSetMinQuantity = useCallback((uid: string) => {
    setItemQuantities(prev => ({ ...prev, [uid]: 0 }));
  }, [setItemQuantities]);

  const handleSetMaxQuantity = useCallback((uid: string, shopAmount: number | null) => {
    if (shopAmount) {
      setItemQuantities(prev => ({ ...prev, [uid]: shopAmount }));
    }
  }, [setItemQuantities]);

  const handleQuantityChange = useCallback((uid: string, value: number) => {
    setItemQuantities(prev => ({ ...prev, [uid]: value }));
  }, [setItemQuantities]);

  const handleSelectAll = useCallback(() => {
    setItemQuantities((prev) => {
      const newQuantities = { ...prev };
      selectedShopResources.forEach(({ uid, shopAmount }) => {
        if (shopAmount !== null) {
          newQuantities[uid] = shopAmount;
        }
      });
      return newQuantities;
    });
  }, [selectedShopResources, setItemQuantities]);

  const handleResetAll = useCallback(() => {
    setItemQuantities((prev) => {
      const newQuantities = { ...prev };
      selectedShopResources.forEach(({ uid }) => {
        newQuantities[uid] = 0;
      });
      return newQuantities;
    });
  }, [selectedShopResources, setItemQuantities]);

  return (
    <>
      <SubTitle text="상점 아이템" description="구매할 아이템의 개수를 선택하세요" />
      <Tabs
        tabs={collectableResources.filter(({ forPayment }) => forPayment).map(({ uid, name }) => ({ tabId: uid, name, imageUrl: `https://baql-assets.mollulog.net/images/items/${uid}` }))}
        activeTabId={selectedPaymentResourceUid}
        setActiveTabId={setSelectedPaymentResourceUid}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-2">
        {selectedShopResources.map(({ uid, resource, resourceAmount, paymentResource, paymentResourceAmount, shopAmount }) => {
          const quantity = itemQuantities[uid] || 0;
          return (
            <div key={uid} className="px-2 py-3 flex flex-col gap-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
              <div className="flex items-center justify-center gap-x-1">
                <ResourceCard itemUid={resource.uid} resourceType={resource.type} rarity={resource.rarity} label={resourceAmount > 1 ? resourceAmount : undefined} />
                <div className="grow">
                  <div className="flex items-center justify-center gap-1">
                    <img
                      alt={resource.name}
                      src={`https://baql-assets.mollulog.net/images/items/${paymentResource.uid}`}
                      className="-m-1 size-6 md:size-8 object-contain"
                      loading="lazy"
                    />
                    <span className="mr-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {paymentResourceAmount}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                    {shopAmount ? `${shopAmount}회 구매 가능` : "구매 제한 없음"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSetMinQuantity(uid)}
                  disabled={quantity === 0}
                  className="shrink-0 h-full px-1.5 text-xs bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded transition-colors disabled:bg-neutral-300 dark:disabled:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  최소
                </button>
                <div className="grow">
                  <NumberInput value={quantity} maxValue={shopAmount ?? undefined} onChange={(value) => handleQuantityChange(uid, value)} />
                </div>
                {shopAmount && (
                  <button
                    onClick={() => handleSetMaxQuantity(uid, shopAmount)}
                    disabled={quantity >= shopAmount}
                    className="shrink-0 h-full px-1.5 text-xs bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded transition-colors disabled:bg-neutral-300 dark:disabled:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    최대
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="my-2 flex justify-end gap-0.5">
        <Button text="모두 선택" color="primary" onClick={handleSelectAll} />
        <Button text="초기화" onClick={handleResetAll} />
      </div>

      <div className="my-4">
        <div className="p-3 w-full border border-neutral-200 dark:border-neutral-700 rounded-lg grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {collectableResources.map(({ uid }) => {
            const existing = existingPaymentItemQuantities[uid] || 0;
            const required = paymentItemQuantities[uid] || 0;
            return (
              <div key={uid} className="flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                  <ResourceCard itemUid={uid} resourceType={ResourceTypeEnum.Item} rarity={1} />
                  <div className="grow">
                    <p className="mb-2 text-xs text-center text-neutral-600 dark:text-neutral-400">이미 보유한 수량</p>
                    <NumberInput
                      value={existing}
                      onChange={(value) => setExistingPaymentItemQuantities(prev => ({ ...prev, [uid]: value }))}
                    />
                    <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
                      {required.toLocaleString()} 개 필요
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
});

type StagesProps = {
  stages: EventDetailShopPageProps["stages"];
  appliedBonusRatio: Record<string, Decimal>;
  paymentItemQuantities: Record<string, number>;
  enabledStages: Record<string, boolean>;
  setEnabledStages: Dispatch<SetStateAction<Record<string, boolean>>>;
  includeFirstClear: boolean;
  setIncludeFirstClear: Dispatch<SetStateAction<boolean>>;
  extraStageRuns: Record<string, number>;
  setExtraStageRuns: Dispatch<SetStateAction<Record<string, number>>>;
  existingPaymentItemQuantities: Record<string, number>;
}

const Stages = memo(function Stages({ 
  stages, appliedBonusRatio,  paymentItemQuantities,  enabledStages,  setEnabledStages, includeFirstClear, setIncludeFirstClear, extraStageRuns, setExtraStageRuns, existingPaymentItemQuantities,
}: StagesProps) {
  const toggleStage = useCallback((stageUid: string, enabled: boolean) => {
    setEnabledStages(prev => ({
      ...prev,
      [stageUid]: enabled
    }));
  }, [setEnabledStages]);

  const handleExtraRunsChange = useCallback((stageUid: string, value: number) => {
    setExtraStageRuns(prev => ({ ...prev, [stageUid]: value }));
  }, [setExtraStageRuns]);

  // Calculate adjusted payment item quantities by subtracting first_clear rewards
  const paymentItemQuantitiesWithFirstclear = useMemo(() => {
    const adjusted: Record<string, number> = { ...paymentItemQuantities };
    if (includeFirstClear) {
      // Calculate total first_clear rewards for all stages (first clear is one-time, regardless of enabled status)
      const firstClearRewards: Record<string, number> = {};
      stages.forEach((stage) => {
        stage.rewards.forEach(({ item, amount, rewardRequirement }) => {
          if (!item || item.category !== "coin") {
            return;
          }
          if (rewardRequirement === "first_clear") {
            firstClearRewards[item.uid] = (firstClearRewards[item.uid] || 0) + amount;
          } else if (stage.difficulty === 0) {  // story
            firstClearRewards[item.uid] = (firstClearRewards[item.uid] || 0) + amount;
          }
        });
      });

      // Subtract first_clear rewards from payment item quantities
      Object.entries(firstClearRewards).forEach(([itemUid, amount]) => {
        if (adjusted[itemUid] !== undefined) {
          adjusted[itemUid] = Math.max(0, (adjusted[itemUid] || 0) - amount);
        }
      });
    }

    return adjusted;
  }, [paymentItemQuantities, includeFirstClear, stages]);

  // Calculate stage runs, collected totals, and total AP in a single pass
  const stageCalculations = useMemo(() => {
    // Build a global clear plan that minimizes AP to satisfy all required payment items
    const targets = Object.entries(paymentItemQuantitiesWithFirstclear).filter(([, qty]) => (qty || 0) > 0);

    // Stage reward map per run for target items
    const stageInfos = stages.filter(stage => enabledStages[stage.uid]).map((stage) => {
      const rewardPerItem: Record<string, Decimal> = {};
      stage.rewards.forEach(({ item, rewardRequirement, amount }) => {
        if (!item || item.category !== "coin" || rewardRequirement !== null) {
          return;
        }
        const bonusRatio = appliedBonusRatio[item.uid] ?? new Decimal(0);
        const perClear = new Decimal(amount).plus(bonusRatio.mul(amount).ceil());
        if (perClear.gt(0)) {
          rewardPerItem[item.uid] = perClear;
        }
      });
      const contributes = targets.length > 0 && targets.some(([uid]) => rewardPerItem[uid]?.gt(0));
      return {
        uid: stage.uid,
        name: stage.name,
        index: stage.index,
        entryAp: new Decimal(stage.entryAp),
        rewardPerItem,
        contributes,
      };
    });

    const stageRuns: Record<string, number> = {};
    let totalAp = new Decimal(0);

    // Calculate optimal stage runs if there are targets
    if (targets.length > 0) {
      const contributingStages = stageInfos.filter((s) => s.contributes);
      if (contributingStages.length > 0) {
        // Remaining requirements
        const remaining: Record<string, Decimal> = {};
        targets.forEach(([uid, qty]) => { remaining[uid] = new Decimal(qty); });

        let iterationCount = 0;
        const maxIterations = 10000;

        const anyRemaining = () => Object.values(remaining).some((v) => v.gt(0));

        while (anyRemaining() && iterationCount < maxIterations) {
          iterationCount += 1;
          // Score stages by how much they reduce remaining per AP
          let best = null as null | typeof stageInfos[number];
          let bestScore = new Decimal(0);

          for (const s of contributingStages) {
            // Sum limited by remaining needs
            let gain = new Decimal(0);
            for (const [uid] of targets) {
              const r = s.rewardPerItem[uid];
              if (r && r.gt(0) && remaining[uid].gt(0)) {
                gain = gain.plus(Decimal.min(remaining[uid], r));
              }
            }
            const score = gain.div(s.entryAp);
            if (score.gt(bestScore)) {
              bestScore = score;
              best = s;
            }
          }

          if (!best || bestScore.lte(0)) {
            break; // cannot progress further
          }

          // Apply one run of the best stage
          stageRuns[best.uid] = (stageRuns[best.uid] || 0) + 1;
          totalAp = totalAp.plus(best.entryAp);
          for (const [uid] of targets) {
            const r = best.rewardPerItem[uid];
            if (r && r.gt(0) && remaining[uid].gt(0)) {
              remaining[uid] = Decimal.max(0, remaining[uid].minus(r));
            }
          }
        }
      }
    }

    // Calculate item breakdowns: from first run, from repeated runs, to buy shop items, and remaining
    const fromFirstRun: Record<string, number> = {};
    const fromRepeatedRuns: Record<string, number> = {};
    const toBuyShopItems: Record<string, number> = {};
    let extraAp = 0;
    let firstClearAp = 0;

    // Calculate first_clear rewards for all stages (first clear is one-time, regardless of enabled status)
    if (includeFirstClear) {
      stages.forEach((stage) => {
        let hasFirstClearReward = false;
        stage.rewards.forEach(({ item, rewardRequirement, amount }) => {
          if (!item || item.category !== "coin") {
            return;
          }
          if (rewardRequirement === "first_clear") {
            fromFirstRun[item.uid] = (fromFirstRun[item.uid] || 0) + amount;
            hasFirstClearReward = true;
          } else if (stage.difficulty === 0) {  // story
            fromFirstRun[item.uid] = (fromFirstRun[item.uid] || 0) + amount;
          }
        });

        // Check if stage has any first_clear rewards (not just coin rewards)
        if (!hasFirstClearReward) {
          hasFirstClearReward = stage.rewards.some(({ rewardRequirement }) => rewardRequirement === "first_clear");
        }
        if (stage.difficulty === 0 || hasFirstClearReward) {
          firstClearAp += stage.entryAp;
        }
      });
    }

    // Calculate items from repeated stage runs (calculated + extra runs)
    stages.forEach((stage) => {
      if (!enabledStages[stage.uid]) {
        return;
      }

      const calculatedRuns = stageRuns[stage.uid] || 0;
      const extraRuns = extraStageRuns[stage.uid] || 0;
      const totalRuns = calculatedRuns + extraRuns;
      // Calculate extra AP
      if (extraRuns > 0) {
        extraAp += extraRuns * stage.entryAp;
      }

      // Calculate items from repeated runs (excluding first_clear)
      if (totalRuns > 0) {
        stage.rewards.forEach(({ item, rewardRequirement, amount }) => {
          if (!item || item.category !== "coin" || rewardRequirement !== null) {
            return;
          }

          const bonusRatio = appliedBonusRatio[item.uid] ?? new Decimal(0);
          // Base amount + bonus amount (merged)
          const perRunAmount = new Decimal(amount).plus(bonusRatio.mul(amount).ceil());
          const totalAmount = perRunAmount.mul(totalRuns).toNumber();
          fromRepeatedRuns[item.uid] = (fromRepeatedRuns[item.uid] || 0) + totalAmount;
        });
      }
    });

    // Calculate total collected (first run + repeated runs)
    const totalCollected: Record<string, number> = {};
    const allItemUids = new Set([...Object.keys(fromFirstRun), ...Object.keys(fromRepeatedRuns)]);
    allItemUids.forEach((itemUid) => {
      totalCollected[itemUid] = (fromFirstRun[itemUid] || 0) + (fromRepeatedRuns[itemUid] || 0);
    });

    // Calculate items to buy shop items and remaining items
    const remaining: Record<string, number> = {};
    Object.entries(paymentItemQuantities).forEach(([paymentUid, required]) => {
      if ((required || 0) <= 0) return;
      toBuyShopItems[paymentUid] = required;
      const current = totalCollected[paymentUid] || 0;
      const remainingAmount = Math.max(0, current - required);
      if (remainingAmount > 0) {
        remaining[paymentUid] = remainingAmount;
      }
    });

    // Add remaining items that are not payment items
    Object.entries(totalCollected).forEach(([itemUid, amount]) => {
      if (!paymentItemQuantities[itemUid] || (paymentItemQuantities[itemUid] || 0) <= 0) {
        remaining[itemUid] = amount;
      }
    });

    return {
      stageRuns,
      totalAp: totalAp.toNumber(),
      firstClearAp,
      questSweepAp: totalAp.toNumber(),
      extraSweepAp: extraAp,
      collectedTotals: remaining,
      totalApWithExtras: firstClearAp + totalAp.toNumber() + extraAp,
      itemBreakdown: {
        fromFirstRun,
        fromRepeatedRuns,
        toBuyShopItems,
        remaining,
      },
    };
  }, [stages, appliedBonusRatio, paymentItemQuantitiesWithFirstclear, enabledStages, extraStageRuns, paymentItemQuantities, includeFirstClear]);

  return (
    <>
      <SubTitle text="스테이지 소탕 계획" description="소탕할 스테이지를 선택하고 최적화된 소탕 계획을 세워보세요" />

      <Toggle label="스토리/퀘스트 1회 씩 클리어 (초회 보상 반영)" initialState={includeFirstClear} onChange={setIncludeFirstClear} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {stages.filter(({ difficulty }) => difficulty === 1).map((stage) => (
          <StageCard
            key={stage.uid}
            stage={stage}
            isEnabled={!!enabledStages[stage.uid]}
            calculatedRuns={stageCalculations.stageRuns[stage.uid] || 0}
            extraRuns={extraStageRuns[stage.uid] || 0}
            appliedBonusRatio={appliedBonusRatio}
            onToggleStage={toggleStage}
            onChangeExtraRuns={handleExtraRunsChange}
          />
        ))}
      </div>

      {Object.values(paymentItemQuantities).some((qty) => (qty || 0) > 0) && (
        <div className="my-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-teal-950 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-green-200 dark:border-green-800">
            <h3 className="text-base font-semibold text-green-800 dark:text-green-200">필요한 AP</h3>
            <span className="text-xl font-bold text-green-700 dark:text-green-300">{stageCalculations.totalApWithExtras.toLocaleString()}</span>
          </div>
          <div className="space-y-1.5">
            {stageCalculations.firstClearAp > 0 && (
              <div className="flex justify-between text-sm text-green-700 dark:text-green-300">
                <span>스토리/퀘스트 초회</span>
                <span>{stageCalculations.firstClearAp.toLocaleString()}</span>
              </div>
            )}
            {stageCalculations.questSweepAp > 0 && (
              <div className="flex justify-between text-sm text-green-700 dark:text-green-300">
                <span>퀘스트 소탕</span>
                <span>{stageCalculations.questSweepAp.toLocaleString()}</span>
              </div>
            )}
            {stageCalculations.extraSweepAp > 0 && (
              <div className="flex justify-between text-sm text-green-700 dark:text-green-300">
                <span>추가 소탕</span>
                <span>{stageCalculations.extraSweepAp.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <CollectedTotalsSection breakdown={stageCalculations.itemBreakdown} existingPaymentItemQuantities={existingPaymentItemQuantities} />
    </>
  );
});


type StageCardProps = {
  stage: EventDetailShopPageProps["stages"][number];
  isEnabled: boolean;
  calculatedRuns: number;
  extraRuns: number;
  appliedBonusRatio: Record<string, Decimal>;
  onToggleStage: (uid: string, enabled: boolean) => void;
  onChangeExtraRuns: (uid: string, value: number) => void;
};

const StageCard = memo(function StageCard({ stage, isEnabled, calculatedRuns, extraRuns, appliedBonusRatio, onToggleStage, onChangeExtraRuns }: StageCardProps) {
  const { uid, name, entryAp, index, rewards } = stage;
  const coinRewards = rewards.filter(({ item, rewardRequirement }) => item?.category === "coin" && rewardRequirement === null);

  return (
    <div className="relative px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-2">
        <div className="shrink-0 size-6 border border-neutral-200 dark:border-neutral-700 rounded flex items-center justify-center text-sm">
          {index}
        </div>
        <div className="grow">
          <p className="text-sm font-medium line-clamp-1">{name}</p>
          <div className="my-0.5 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 border border-green-600 text-green-600 text-xs font-medium px-1 rounded">
              <BoltIcon className="size-2.5" />
              <span>{entryAp}</span>
            </div>
            {calculatedRuns > 0 && (
              <span className="border border-blue-500 dark:border-blue-600 bg-blue-500 dark:bg-blue-600 text-white text-xs px-1.5 rounded">
                {calculatedRuns.toLocaleString()}회 소탕
              </span>
            )}
          </div>
        </div>
        <div className="-my-4 -mr-2">
          <Toggle initialState={isEnabled} onChange={(value) => onToggleStage(uid, value)} />
        </div>
      </div>

      {isEnabled && (
        <div className="mt-3 flex items-center gap-2">
          <label className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap">추가 소탕</label>
          <div className="grow">
            <NumberInput value={extraRuns} onChange={(value) => onChangeExtraRuns(uid, value)} />
          </div>
        </div>
      )}

      {coinRewards.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-1">
            {coinRewards.map(({ amount, item }, idx) => {
              if (!item || amount === 0) {
                return null;
              }
              return (
                <ResourceCard key={`${item.uid}-${idx}`} itemUid={item.uid} resourceType={ResourceTypeEnum.Item} label={amount} />
              );
            })}
            {coinRewards.map(({ amount, item }, idx) => {
              if (!item || amount === 0 || appliedBonusRatio[item.uid]?.eq(0)) {
                return null;
              }
              const bonusRatio = appliedBonusRatio[item.uid] ?? new Decimal(0);
              const amountLabel = bonusRatio.mul(amount).ceil().toString();
              return (
                <ResourceCard key={`${item.uid}-${idx}-bonus`} itemUid={item.uid} resourceType={ResourceTypeEnum.Item} label={amountLabel} labelColor="yellow" />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

type CollectedTotalsSectionProps = {
  breakdown: {
    fromFirstRun: Record<string, number>;
    fromRepeatedRuns: Record<string, number>;
    toBuyShopItems: Record<string, number>;
    remaining: Record<string, number>;
  };
  existingPaymentItemQuantities: Record<string, number>;
};

const CollectedTotalsSection = memo(function CollectedTotalsSection({ breakdown, existingPaymentItemQuantities }: CollectedTotalsSectionProps) {
  const { fromFirstRun, fromRepeatedRuns, toBuyShopItems, remaining } = breakdown;

  // Get all unique item UIDs from all categories
  const allItemUids = new Set([
    ...Object.keys(fromFirstRun),
    ...Object.keys(fromRepeatedRuns),
    ...Object.keys(toBuyShopItems),
    ...Object.keys(remaining),
  ]);

  return (
    <>
      <SubTitle text="최종 아이템 수량" description="최초 클리어, 소탕, 상점 구매 후 남은 수량을 확인할 수 있어요" />
      <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from(allItemUids).map((itemUid) => {
          const firstRunCount = fromFirstRun[itemUid] || 0;
          const repeatedRunsCount = fromRepeatedRuns[itemUid] || 0;
          const toBuyCount = toBuyShopItems[itemUid] || 0;
          const existingCount = existingPaymentItemQuantities[itemUid] || 0;
          // Note: toBuyCount already accounts for existing items (see paymentItemQuantities calculation)
          // So remainingCount = collected - (required - existing) = collected - required + existing
          const remainingCount = firstRunCount + repeatedRunsCount - toBuyCount;

          return (
            <div key={itemUid} className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg flex items-start gap-2">
              <ResourceCard itemUid={itemUid} resourceType={ResourceTypeEnum.Item} rarity={1} />
              <div className="grow space-y-1.5 text-sm">
                <div className="flex justify-between items-center pb-1.5 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">{remainingCount > 0 ? "남은" : "부족"} 수량</span>
                  <span className={`font-bold ${remainingCount > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{remainingCount.toLocaleString()}</span>
                </div>
                {existingCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 dark:text-neutral-400">기존 보유</span>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{existingCount.toLocaleString()}</span>
                  </div>
                )}
                {firstRunCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 dark:text-neutral-400">스토리 / 초회 보상</span>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{firstRunCount.toLocaleString()}</span>
                  </div>
                )}
                {repeatedRunsCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 dark:text-neutral-400">퀘스트 소탕</span>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{repeatedRunsCount.toLocaleString()}</span>
                  </div>
                )}
                {toBuyCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 dark:text-neutral-400">상점 구매</span>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">-{toBuyCount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
});


type TabsProps = {
  tabs: {
    tabId: string;
    name: string;
    imageUrl?: string;
  }[];

  activeTabId: string;
  setActiveTabId: Dispatch<SetStateAction<string>>;
};

function Tabs({ tabs, activeTabId, setActiveTabId }: TabsProps) {
  return (
    <div className="flex border-b border-neutral-200 dark:border-neutral-700 mb-4 overflow-x-auto">
      {tabs.map(({ tabId, name, imageUrl }) => {
        const isActive = activeTabId === tabId;
        return (
          <div
            key={tabId}
            onClick={() => setActiveTabId(tabId)}
            className={sanitizeClassName(`
                flex items-center gap-1 py-1 px-4 border-b-3 transition-colors shrink-0 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer
                ${isActive
                ? "border-b-blue-500 text-neutral-800 dark:text-neutral-200"
                : "border-b-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
              }
            `)}
          >
            {imageUrl && <img alt={name} src={imageUrl} className="-ml-2 size-8 object-contain" loading="lazy"/>}
            <span className="font-medium whitespace-nowrap">
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
