// 막간 이벤트를 언제, 어떤 것으로 끼울지 정하는 규칙.
//   - 마지막 막간 이벤트 이후 `INTERLUDE.minIntervalYears`가 지나면 다음 기회에 이벤트가 낀다 (`isInterludeDue`)
//   - 조건(`when`)·쿨다운·한 번만 나오는 이벤트를 걸러낸 뒤, 가중치로 하나를 고른다 (`pickInterlude`)
//   - 정신력이 낮을수록 회복 이벤트가 더 자주 나온다
import { INTERLUDE, STAT_MIN } from './config'
import type { Rng } from './rng'
import { clamp } from './rules'
import type { GameState } from './state'
import type { InterludeCondition, InterludeDef, Rank, StatKey } from './types'

/**
 * 막간 이벤트의 간격·쿨다운을 재는 나이. 객체 관리에 드는 시간은 보고서 뒤에 한꺼번에 흐르므로,
 * 관리 도중에는 지금까지 쓴 시간(`progress.yearsSpent`)을 더해서 센다 (긴 객체의 단계 사이에도 이벤트가 낄 수 있게).
 */
export function effectiveAge(state: GameState): number {
  return state.player.age + (state.progress?.yearsSpent ?? 0)
}

/** 마지막 막간 이벤트 이후 충분한 시간이 지났는지 */
export function isInterludeDue(state: GameState): boolean {
  return effectiveAge(state) - state.lastInterludeAge >= INTERLUDE.minIntervalYears
}

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
  if (last && effectiveAge(state) - last.age < cooldown) {
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
 * 지금 나올 수 있는 이벤트 중 하나를 가중치로 고른다. 나올 수 있는 이벤트가 없으면 null이고, 이때는 난수를 쓰지 않는다.
 */
export function pickInterlude(rng: Rng, defs: readonly InterludeDef[], state: GameState): InterludeDef | null {
  const candidates = defs.filter((def) => isEligible(def, state))
  if (candidates.length === 0) {
    return null
  }
  return rng.pickWeighted(candidates, (def) => (def.weight ?? 1) * needMultiplier(def, state))
}
