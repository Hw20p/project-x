// 흐르는 서술을 고르는 규칙. 시간이 한 해 흐를 때마다 그 해의 나이와 상태에 맞는 서술이 골라진다 (`pickYearLines`).
//   1) 이야기 비트: 조건이 맞고 아직 안 나온 것 (한 번만). 우선순위가 높은 것부터, 한 해에 최대 `MAX_BEATS_PER_YEAR`개
//   2) 일상 서술: 한 해에 `AMBIENT_PER_YEAR` 범위의 줄 수. 조건이 많이 맞을수록 더 자주 나온다.
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

/** 한 해에 나오는 일상 서술의 줄 수 범위 (80억분의 1처럼 한 해에 여러 줄). 한 판의 플레이 시간을 정하는 값이다. */
export const AMBIENT_PER_YEAR = { min: 1, max: 2 } as const
/** 한 해에 나올 수 있는 이야기 비트의 최대 개수. 사슬이 한꺼번에 쏟아지지 않고 해마다 하나씩 풀리게 한다. */
const MAX_BEATS_PER_YEAR = 1
/** 객체를 끝낸 뒤 이 기간(년) 안에만 "방금 끝낸 객체"가 서술의 객체 조건 기준이 된다 */
const RECENT_OBJECT_YEARS = 2
/** 최근에 나온 일상 서술 몇 개를 다시 뽑지 않을지. 한 해에 여러 줄이 나오므로 넉넉히 둔다. */
const RECENT_AMBIENT_WINDOW = 30
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

/**
 * 이야기 사슬: `after`가 있으면 그 서술이 이미 나왔고, 나온 뒤 `afterYears`년이 지나야 열린다.
 * (나온 나이는 삶의 기록에 남은 나이로 센다.) `after`가 없으면 항상 열려 있다.
 */
function isUnlocked(def: FlowDef, state: GameState): boolean {
  if (def.after === undefined) {
    return true
  }
  const shown = state.lifeLog.find((entry) => entry.id === def.after)
  return shown !== undefined && state.player.age - shown.age >= (def.afterYears ?? 0)
}

/** 이 서술들이 켜는 플래그. 이야기 비트가 줄거리의 진행을 표시해서 막간 이벤트·다른 서술의 조건이 되게 한다. */
export function flagsSetBy(source: FlowSource, entries: readonly LifeLogEntry[]): string[] {
  return entries.flatMap((entry) => (source.flows ?? []).find((def) => def.id === entry.id)?.setFlags ?? [])
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
 * 한 해가 흘렀을 때 그 해에 보여 줄 서술을 고른다. `state`는 그 해로 나이·스탯·직급이 이미 갱신된 상태여야 한다.
 * 일상 서술이 먼저, 이야기 비트가 그 뒤에 온다 (비트가 그 해의 마지막 줄이 되도록).
 */
export function pickYearLines(source: FlowSource, state: GameState): LifeLogEntry[] {
  const defs = source.flows ?? []
  if (defs.length === 0) {
    return []
  }

  const age = state.player.age
  // 서술의 객체 조건 기준: 관리 중인 객체, 없으면 최근에 끝낸 객체 (끝낸 지 RECENT_OBJECT_YEARS년 안일 때만)
  const lastReport = state.history[state.history.length - 1]
  const recentReport = lastReport && age - lastReport.ageAtEnd <= RECENT_OBJECT_YEARS ? lastReport : undefined
  const objectId = state.progress?.objectId ?? recentReport?.objectId
  const object = objectId ? source.objects.find((candidate) => candidate.id === objectId) : undefined
  const conditionBase: ConditionContext = { objectId: object?.id, objectTier: object?.tier }
  const backgroundName = (source.backgrounds ?? []).find((candidate) => candidate.id === state.backgroundId)?.name ?? ''
  const vars: Record<string, string> = {
    age: String(age),
    rank: RANK_LABELS[state.player.career.rank],
    object: object?.name ?? '객체',
    background: backgroundName,
  }

  const rng = createRng(deriveSeed(state.seed, age, state.lifeLog.length))
  const shownIds = new Set(state.lifeLog.map((entry) => entry.id))
  const entries: LifeLogEntry[] = []

  // 1) 일상 서술: 그 해의 상태에 맞는 문장을 한 해에 AMBIENT_PER_YEAR 범위의 줄 수만큼
  const recent = new Set(
    state.lifeLog
      .filter((entry) => entry.kind === 'ambient')
      .slice(-RECENT_AMBIENT_WINDOW)
      .map((entry) => entry.id),
  )
  const ambientCount = rng.int(AMBIENT_PER_YEAR.min, AMBIENT_PER_YEAR.max)
  for (let line = 0; line < ambientCount; line++) {
    const candidates = defs.filter(
      (def) =>
        def.kind === 'ambient' &&
        !recent.has(def.id) &&
        isUnlocked(def, state) &&
        meetsCondition(def.when, state, conditionBase),
    )
    if (candidates.length === 0) {
      break
    }
    const def = rng.pickWeighted(candidates, (candidate) => (candidate.weight ?? 1) * (1 + SPECIFICITY_BONUS * specificity(candidate.when)))
    recent.add(def.id)
    entries.push({ id: def.id, age, kind: 'ambient', text: fillTemplate(pickVariant(rng, def.text), vars) })
  }

  // 2) 이야기 비트: 조건이 맞고 아직 안 나온 것 (우선순위가 높은 것부터)
  const beats = defs
    .filter(
      (def) =>
        def.kind === 'beat' &&
        !shownIds.has(def.id) &&
        isUnlocked(def, state) &&
        meetsCondition(def.when, state, conditionBase),
    )
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .slice(0, MAX_BEATS_PER_YEAR)
  for (const beat of beats) {
    entries.push({ id: beat.id, age, kind: 'beat', text: fillTemplate(pickVariant(rng, beat.text), vars) })
  }

  return entries
}
