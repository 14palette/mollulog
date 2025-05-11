import type { AttackType, DefenseType, EventType, PickupType, RaidType, Role, Terrain } from "~/models/content";

export const attackTypeLocale: Record<AttackType, string> = {
  explosive: "폭발",
  piercing: "관통",
  mystic: "신비",
  sonic: "진동",
};

export const attackTypeColor: Record<AttackType, "red" | "yellow" | "blue" | "purple"> = {
  explosive: "red",
  piercing: "yellow",
  mystic: "blue",
  sonic: "purple",
};

export const defenseTypeLocale: Record<DefenseType, string> = {
  light: "경장갑",
  heavy: "중장갑",
  special: "특수장갑",
  elastic: "탄력장갑",
};

export const defenseTypeColor: Record<DefenseType, "red" | "yellow" | "blue" | "purple"> = {
  light: "red",
  heavy: "yellow",
  special: "blue",
  elastic: "purple",
};

export const roleLocale: Record<Role, string> = {
  striker: "스트라이커",
  special: "스페셜",
};

export const roleColor: Record<Role, "red" | "yellow" | "blue" | "purple"> = {
  striker: "red",
  special: "blue",
};

export const terrainLocale: Record<Terrain, string> = {
  indoor: "실내",
  outdoor: "야외",
  street: "시가지",
};

export const difficultyLocale: Record<string, string> = {
  insane: "인세인",
  torment: "토먼트",
  lunatic: "루나틱",
};

export const eventTypeLocale: Record<EventType, string> = {
  event: "이벤트",
  immortal_event: "이벤트 상설화",
  mini_event: "미니 이벤트",
  guide_mission: "가이드 미션",
  collab: "콜라보 이벤트",
  fes: "페스 이벤트",
  pickup: "모집",
  campaign: "캠페인",
  exercise: "종합전술시험",
  main_story: "메인 스토리",
};

export const raidTypeLocale: Record<RaidType, string> = {
  total_assault: "총력전",
  elimination: "대결전",
  unlimit: "제약해제결전",
};

export const contentTypeLocale: Record<EventType | RaidType, string> = {
  ...eventTypeLocale,
  ...raidTypeLocale,
};

export const pickupTypeLocale: Record<PickupType, string> = {
  usual: "일반",
  limited: "한정",
  given: "배포",
  fes: "페스",
};

export function pickupLabelLocale({ type, rerun }: { type: PickupType, rerun: boolean }): string {
  const labelTexts: string[] = [];
  if (type === "given") {
    labelTexts.push("배포");
  } else if (type === "limited") {
    labelTexts.push("한정");
  } else if (type === "fes") {
    labelTexts.push("페스");
  }

  if (type !== "given") {
    if (rerun) {
      labelTexts.push("복각");
    } else {
      labelTexts.push("신규");
    }
  }

  return labelTexts.join(" ");
}

export const schoolNameLocale: Record<string, string> = {
  abydos: "아비도스 고등학교",
  shanhaijing: "산해경 고급중학교",
  hyakkiyako: "백귀야행 연합학원",
  millennium: "밀레니엄 사이언스 스쿨",
  srt: "SRT 특수학원",
  arius: "아리우스 분교",
  trinity: "트리니티 종합학원",
  gehenna: "게헨나 학원",
  valkyrie: "발키리 경찰학교",
  redwinter: "붉은겨울 연방학원",
  sakugawa: "사쿠가와 중학교",
  tokiwadai: "토키와다이 중학교",
  highlander: "하이랜더 철도학원",
  others: "기타 학원",
};
