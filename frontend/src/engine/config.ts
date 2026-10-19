// 밸런스 수치는 전부 여기 모은다. 게임을 돌려 보며 이 파일만 만져서 조정하는 것을 목표로 함.
import type { Rank, Stats } from './types'

/** 입사 나이. 이 나이까지는 인생 선택지 구간(스탯 결정)이고, 이후 객체 관리가 시작됨. */
export const ENTRY_AGE = 22
/** 이 나이가 되면 자연스럽게 삶이 끝남 */
export const MAX_AGE = 100

export const STAT_MIN = 0
export const STAT_MAX = 100
/** 확률 보정의 기준값. 스탯이 이 값이면 보정 0. */
export const STAT_BASELINE = 50

/** 성공 확률의 하한/상한 — 어떤 선택도 확정 성공/확정 실패는 아님 */
export const CHANCE_MIN = 0.03
export const CHANCE_MAX = 0.97

/**
 * 선택 결과로 얻는 스탯 상승은 이미 높을수록 줄어든다: 스탯이 기준값(50) 이하면 100%,
 * 100에 가까울수록 최소 GAIN_FLOOR 배까지. 지식·평판이 100에 붙어 후반 객체가 너무 쉬워지는 것을 막는다.
 * (감소와 노화·회복에는 적용되지 않음)
 */
export const GAIN_FLOOR = 0.2

/**
 * 객체 등급별 성공 확률 보정 (선택지의 baseChance에 더함). 등급이 높을수록 어렵게.
 * 1차 시뮬레이션에서 후반 등급이 오히려 쉬워지는 역전이 나와서 추가함.
 */
export const TIER_CHANCE_MODIFIER: Record<Rank, number> = {
  1: 0.06,
  2: 0,
  3: -0.05,
  4: -0.12,
  5: -0.18,
}

/**
 * 나이에 따른 성공 확률 감소 (minAge 이상인 가장 높은 구간 하나만 적용). 나이가 들수록 어려워져서
 * "빨리 올라가야 한다"는 시간 압박이 생기고, 안전한 선택만 해서 느긋하게 올라가는 전략이 공짜가 되지 않게 한다.
 */
export const AGE_CHANCE_PENALTY = [
  { minAge: 50, penalty: 0.03 },
  { minAge: 60, penalty: 0.06 },
  { minAge: 70, penalty: 0.1 },
  { minAge: 80, penalty: 0.15 },
] as const

/**
 * 해마다 자연 회복되는 정신력 (일상 회복).
 * 정신력 회복은 막간 이벤트(recovery)가 맡으므로 자연 회복은 없다(0). 막간 이벤트 도입 후에도 +1이면 안전 우선 봇의
 * 정신 붕괴가 5.5%까지 떨어져서(목표 20~40%) 0으로 낮췄다. 재측정 전의 값.
 * 이벤트 없이 시뮬레이션했을 때 안전 우선 봇의 정신 붕괴 비율: +0 → 88%, +1 → 80%, +2 → 23%, +3 → 0.4%.
 */
export const YEARLY_SANITY_RECOVERY = 0

/** 막간 이벤트(객체 관리 사이사이에 끼는 회복·성장·관계 이벤트) 설정 */
export const INTERLUDE = {
  /** 마지막 막간 이벤트 이후 이만큼(년) 지나면, 다음 기회(객체가 끝났을 때, 긴 객체의 단계 사이)에 이벤트가 낀다 */
  minIntervalYears: 2,
  /** 같은 이벤트가 다시 나오기까지의 기본 쿨다운(년) */
  defaultCooldownYears: 6,
  /** 정신력이 낮을수록 회복 이벤트의 가중치가 커진다: 정신력 50 이상이면 ×1, 0이면 ×(1 + 이 값) */
  recoveryNeedBonus: 2,
} as const

/** NPC 관계 값의 범위 */
export const RELATION_MIN = -100
export const RELATION_MAX = 100

/** 임시 초기 스탯. 인생 선택지 구간이 구현되면 그 결과로 대체됨. */
export const DEFAULT_STATS: Stats = {
  sanity: 50,
  health: 50,
  reputation: 20,
  knowledge: 50,
}

export const RANK_LABELS: Record<Rank, string> = {
  1: '수습',
  2: '사원',
  3: '주임',
  4: '책임',
  5: '수석',
}

export const PROMOTION = {
  /** 객체 관리 성공 시 기본 점수 */
  successPoints: 10,
  /** 연속 성공 2회차부터 회차마다 붙는 가산점 */
  streakBonusPerStep: 2,
  /** 연속 성공 가산점이 붙는 최대 회차 수 */
  streakBonusMaxSteps: 5,
  /** 실패(setback) 없이 끝냈을 때 가산점 */
  flawlessBonus: 5,
} as const

/**
 * 현재 직급(키)에서 다음 직급으로 올라가기 위한 조건. 5급(수석)은 최종 직급이라 없음.
 * 임시 수치: 직급당 객체가 2개뿐이고 성공 한 건이 10~17점이라, 객체를 늘리거나 재배정 규칙이 정해지면 다시 맞출 것.
 */
export const PROMOTION_REQUIREMENTS: Record<Exclude<Rank, 5>, { points: number; reputation: number }> = {
  1: { points: 15, reputation: 20 },
  2: { points: 25, reputation: 30 },
  3: { points: 35, reputation: 40 },
  4: { points: 45, reputation: 50 },
}

/**
 * 객체 재배정: 현재 직급의 새 객체를 다 소진하면, 이미 관리한 하위 등급 객체가 다시 배정됨.
 * 이미 겪어 본 객체라 쉬운 대신, 쉬운 일을 반복해서 승급하는 것은 어렵게 만든다.
 */
export const REASSIGNMENT = {
  /** 재배정 객체를 두 번째로 만날 때의 지식 보너스 (그 객체를 관리하는 동안만 적용, 스탯 자체는 안 바뀜) */
  knowledgeBonusFirst: 10,
  /** 이후 만날 때마다 추가되는 지식 보너스 */
  knowledgeBonusPerExtra: 5,
  /** 지식 보너스 상한 */
  knowledgeBonusMax: 20,
  /** 재배정 객체를 성공했을 때 받는 승급 점수 배율 (평판 보상은 그대로) */
  pointMultiplier: 0.5,
} as const

export const AGING = {
  /** 나이가 minAge 이상이면 매년 이만큼 체력이 줄어듦 (해당하는 가장 높은 구간 적용) */
  healthLossTiers: [
    { minAge: 45, loss: 1 },
    { minAge: 55, loss: 2 },
    { minAge: 65, loss: 3 },
    { minAge: 75, loss: 4 },
    { minAge: 85, loss: 6 },
  ],
  /** 젊을수록 매년 체력이 조금 회복됨 (maxAge 이하인 첫 구간 적용) */
  recoveryTiers: [
    { maxAge: 39, gain: 3 },
    { maxAge: 49, gain: 1 },
  ],
  /** 매년 병에 걸릴 확률 = base + (나이 - 40) * perYear (40세 이하는 base) */
  illnessBaseChance: 0.01,
  illnessChancePerYearOver40: 0.0015,
  illnessHealthLossMin: 10,
  illnessHealthLossMax: 25,
} as const
