// 막간 이벤트가 언제, 어떤 것으로 나올지 정하는 규칙 (2026-10-20 개편: 시간 간격이 아니라 조건으로 나온다).
// 객체와 객체 사이의 "관리하지 않는 해"를 한 해씩 흘려 보내다가, 해마다 이 규칙으로 막간 이벤트가 나올지 판단한다 (`pickYearlyInterlude`).
//   - 조건 이벤트: 플래그·관계·스탯 같은 특정 조건이 걸린 이벤트와 한 번만 나오는 이야기 이벤트. 조건이 맞으면
//     마지막 막간 이벤트 이후 `INTERLUDE.minIntervalYears`만 지나면 나온다 (정신력이 낮을 때 회복 이벤트, 관계가 쌓였을 때 관계 이벤트 등).
//   - 일상 이벤트: 그런 조건이 없는 이벤트. 마지막 막간 이벤트 이후 `freeIntervalYears`가 지난 뒤 해마다 `freeChancePerYear` 확률로 나온다.
//   - 조건·쿨다운·한 번만 나오는 이벤트를 걸러낸 뒤 가중치로 하나를 고른다. 정신력이 낮을수록 회복 이벤트가 더 자주 나온다.
import { INTERLUDE, STAT_MIN } from './config'
import type { Rng } from './rng'
import { clamp } from './rules'
import type { GameState } from './state'
import type { InterludeCondition, InterludeDef, Rank, StatKey } from './types'

function inRange(value: number, range: { min?: number; max?: number }): boolean {
  return (range.min === undefined || value >= range.min) && (range.max === undefined || value <= range.max)
}

/** 조건 판정에 더하는 상황: 지금 관리 중인 객체, 그리고 나이를 현재 나이가 아닌 값으로 볼 때 */
export interface ConditionContext {
  objectId?: string
  objectTier?: Rank
  /** 해가 여러 번 바뀐 전환에서 "그 해"의 서술을 고를 때 그 나이로 판정한다 */
  age?: number
}

/** 조건을 모두 만족하는지 */
export function meetsCondition(
  condition: InterludeCondition | undefined,
  state: GameState,
  context: ConditionContext = {},
): boolean {
  if (!condition) {
    return true
  }
  const { rank } = state.player.career
  const age = Math.floor(context.age ?? state.player.age)
  if (condition.backgrounds && (state.backgroundId === null || !condition.backgrounds.includes(state.backgroundId))) {
    return false
  }
  if (condition.objects && (context.objectId === undefined || !condition.objects.includes(context.objectId))) {
    return false
  }
  if (condition.objectTiers && (context.objectTier === undefined || !condition.objectTiers.includes(context.objectTier))) {
    return false
  }
  if (condition.minRank !== undefined && rank < condition.minRank) {
    return false
  }
  if (condition.maxRank !== undefined && rank > condition.maxRank) {
    return false
  }
  if (condition.minAge !== undefined && age < condition.minAge) {
    return false
  }
  if (condition.maxAge !== undefined && age > condition.maxAge) {
    return false
  }
  for (const [key, range] of Object.entries(condition.stats ?? {})) {
    if (range && !inRange(state.player.stats[key as StatKey], range)) {
      return false
    }
  }
  if (condition.flags?.some((flag) => !state.flags.includes(flag))) {
    return false
  }
  if (condition.notFlags?.some((flag) => state.flags.includes(flag))) {
    return false
  }
  for (const [npcId, range] of Object.entries(condition.relations ?? {})) {
    // 만난 적 없는 NPC는 관계 값이 0인 것으로 본다
    if (range && !inRange(state.relations[npcId] ?? 0, range)) {
      return false
    }
  }
  return true
}

/** 이 이벤트가 지금 나올 수 있는지 (한 번만 나오는 이벤트, 쿨다운, 등장 조건) */
export function isEligible(def: InterludeDef, state: GameState): boolean {
  const past = state.interludeLog.filter((record) => record.eventId === def.id)
  if (def.once && past.length > 0) {
    return false
  }
  const last = past[past.length - 1]
  const cooldown = def.cooldownYears ?? INTERLUDE.defaultCooldownYears
  if (last && state.player.age - last.age < cooldown) {
    return false
  }
  return meetsCondition(def.when, state)
}

/** 종류별 필요도 가중. 정신력이 낮을수록 회복 이벤트가 커진다 (정신력 50 이상 ×1, 0이면 ×(1 + recoveryNeedBonus)). */
function needMultiplier(def: InterludeDef, state: GameState): number {
  if (def.kind !== 'recovery') {
    return 1
  }
  const deficit = clamp((50 - state.player.stats.sanity) / (50 - STAT_MIN), 0, 1)
  return 1 + INTERLUDE.recoveryNeedBonus * deficit
}

/**
 * 특정 조건이 걸린 이벤트인지. 한 번만 나오는 이야기 이벤트이거나, 플래그·관계·스탯·입사 배경 조건이 걸려 있으면 "조건 이벤트"다.
 * 직급·나이 조건만 있거나 조건이 없으면 일상 이벤트다.
 */
export function isSpecificEvent(def: InterludeDef): boolean {
  const when = def.when
  return Boolean(
    def.once ||
      (when &&
        (when.flags || when.notFlags || when.relations || when.stats || when.backgrounds || when.objects || when.objectTiers)),
  )
}

/**
 * 한 해가 흐른 뒤, 지금 막간 이벤트가 나올지 판단해서 나올 이벤트를 돌려준다. 안 나오면 null.
 * 조건 이벤트가 나올 수 있으면 `specificChancePerYear` 확률로 그중 하나(가중치)가 나오고, 아니면(또는 조건 이벤트가 없으면)
 * 일상 이벤트가 간격이 찬 뒤 확률로 나온다. 간격이 안 찼을 때는 난수를 쓰지 않는다.
 */
export function pickYearlyInterlude(rng: Rng, defs: readonly InterludeDef[], state: GameState): InterludeDef | null {
  const since = state.player.age - state.lastInterludeAge
  if (since < INTERLUDE.minIntervalYears) {
    return null
  }
  const eligible = defs.filter((def) => isEligible(def, state))
  const weight = (def: InterludeDef) => (def.weight ?? 1) * needMultiplier(def, state)

  const specific = eligible.filter(isSpecificEvent)
  if (specific.length > 0 && rng.chance(INTERLUDE.specificChancePerYear)) {
    return rng.pickWeighted(specific, weight)
  }
  const free = eligible.filter((def) => !isSpecificEvent(def))
  if (free.length === 0 || since < INTERLUDE.freeIntervalYears || !rng.chance(INTERLUDE.freeChancePerYear)) {
    return null
  }
  return rng.pickWeighted(free, weight)
}
