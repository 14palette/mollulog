import { useMemo, useCallback, memo, useState } from "react";
import Decimal from "decimal.js";
import { Toggle } from "~/components/atoms/form";
import { SetStateAction, Dispatch } from "react";
import { StageCard } from "./StageCard";
import { CollectedTotalsSection } from "./CollectedTotalsSection";
import type { Stage, ShopResource } from "./types";
import { SectionHeader } from "./SectionHeader";

type StagesProps = {
  stages: Stage[];
  appliedBonusRatio: Record<string, Decimal>;
  paymentItemQuantities: Record<string, number>;
  enabledStages: Record<string, boolean>;
  setEnabledStages: Dispatch<SetStateAction<Record<string, boolean>>>;
  includeFirstClear: boolean;
  setIncludeFirstClear: Dispatch<SetStateAction<boolean>>;
  extraStageRuns: Record<string, number>;
  setExtraStageRuns: Dispatch<SetStateAction<Record<string, number>>>;
  existingPaymentItemQuantities: Record<string, number>;
  itemQuantities: Record<string, number>;
  shopResources: ShopResource[];
}

export function StageSelector({
  stages, appliedBonusRatio,  paymentItemQuantities,  enabledStages,  setEnabledStages, includeFirstClear, setIncludeFirstClear, extraStageRuns, setExtraStageRuns, existingPaymentItemQuantities, itemQuantities, shopResources,
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

  const [folded, setFolded] = useState<boolean>(true);

  return (
    <>
      <SectionHeader title="스테이지 소탕 계획" description="스테이지를 선택하고 최적화된 소탕 계획을 세워보세요" folded={folded} setFolded={setFolded} />

      {!folded && (
        <>
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
        </>
      )}

      {stageCalculations.totalApWithExtras > 0 && (
        <div className="my-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-teal-950 border border-green-200 dark:border-green-800 rounded-lg">
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

      <CollectedTotalsSection breakdown={stageCalculations.itemBreakdown} existingPaymentItemQuantities={existingPaymentItemQuantities} itemQuantities={itemQuantities} shopResources={shopResources} />
    </>
  );
}
