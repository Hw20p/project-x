// 상태를 직접 들고 있지 않는 순수 함수 모음. 입력이 같으면 (시드가 같으면) 결과도 같다.
import {
  AGE_CHANCE_PENALTY,
  AGING,
  CHANCE_MAX,
  CHANCE_MIN,
  DEFAULT_STATS,
  GAIN_FLOOR,
  PROMOTION,
  PROMOTION_REQUIREMENTS,
  REASSIGNMENT,
  RELATION_MAX,
  RELATION_MIN,
  STAT_BASELINE,
  STAT_MAX,
  STAT_MIN,
  TIER_CHANCE_MODIFIER,
  YEARLY_SANITY_RECOVERY,
} from './config'
import type { Rng } from './rng'
import { STAT_KEYS } from './types'
import type {
  Career,
  Choice,
  ContainmentObject,
  NpcBond,
  NpcDef,
  OutcomeExtras,
  Rank,
  StatDelta,
  Stats,
} from './types'

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function createInitialStats(): Stats {
  return { ...DEFAULT_STATS }
}

export function createCareer(): Career {
  return { rank: 1, promotionPoints: 0, streak: 0, totalSuccesses: 0, totalFailures: 0 }
}

/** 스탯 변화를 적용하고 0~100으로 자름. 변화가 없으면 같은 객체를 돌려줌. */
export function applyDelta(stats: Stats, delta: StatDelta | undefined): Stats {
  if (!delta) {
    return stats
  }
  const next = { ...stats }
  for (const key of STAT_KEYS) {
    const change = delta[key]
    if (change !== undefined) {
      next[key] = clamp(next[key] + change, STAT_MIN, STAT_MAX)
    }
  }
  return next
}

/** 선택지 성공 확률 계산에 더해지는 상황 정보 */
export interface ChanceContext {
  /** 이번 객체 관리 동안만 적용되는 임시 스탯 보정(재배정 지식 보너스 등). 스탯 자체는 바꾸지 않는다. */
  bonus?: StatDelta
  /** 관리 중인 객체의 등급. 주어지면 등급별 보정(`TIER_CHANCE_MODIFIER`)이 더해진다. */
  tier?: Rank
  /** 현재 나이. 주어지면 나이에 따른 감소(`AGE_CHANCE_PENALTY`)가 적용된다. */
  age?: number
}

/** 나이에 따른 성공 확률 감소량 (0 이상). */
export function agePenalty(age: number): number {
  let penalty = 0
  for (const tier of AGE_CHANCE_PENALTY) {
    if (age >= tier.minAge) {
      penalty = tier.penalty
    }
  }
  return penalty
}

/** 선택지의 최종 성공 확률 (0.03~0.97). 화면에 그대로 보여 주는 값이기도 함. */
export function calcSuccessChance(choice: Choice, stats: Stats, context: ChanceContext = {}): number {
  let chance = choice.baseChance
  for (const key of STAT_KEYS) {
    const weight = choice.statWeights?.[key]
    if (weight) {
      const effective = clamp(stats[key] + (context.bonus?.[key] ?? 0), STAT_MIN, STAT_MAX)
      chance += weight * (effective - STAT_BASELINE)
    }
  }
  if (context.tier) {
    chance += TIER_CHANCE_MODIFIER[context.tier]
  }
  if (context.age !== undefined) {
    chance -= agePenalty(context.age)
  }
  return clamp(chance, CHANCE_MIN, CHANCE_MAX)
}

export function rollChoice(
  rng: Rng,
  choice: Choice,
  stats: Stats,
  context: ChanceContext = {},
): { chance: number; success: boolean } {
  const chance = calcSuccessChance(choice, stats, context)
  return { chance, success: rng.chance(chance) }
}

/**
 * 선택 결과의 스탯 변화를 적용한다. `applyDelta`와 달리 상승분에 수확체감이 걸린다:
 * 현재 스탯이 기준값(50) 이하면 그대로, 100에 가까울수록 `GAIN_FLOOR` 배까지 줄어든다. 하락분은 그대로.
 */
export function applyOutcomeEffects(stats: Stats, delta: StatDelta | undefined): Stats {
  if (!delta) {
    return stats
  }
  const next = { ...stats }
  for (const key of STAT_KEYS) {
    const change = delta[key]
    if (change === undefined) {
      continue
    }
    const factor = change > 0 ? clamp((STAT_MAX - stats[key]) / (STAT_MAX - STAT_BASELINE), GAIN_FLOOR, 1) : 1
    const value = clamp(stats[key] + change * factor, STAT_MIN, STAT_MAX)
    next[key] = Math.round(value * 10) / 10
  }
  return next
}

/** 재배정 객체의 지식 보너스. timesManaged = 이번 판에서 그 객체를 이미 관리한 횟수 (1 이상). */
export function calcReassignKnowledgeBonus(timesManaged: number): number {
  const bonus = REASSIGNMENT.knowledgeBonusFirst + REASSIGNMENT.knowledgeBonusPerExtra * (timesManaged - 1)
  return Math.min(bonus, REASSIGNMENT.knowledgeBonusMax)
}

/**
 * 선택 결과의 플래그·관계 변화를 적용한다. 변화가 없으면 같은 객체를 돌려준다.
 * 관계 값은 -100~100으로 자르고, 플래그는 중복 없이 보관한다.
 */
export function applyExtras(
  flags: readonly string[],
  relations: Readonly<Record<string, number>>,
  extras: OutcomeExtras,
): { flags: string[]; relations: Record<string, number> } {
  let nextFlags = [...flags]
  for (const flag of extras.setFlags ?? []) {
    if (!nextFlags.includes(flag)) {
      nextFlags.push(flag)
    }
  }
  if (extras.clearFlags) {
    const cleared = new Set(extras.clearFlags)
    nextFlags = nextFlags.filter((flag) => !cleared.has(flag))
  }

  const nextRelations = { ...relations }
  for (const [npcId, change] of Object.entries(extras.relations ?? {})) {
    nextRelations[npcId] = clamp((nextRelations[npcId] ?? 0) + change, RELATION_MIN, RELATION_MAX)
  }
  return { flags: nextFlags, relations: nextRelations }
}

/** 관계 값이 지금 해당하는 bond들 (화면에 관계 단계를 보여 줄 때도 쓴다) */
export function findActiveBonds(npc: NpcDef, relation: number): NpcBond[] {
  return (npc.bonds ?? []).filter((bond) => {
    const aboveMin = bond.minRelation === undefined || relation >= bond.minRelation
    const belowMax = bond.maxRelation === undefined || relation <= bond.maxRelation
    return aboveMin && belowMax
  })
}

/**
 * NPC와의 관계가 매년 주는 효과의 합. 관계 값이 각 bond의 범위(minRelation~maxRelation)에 들어가면 그 bond의
 * yearly 효과가 더해진다. 만난 적 없는 NPC(관계 값 없음)는 효과가 없다.
 */
export function calcBondEffects(npcs: readonly NpcDef[], relations: Readonly<Record<string, number>>): StatDelta {
  const total: StatDelta = {}
  for (const npc of npcs) {
    const relation = relations[npc.id]
    if (relation === undefined) {
      continue
    }
    for (const bond of findActiveBonds(npc, relation)) {
      for (const key of STAT_KEYS) {
        const change = bond.yearly[key]
        if (change !== undefined) {
          total[key] = (total[key] ?? 0) + change
        }
      }
    }
  }
  return total
}

/** 객체 전체 소요 시간(년). 높은 위험을 택해 일찍 끝내면 이보다 짧아짐. */
export function getObjectYears(object: ContainmentObject): number {
  return object.stages.reduce((sum, stage) => sum + stage.years, 0)
}

/** 실패(setback) 횟수가 허용치 이하면 관리 성공 */
export function isObjectCleared(object: ContainmentObject, failures: number): boolean {
  return failures <= (object.failureTolerance ?? 0)
}

/** 관리 성공 한 건이 주는 승급 점수 */
export function calcSuccessPoints(streakAfter: number, flawless: boolean): number {
  const streakSteps = clamp(streakAfter - 1, 0, PROMOTION.streakBonusMaxSteps)
  return PROMOTION.successPoints + streakSteps * PROMOTION.streakBonusPerStep + (flawless ? PROMOTION.flawlessBonus : 0)
}

/** 객체 관리 결과(성공/실패)를 경력에 반영. 재배정 객체면 성공 점수에 REASSIGNMENT.pointMultiplier가 곱해진다. */
export function recordObjectResult(
  career: Career,
  cleared: boolean,
  flawless: boolean,
  reassigned = false,
): Career {
  if (!cleared) {
    return { ...career, streak: 0, totalFailures: career.totalFailures + 1 }
  }
  const streak = career.streak + 1
  const basePoints = calcSuccessPoints(streak, flawless)
  const points = reassigned ? Math.round(basePoints * REASSIGNMENT.pointMultiplier) : basePoints
  return {
    ...career,
    streak,
    promotionPoints: career.promotionPoints + points,
    totalSuccesses: career.totalSuccesses + 1,
  }
}

export function canPromote(career: Career, stats: Stats): boolean {
  const { rank } = career
  if (rank === 5) {
    return false
  }
  const requirement = PROMOTION_REQUIREMENTS[rank]
  return career.promotionPoints >= requirement.points && stats.reputation >= requirement.reputation
}

export function promote(career: Career): Career {
  return { ...career, rank: Math.min(5, career.rank + 1) as Rank, promotionPoints: 0 }
}

/** 좌천. 이미 수습이면 해고(dismissed)되어 그 판이 끝남. */
export function demote(career: Career): { career: Career; dismissed: boolean } {
  if (career.rank === 1) {
    return { career, dismissed: true }
  }
  return {
    career: { ...career, rank: (career.rank - 1) as Rank, promotionPoints: 0, streak: 0 },
    dismissed: false,
  }
}

export function agingHealthLoss(age: number): number {
  let loss = 0
  for (const tier of AGING.healthLossTiers) {
    if (age >= tier.minAge) {
      loss = tier.loss
    }
  }
  return loss
}

export function recoveryGain(age: number): number {
  const tier = AGING.recoveryTiers.find((t) => age <= t.maxAge)
  return tier ? tier.gain : 0
}

/** 한 살을 더 먹을 때의 체력 변화(노화·회복·병)와 정신력 회복. age는 새로 도달한 정수 나이. */
export function applyYearlyAging(rng: Rng, age: number, stats: Stats): { stats: Stats; illness: boolean } {
  let healthDelta = recoveryGain(age) - agingHealthLoss(age)
  const illnessChance = AGING.illnessBaseChance + Math.max(0, age - 40) * AGING.illnessChancePerYearOver40
  const illness = rng.chance(illnessChance)
  if (illness) {
    healthDelta -= rng.int(AGING.illnessHealthLossMin, AGING.illnessHealthLossMax)
  }
  return { stats: applyDelta(stats, { health: healthDelta, sanity: YEARLY_SANITY_RECOVERY }), illness }
}

/** prevAge → nextAge 사이에 새로 도달한 정수 나이들. 0.5년 단위 진행에서 해가 바뀌는 시점을 잡는 용도. */
export function crossedAges(prevAge: number, nextAge: number): number[] {
  const ages: number[] = []
  for (let age = Math.floor(prevAge) + 1; age <= Math.floor(nextAge); age++) {
    ages.push(age)
  }
  return ages
}
