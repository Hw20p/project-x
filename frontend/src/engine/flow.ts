// 흐르는 서술을 고르는 규칙. 시간이 흐르는 전환마다 상태에 맞는 서술이 최대 `MAX_FLOW_LINES`줄 골라진다.
//   1) 이야기 비트: 조건이 맞고 아직 안 나온 것 (한 번만). 우선순위가 높은 것부터, 한 전환에 최대 `MAX_BEATS`개
//   2) 일상 서술: 해가 바뀐 만큼, 남은 줄 수 안에서 (가장 최근 해부터). 조건이 많이 맞을수록 더 자주 나온다.
//
// 서술을 고르는 난수는 게임 판정용 난수와 완전히 분리한다: 시드와 시점(나이, 쌓인 기록 수)에서 매번 새로 파생한다.
// 그래서 서술을 추가하거나 바꿔도 확률 판정과 시뮬레이션 결과는 달라지지 않고, 같은 시드·같은 선택이면 같은 서술이 나온다.
import { RANK_LABELS } from './config'
import { meetsCondition } from './interlude'
import type { ConditionContext } from './interlude'
import { createRng } from './rng'
import type { Rng } from './rng'
import type { GameState, LifeLogEntry } from './state'
import type { BackgroundDef, ContainmentObject, FlowDef, InterludeCondition, OpeningDef } from './types'

/** 한 전환에서 보여 줄 최대 줄 수 */
export const MAX_FLOW_LINES = 3
/** 그중 이야기 비트의 최대 개수 */
const MAX_BEATS = 2
/** 최근에 나온 일상 서술 몇 개를 다시 뽑지 않을지 */
const RECENT_AMBIENT_WINDOW = 8
/** 조건이 하나 붙을 때마다 일상 서술의 가중치에 더해지는 배율 (조건이 많을수록 "지금 상태"에 맞는 문장) */
const SPECIFICITY_BONUS = 1.5

/** 서술에 쓸 수 있는 자리표시자. 이 밖의 `{...}`는 검증기가 에러로 잡는다. */
export const FLOW_PLACEHOLDERS = ['age', 'rank', 'object', 'background'] as const

/** 서술 선택에 필요한 콘텐츠. `GameContext`가 이 모양을 만족한다. */
export interface FlowSource {
  flows?: readonly FlowDef[]
  openings?: readonly OpeningDef[]
  objects: readonly ContainmentObject[]
  backgrounds?: readonly BackgroundDef[]
}

/** 시드와 정수 몇 개에서 새 난수 시드를 파생한다 (해시 섞기). 판정용 난수 상태에는 영향을 주지 않는다. */
function deriveSeed(seed: number, ...parts: number[]): number {
  let hash = seed >>> 0
  for (const part of parts) {
    hash = Math.imul(hash ^ (part >>> 0), 0x85ebca6b)
    hash ^= hash >>> 13
    hash = Math.imul(hash, 0xc2b2ae35)
    hash ^= hash >>> 16
  }
  return hash >>> 0
}

function fillTemplate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match)
}

function pickVariant(rng: Rng, text: string | string[]): string {
  return typeof text === 'string' ? text : text[rng.int(0, text.length - 1)]
}

/** 조건이 몇 개 걸려 있는지. 많을수록 구체적인 문장이라 지금 상태와 맞을 때 더 자주 뽑는다. */
function specificity(when: InterludeCondition | undefined): number {
  return Object.values(when ?? {}).filter((value) => value !== undefined).length
}

/** 입사 배경에 맞는 오프닝 장면. 배경이 없으면 빈 배열. */
export function openingEntries(source: FlowSource, backgroundId: string | null, age: number): LifeLogEntry[] {
  if (backgroundId === null) {
    return []
  }
  return (source.openings ?? [])
    .filter((opening) => opening.backgroundId === backgroundId)
    .flatMap((opening) =>
      opening.lines.map((text, index) => ({ id: `${opening.id}:${index}`, age, kind: 'opening' as const, text })),
    )
}

/**
 * 이번 전환에서 보여 줄 서술을 고른다.
 * @param crossedAges 이번 전환에서 새로 도달한 정수 나이들. 해가 바뀐 만큼 일상 서술이 붙고, 비어 있으면 비트만 나올 수 있다.
 */
export function pickFlowLines(source: FlowSource, state: GameState, crossedAges: readonly number[]): LifeLogEntry[] {
  const defs = source.flows ?? []
  if (defs.length === 0) {
    return []
  }

  const object = state.progress ? source.objects.find((candidate) => candidate.id === state.progress?.objectId) : undefined
  const conditionBase: ConditionContext = { objectId: object?.id, objectTier: object?.tier }
  const backgroundName = (source.backgrounds ?? []).find((candidate) => candidate.id === state.backgroundId)?.name ?? ''
  const currentAge = Math.floor(state.player.age)
  const varsFor = (age: number): Record<string, string> => ({
    age: String(age),
    rank: RANK_LABELS[state.player.career.rank],
    object: object?.name ?? '객체',
    background: backgroundName,
  })

  const rng = createRng(deriveSeed(state.seed, Math.floor(state.player.age * 2), state.lifeLog.length))
  const shownIds = new Set(state.lifeLog.map((entry) => entry.id))
  const entries: LifeLogEntry[] = []

  // 1) 이야기 비트
  const beats = defs
    .filter((def) => def.kind === 'beat' && !shownIds.has(def.id) && meetsCondition(def.when, state, conditionBase))
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .slice(0, MAX_BEATS)
  for (const beat of beats) {
    entries.push({
      id: beat.id,
      age: currentAge,
      kind: 'beat',
      text: fillTemplate(pickVariant(rng, beat.text), varsFor(currentAge)),
    })
  }

  // 2) 일상 서술: 해가 바뀐 만큼, 남은 줄 수 안에서 가장 최근 해부터
  const slots = MAX_FLOW_LINES - entries.length
  const ages = slots > 0 ? crossedAges.slice(-slots) : []
  const recent = new Set(
    state.lifeLog
      .filter((entry) => entry.kind === 'ambient')
      .slice(-RECENT_AMBIENT_WINDOW)
      .map((entry) => entry.id),
  )
  for (const age of ages) {
    const candidates = defs.filter(
      (def) => def.kind === 'ambient' && !recent.has(def.id) && meetsCondition(def.when, state, { ...conditionBase, age }),
    )
    if (candidates.length === 0) {
      continue
    }
    const def = rng.pickWeighted(candidates, (candidate) => (candidate.weight ?? 1) * (1 + SPECIFICITY_BONUS * specificity(candidate.when)))
    recent.add(def.id)
    entries.push({ id: def.id, age, kind: 'ambient', text: fillTemplate(pickVariant(rng, def.text), varsFor(age)) })
  }

  // 시간 순으로 정렬하되, 같은 나이에서는 일상 서술 뒤에 이야기 비트가 오게 한다
  return entries.sort((a, b) => a.age - b.age || (a.kind === 'beat' ? 1 : 0) - (b.kind === 'beat' ? 1 : 0))
}
