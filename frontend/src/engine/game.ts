// 게임 상태 머신. React/DOM과 무관한 순수 TS이고, 모든 전이는 새 상태를 돌려준다 (기존 상태는 건드리지 않음).
//
// 시간이 먼저 흐르는 구조 (2026-10-20 개편): 나이는 객체·이벤트가 아니라 시계가 올린다. 시간은 한 해 단위로 흐르고,
// 한 해가 흐를 때마다 노화·병 판정, 승급 점수 자동 누적(자동 승급), 그 해의 서술이 일어난다 (`tickYear`).
// 팝업(선택)은 두 곳에서 나온다: 객체 배정(`nextObjectAge`에 도달했을 때)과 막간 이벤트(조건이 맞았을 때).
// 객체 관리와 막간 이벤트는 한순간에 일어난다: 그 안에서는 시간이 흐르지 않아서 시간의 서술이 관리 서술 사이에 끼지 않고,
// 시간은 객체·이벤트가 끝난 뒤(다음 팝업이 나오기 전)에만 한 해씩 흐른다.
//
// 흐름:
//   briefing --begin--> choosing --choose--> outcome --continue--> choosing (다음 단계, 시간은 안 흐름)
//                                                               \-> report --continue--> (시간이 흐르다가) briefing | interlude
//   interlude --choose--> interludeOutcome --continue--> (시간이 흐르다가) briefing | interlude
//   choose 중 즉사/사망/정신 붕괴/최종 엔딩, 시간이 흐르는 중 노화·병 사망/100세, 해고(report 직후)면 ended
//
// 같은 시드와 같은 선택 기록이면 항상 같은 결과가 나온다 (`replayGame`으로 검증 가능).
import { pickNextObject } from './assignment'
import { ENTRY_AGE, FINALE, MAX_AGE, OBJECT_SCHEDULE } from './config'
import { currentAct, flagsSetBy, openingEntries, pickYearLines } from './flow'
import { pickYearlyInterlude } from './interlude'
import { createRng } from './rng'
import type { Rng } from './rng'
import {
  applyDelta,
  applyExtras,
  applyOutcomeEffects,
  applyYearlyAging,
  calcBondEffects,
  calcSuccessChance,
  canPromote,
  createCareer,
  createInitialStats,
  demote,
  isObjectCleared,
  passivePromotionPoints,
  promote,
  recordObjectResult,
  rollChoice,
} from './rules'
import type {
  ChoiceLogEntry,
  ChoiceResult,
  Ending,
  GameEvent,
  GameState,
  InterludeResult,
  LifeLogEntry,
  ObjectProgress,
  ObjectReport,
} from './state'
import type {
  BackgroundDef,
  Choice,
  ContainmentObject,
  FlowDef,
  InterludeDef,
  NpcDef,
  OpeningDef,
  PlayerState,
  Stage,
  StatDelta,
  Stats,
} from './types'
import { STAT_KEYS } from './types'

/** 게임이 참조하는 콘텐츠. 보통 `content/index.ts`의 `gameContext`를 넘긴다. */
export interface GameContext {
  objects: readonly ContainmentObject[]
  /** 막간 이벤트. 없으면 막간 이벤트 없이 객체 관리만 이어진다. */
  interludes?: readonly InterludeDef[]
  /** NPC. 관계 값에 따른 매년 효과(`bonds`) 계산에 쓴다. */
  npcs?: readonly NpcDef[]
  /** 입사 배경. `GameOptions.backgroundId`가 가리킨다. */
  backgrounds?: readonly BackgroundDef[]
  /** 흐르는 서술(일상·이야기 비트). 없으면 서술 없이 진행된다. */
  flows?: readonly FlowDef[]
  /** 입사 배경별 오프닝 장면 */
  openings?: readonly OpeningDef[]
}

export interface GameOptions {
  seed: number
  /** 입사 배경 id (`ctx.backgrounds`에 있어야 함). 그 배경의 스탯으로 시작한다. */
  backgroundId?: string
  /** 입사 시점의 스탯을 직접 지정한다. 배경보다 우선하고, 둘 다 없으면 `DEFAULT_STATS`. 시뮬레이션에서 쓴다. */
  stats?: Stats
  /** 입사 나이. 기본은 `ENTRY_AGE`. */
  age?: number
}

export type GameAction =
  | { type: 'begin' }
  | { type: 'choose'; choiceId: string }
  | { type: 'continue' }

export interface ChoiceOption {
  choice: Choice
  /** 화면에 그대로 보여 줄 최종 성공 확률 (지식 보너스까지 반영) */
  chance: number
}

// ───────────────────────── 조회 ─────────────────────────

export function findObject(ctx: GameContext, objectId: string): ContainmentObject {
  const object = ctx.objects.find((candidate) => candidate.id === objectId)
  if (!object) {
    throw new Error(`알 수 없는 객체: ${objectId}`)
  }
  return object
}

export function findInterlude(ctx: GameContext, eventId: string): InterludeDef {
  const def = (ctx.interludes ?? []).find((candidate) => candidate.id === eventId)
  if (!def) {
    throw new Error(`알 수 없는 막간 이벤트: ${eventId}`)
  }
  return def
}

export function getCurrentObject(ctx: GameContext, state: GameState): ContainmentObject | null {
  return state.progress ? findObject(ctx, state.progress.objectId) : null
}

export function getCurrentStage(ctx: GameContext, state: GameState): Stage | null {
  const object = getCurrentObject(ctx, state)
  return object && state.progress ? object.stages[state.progress.stageIndex] : null
}

/** interlude / interludeOutcome 단계에서 지금 진행 중인 막간 이벤트 */
export function getCurrentInterlude(ctx: GameContext, state: GameState): InterludeDef | null {
  return state.interlude ? findInterlude(ctx, state.interlude.eventId) : null
}

/** choosing·interlude 단계에서 선택지와 성공 확률을 돌려줌. 다른 단계에서는 빈 배열. */
export function getChoiceOptions(ctx: GameContext, state: GameState): ChoiceOption[] {
  if (state.phase === 'interlude') {
    const def = getCurrentInterlude(ctx, state)
    // 막간 이벤트에는 등급·나이 보정을 적용하지 않는다.
    return def ? def.choices.map((choice) => ({ choice, chance: calcSuccessChance(choice, state.player.stats) })) : []
  }
  const object = getCurrentObject(ctx, state)
  const stage = getCurrentStage(ctx, state)
  if (state.phase !== 'choosing' || !object || !stage || !state.progress) {
    return []
  }
  const context = {
    bonus: { knowledge: state.progress.knowledgeBonus },
    tier: object.tier,
    age: Math.floor(state.player.age),
  }
  return stage.choices.map((choice) => ({
    choice,
    chance: calcSuccessChance(choice, state.player.stats, context),
  }))
}

// ───────────────────────── 시작 ─────────────────────────

export function createGame(ctx: GameContext, options: GameOptions): GameState {
  const background = options.backgroundId
    ? (ctx.backgrounds ?? []).find((candidate) => candidate.id === options.backgroundId)
    : undefined
  if (options.backgroundId && !background) {
    throw new Error(`알 수 없는 입사 배경: ${options.backgroundId}`)
  }
  // 스탯을 직접 넘기면 그게 우선이고, 아니면 배경의 스탯, 둘 다 없으면 기본값
  const startStats = options.stats ?? background?.stats
  const entryAge = options.age ?? ENTRY_AGE
  const player: PlayerState = {
    age: entryAge,
    stats: startStats ? { ...startStats } : createInitialStats(),
    career: createCareer(entryAge),
  }
  const initial: GameState = {
    seed: options.seed,
    backgroundId: background?.id ?? null,
    rngState: options.seed >>> 0,
    phase: 'ended',
    player,
    managedCounts: {},
    progress: null,
    lastResult: null,
    history: [],
    rankLog: [{ age: entryAge, rank: 1 }],
    pendingEnding: null,
    ending: null,
    choiceLog: [],
    events: [],
    flags: [],
    relations: {},
    interlude: null,
    lastInterludeResult: null,
    interludeLog: [],
    lastInterludeAge: player.age,
    nextObjectAge: player.age,
    lifeLog: [],
    endingScene: null,
  }
  // 입사 첫날에는 바로 첫 객체를 배정받는다.
  const rng = createRng(initial.rngState)
  const started: GameState = { ...assignObject(ctx, initial, rng), rngState: rng.getState() }
  // 배경을 고른 직후의 오프닝 장면
  return started.phase === 'ended' ? started : appendFlow(started, openingEntries(ctx, started.backgroundId, player.age))
}

// ───────────────────────── 전이 ─────────────────────────

export function reduce(ctx: GameContext, state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'begin':
      return begin(state)
    case 'choose':
      return state.phase === 'interlude'
        ? chooseInterlude(ctx, state, action.choiceId)
        : choose(ctx, state, action.choiceId)
    case 'continue':
      return continueGame(ctx, state)
  }
}

function continueGame(ctx: GameContext, state: GameState): GameState {
  switch (state.phase) {
    case 'report':
      return continueFromReport(ctx, state)
    case 'interludeOutcome':
      return continueFromInterlude(ctx, state)
    default:
      return continueFromOutcome(ctx, state)
  }
}

function begin(state: GameState): GameState {
  if (state.phase !== 'briefing') {
    throw new Error(`begin은 briefing 단계에서만 가능 (현재: ${state.phase})`)
  }
  return { ...state, phase: 'choosing', events: [] }
}

function choose(ctx: GameContext, state: GameState, choiceId: string): GameState {
  const { progress } = state
  if (state.phase !== 'choosing' || !progress) {
    throw new Error(`choose는 choosing·interlude 단계에서만 가능 (현재: ${state.phase})`)
  }
  const object = findObject(ctx, progress.objectId)
  const stage = object.stages[progress.stageIndex]
  const choice = stage.choices.find((candidate) => candidate.id === choiceId)
  if (!choice) {
    throw new Error(`${object.code}/${stage.id}에 없는 선택지: ${choiceId}`)
  }

  const rng = createRng(state.rngState)
  const { chance, success } = rollChoice(rng, choice, state.player.stats, {
    bonus: { knowledge: progress.knowledgeBonus },
    tier: object.tier,
    age: Math.floor(state.player.age),
  })
  const outcome = success ? choice.success : choice.failure
  const failureKind = success ? undefined : choice.failure.kind
  const isLastStage = progress.stageIndex === object.stages.length - 1
  const endsObject = success
    ? choice.success.finish === true || isLastStage
    : failureKind === 'demotion' || isLastStage

  const result: ChoiceResult = {
    objectId: object.id,
    stageId: stage.id,
    choiceId: choice.id,
    chance,
    success,
    text: outcome.text,
    effects: outcome.effects,
    relations: outcome.relations,
    failureKind,
    endsObject,
  }
  const stats = applyOutcomeEffects(state.player.stats, outcome.effects)
  const extras = applyExtras(state.flags, state.relations, outcome)
  const next: GameState = {
    ...state,
    rngState: rng.getState(),
    player: { ...state.player, stats },
    progress: { ...progress, failures: progress.failures + (failureKind === 'setback' ? 1 : 0) },
    lastResult: result,
    flags: extras.flags,
    relations: extras.relations,
    choiceLog: [...state.choiceLog, { objectId: object.id, stageId: stage.id, choiceId: choice.id }],
    events: [],
  }

  const age = state.player.age
  if (failureKind === 'death') {
    return finish(next, { kind: 'death', deathCause: 'instant', age, objectId: object.id }, outcome.text)
  }
  if (stats.health <= 0) {
    return finish(next, { kind: 'death', deathCause: 'injury', age, objectId: object.id }, outcome.text)
  }
  if (stats.sanity <= 0) {
    return finish(next, { kind: 'breakdown', age, objectId: object.id }, outcome.text)
  }
  // 최종 객체의 선택이 성공하면 판이 끝난다 (사망·붕괴가 겹치면 그쪽이 우선).
  if (success && choice.success.endingId) {
    return finish(
      next,
      { kind: 'finale', endingId: choice.success.endingId, age, objectId: object.id },
      choice.success.text,
    )
  }
  return { ...next, phase: 'outcome' }
}

/**
 * 선택 결과를 본 뒤: 다음 단계로 가거나 객체 관리를 마무리한다.
 * 객체 관리는 한순간에 일어난다: 단계 사이에 시간이 흐르지 않고(그래서 관리 서술 사이에 시간의 서술이 끼지 않는다),
 * 그 단계의 `years`는 이 객체에 쓴 시간(`yearsSpent`)으로 쌓이기만 한다. 그 시간은 보고서를 본 뒤 한 해씩 흐른다.
 */
function continueFromOutcome(ctx: GameContext, state: GameState): GameState {
  const { progress, lastResult } = state
  if (state.phase !== 'outcome' || !progress || !lastResult) {
    throw new Error(`continue는 outcome/report/interludeOutcome 단계에서만 가능 (현재: ${state.phase})`)
  }
  const object = findObject(ctx, progress.objectId)
  const stage = object.stages[progress.stageIndex]

  const updatedProgress: ObjectProgress = { ...progress, yearsSpent: progress.yearsSpent + stage.years }
  const next: GameState = { ...state, progress: updatedProgress, events: [] }
  if (!lastResult.endsObject) {
    return { ...next, phase: 'choosing', progress: { ...updatedProgress, stageIndex: progress.stageIndex + 1 } }
  }
  return finalizeObject(next, object, updatedProgress, lastResult)
}

/**
 * 객체 관리 결과를 경력에 반영하고 보고서를 만든다.
 * 다음 객체가 배정될 나이(`nextObjectAge`)도 여기서 정한다: 이 객체를 배정받은 나이에서 시작 간격이 지난 때.
 * 객체에 쓴 시간(`yearsSpent`)이 간격보다 길었으면 그 시간이 다 흐른 뒤 최소 간격 뒤에 나온다.
 */
function finalizeObject(
  state: GameState,
  object: ContainmentObject,
  progress: ObjectProgress,
  lastResult: ChoiceResult,
): GameState {
  const age = state.player.age
  const demotedByViolation = lastResult.failureKind === 'demotion'
  const cleared = !demotedByViolation && isObjectCleared(object, progress.failures)
  const flawless = cleared && progress.failures === 0

  let career = recordObjectResult(state.player.career, cleared, flawless, progress.reassigned)
  let promoted = false
  let demoted = false
  let dismissed = false
  if (demotedByViolation) {
    const result = demote(career, age)
    career = result.career
    dismissed = result.dismissed
    demoted = !result.dismissed
  } else if (cleared && canPromote(career, state.player.stats)) {
    career = promote(career, age)
    promoted = true
  }

  const report: ObjectReport = {
    objectId: object.id,
    code: object.code,
    name: object.name,
    tier: object.tier,
    reassigned: progress.reassigned,
    outcome: demotedByViolation ? 'demoted' : cleared ? 'cleared' : 'failed',
    failures: progress.failures,
    flawless,
    yearsSpent: progress.yearsSpent,
    promoted,
    demoted,
    rankAfter: career.rank,
    // 객체 관리는 한순간에 일어나고 쓴 시간은 보고서 뒤에 흐르므로, 끝난 나이는 지금 나이에 쓴 시간을 더한 값이다.
    ageAtEnd: age + progress.yearsSpent,
  }

  const rng = createRng(state.rngState)
  const interval = Math.max(
    OBJECT_SCHEDULE.intervalYears + rng.int(-OBJECT_SCHEDULE.jitterYears, OBJECT_SCHEDULE.jitterYears),
    progress.yearsSpent + OBJECT_SCHEDULE.minGapAfterObject,
  )
  return {
    ...state,
    rngState: rng.getState(),
    phase: 'report',
    player: { ...state.player, career },
    managedCounts: { ...state.managedCounts, [object.id]: (state.managedCounts[object.id] ?? 0) + 1 },
    progress: null,
    history: [...state.history, report],
    rankLog: career.rank !== state.player.career.rank ? [...state.rankLog, { age, rank: career.rank }] : state.rankLog,
    pendingEnding: dismissed ? { kind: 'dismissed', age, objectId: object.id } : null,
    nextObjectAge: Math.max(age + OBJECT_SCHEDULE.minGapAfterObject, progress.startAge + interval),
  }
}

/** 보고서를 본 뒤: 다음 객체나 막간 이벤트가 나올 때까지 시간이 흐른다 ("관리하지 않는 해"의 서술이 나온다). */
function continueFromReport(ctx: GameContext, state: GameState): GameState {
  if (state.pendingEnding) {
    return finish(state, state.pendingEnding)
  }
  return runToEncounter(ctx, { ...state, events: [] })
}

// ───────────────────────── 막간 이벤트 ─────────────────────────

function chooseInterlude(ctx: GameContext, state: GameState, choiceId: string): GameState {
  const { interlude } = state
  if (state.phase !== 'interlude' || !interlude) {
    throw new Error(`막간 이벤트 선택은 interlude 단계에서만 가능 (현재: ${state.phase})`)
  }
  const def = findInterlude(ctx, interlude.eventId)
  const choice = def.choices.find((candidate) => candidate.id === choiceId)
  if (!choice) {
    throw new Error(`${def.id}에 없는 선택지: ${choiceId}`)
  }

  const rng = createRng(state.rngState)
  const { chance, success } = rollChoice(rng, choice, state.player.stats)
  const outcome = success ? choice.success : choice.failure
  const stats = applyOutcomeEffects(state.player.stats, outcome.effects)
  const extras = applyExtras(state.flags, state.relations, outcome)

  const result: InterludeResult = {
    eventId: def.id,
    choiceId: choice.id,
    chance,
    success,
    text: outcome.text,
    effects: outcome.effects,
    relations: outcome.relations,
  }
  const next: GameState = {
    ...state,
    rngState: rng.getState(),
    player: { ...state.player, stats },
    flags: extras.flags,
    relations: extras.relations,
    lastInterludeResult: result,
    interludeLog: [...state.interludeLog, { eventId: def.id, age: state.player.age, choiceId: choice.id, success }],
    choiceLog: [...state.choiceLog, { interludeId: def.id, choiceId: choice.id }],
    events: [],
  }

  const age = state.player.age
  if (stats.health <= 0) {
    return finish(next, { kind: 'death', deathCause: 'injury', age }, outcome.text)
  }
  if (stats.sanity <= 0) {
    return finish(next, { kind: 'breakdown', age }, outcome.text)
  }
  return { ...next, phase: 'interludeOutcome' }
}

/** 막간 이벤트 결과를 본 뒤: 다음 객체나 막간 이벤트가 나올 때까지 시간이 흐른다. 이벤트 자체는 시간을 쓰지 않는다. */
function continueFromInterlude(ctx: GameContext, state: GameState): GameState {
  if (state.phase !== 'interludeOutcome' || !state.interlude) {
    throw new Error(`continue는 outcome/report/interludeOutcome 단계에서만 가능 (현재: ${state.phase})`)
  }
  return runToEncounter(ctx, {
    ...state,
    interlude: null,
    lastInterludeResult: null,
    lastInterludeAge: state.player.age,
    events: [],
  })
}

// ───────────────────────── 시간 ─────────────────────────

/**
 * 시간을 한 해 흘린다. 나이가 하나 늘고, 그 해의 노화·병 판정, NPC 관계의 매년 효과, 승급 점수의 자동 누적(점수와 평판이
 * 차면 자동 승급), 그 해의 서술이 일어난다. 일어난 일은 `events`에 순서대로 쌓인다 (화면이 한 해씩 재생한다).
 * 체력이나 정신력이 0이 되거나 100세에 닿으면 판이 끝난다.
 */
function tickYear(ctx: GameContext, state: GameState, rng: Rng): GameState {
  const age = state.player.age + 1
  const objectId = state.progress?.objectId
  if (age >= MAX_AGE) {
    return finish({ ...state, player: { ...state.player, age: MAX_AGE } }, { kind: 'longevity', age: MAX_AGE, objectId })
  }

  const aging = applyYearlyAging(rng, age, state.player.stats)
  const stats = applyDelta(aging.stats, calcBondEffects(ctx.npcs ?? [], state.relations))

  // 승급 점수가 시간에 따라 저절로 쌓이고, 조건이 차면 자동으로 승급한다. 수석은 더 오를 곳이 없다.
  let career = state.player.career
  let promotion: GameEvent | null = null
  if (career.rank < 5) {
    career = { ...career, promotionPoints: career.promotionPoints + passivePromotionPoints(stats) }
    if (canPromote(career, stats)) {
      const from = career.rank
      career = promote(career, age)
      promotion = { type: 'promotion', age, from, to: career.rank }
    }
  }

  const aged: GameState = {
    ...state,
    player: { age, stats, career },
    rankLog: promotion ? [...state.rankLog, { age, rank: career.rank }] : state.rankLog,
  }
  // 서술 중에는 스탯·관계를 바꾸는 것이 있다. 차례로 적용하고(선택 결과와 같은 규칙: 상승분에 수확체감),
  // 화면에는 실제로 바뀐 값을 보여 주도록 서술 기록에 다시 적는다.
  let finalStats = stats
  let relations = state.relations
  const lines = pickYearLines(ctx, aged).map((entry): LifeLogEntry => {
    if (!entry.effects && !entry.relations) {
      return entry
    }
    const before = finalStats
    finalStats = applyOutcomeEffects(finalStats, entry.effects)
    relations = applyExtras([], relations, { relations: entry.relations }).relations
    const effects = statChanges(before, finalStats)
    return {
      id: entry.id,
      age: entry.age,
      kind: entry.kind,
      text: entry.text,
      ...(Object.keys(effects).length > 0 ? { effects } : {}),
      ...(entry.relations ? { relations: entry.relations } : {}),
    }
  })
  const yearEvents: GameEvent[] = [
    // 막은 그 해의 서술이 열기 전의 플래그로 센다: 막을 닫는 비트를 읽은 다음 해부터 다음 막으로 표시된다
    { type: 'year', age, stats: finalStats, rank: career.rank, points: career.promotionPoints, act: currentAct(aged.flags) },
    ...lines.map((entry) => ({ type: 'flow' as const, entry })),
    ...(aging.illness ? [{ type: 'illness' as const, age }] : []),
    ...(promotion ? [promotion] : []),
  ]
  const next: GameState = {
    ...aged,
    player: { ...aged.player, stats: finalStats },
    relations,
    // 이야기 비트가 켜는 플래그를 반영한다 (줄거리의 진행이 막간 이벤트·다른 서술의 조건이 된다)
    flags: [...new Set([...aged.flags, ...flagsSetBy(ctx, lines)])],
    lifeLog: [...aged.lifeLog, ...lines],
    events: [...aged.events, ...yearEvents],
  }

  if (finalStats.health <= 0) {
    return finish(next, { kind: 'death', deathCause: aging.illness ? 'illness' : 'aging', age, objectId })
  }
  if (finalStats.sanity <= 0) {
    return finish(next, { kind: 'breakdown', age, objectId })
  }
  return next
}

/** 두 스탯의 차이 (바뀐 항목만, 소수 첫째 자리까지). 서술이 실제로 바꾼 값을 기록하는 데 쓴다. */
function statChanges(before: Stats, after: Stats): StatDelta {
  const delta: StatDelta = {}
  for (const key of STAT_KEYS) {
    const change = Math.round((after[key] - before[key]) * 10) / 10
    if (change !== 0) {
      delta[key] = change
    }
  }
  return delta
}

/** 지금 팝업이 나올 때인지: 다음 객체가 배정될 나이에 닿았으면 객체 배정, 아니면 막간 이벤트가 나올 조건인지. */
function findEncounter(ctx: GameContext, state: GameState, rng: Rng): GameState | null {
  if (state.player.age >= state.nextObjectAge) {
    return assignObject(ctx, state, rng)
  }
  const def = pickYearlyInterlude(rng, ctx.interludes ?? [], state)
  if (def) {
    return { ...state, phase: 'interlude', interlude: { eventId: def.id }, lastInterludeResult: null }
  }
  return null
}

/** 다음 객체나 막간 이벤트가 나올 때까지 시간을 한 해씩 흘린다. 판이 끝나면 거기서 멈춘다. */
function runToEncounter(ctx: GameContext, state: GameState): GameState {
  const rng = createRng(state.rngState)
  let current = state
  for (let step = 0; step < MAX_AGE; step++) {
    const encounter = findEncounter(ctx, current, rng)
    if (encounter) {
      return { ...encounter, rngState: rng.getState() }
    }
    current = tickYear(ctx, current, rng)
    if (current.phase === 'ended') {
      break
    }
  }
  return { ...current, rngState: rng.getState() }
}

// ───────────────────────── 내부 도우미 ─────────────────────────

/** 흘러간 서술을 삶의 기록에 쌓고, 이번 전이의 이벤트(`events`)에도 실어 화면이 보여 줄 수 있게 한다. */
function appendFlow(state: GameState, entries: readonly LifeLogEntry[]): GameState {
  if (entries.length === 0) {
    return state
  }
  return {
    ...state,
    lifeLog: [...state.lifeLog, ...entries],
    events: [...state.events, ...entries.map((entry) => ({ type: 'flow' as const, entry }))],
  }
}

/** 수석이 된 지 충분히 지나고 3막 서술이 끝났거나(또는 오래 수석으로 지냈으면) 최종 객체가 열린다. */
function isFinaleOpen(state: GameState): boolean {
  const { career, age } = state.player
  if (career.rank !== 5) {
    return false
  }
  const years = age - career.rankSince
  return years >= FINALE.minYearsAtRank5 && (state.flags.includes(FINALE.storyFlag) || years >= FINALE.maxYearsAtRank5)
}

/** 다음 객체를 배정해 briefing 단계로 만든다. 배정할 객체가 없으면 퇴직으로 판이 끝난다. 난수 상태는 호출한 쪽이 저장한다. */
function assignObject(ctx: GameContext, state: GameState, rng: Rng): GameState {
  const clearedIds = new Set(
    state.history.filter((report) => report.outcome === 'cleared').map((report) => report.objectId),
  )
  const assignment = pickNextObject(
    rng,
    ctx.objects,
    state.player.career.rank,
    state.managedCounts,
    clearedIds,
    isFinaleOpen(state),
  )
  if (!assignment) {
    return finish(state, { kind: 'retired', age: state.player.age })
  }
  return {
    ...state,
    phase: 'briefing',
    progress: {
      objectId: assignment.object.id,
      reassigned: assignment.reassigned,
      knowledgeBonus: assignment.knowledgeBonus,
      stageIndex: 0,
      failures: 0,
      yearsSpent: 0,
      startAge: state.player.age,
    },
    lastResult: null,
    pendingEnding: null,
  }
}

/** @param scene 판이 끝난 원인이 된 선택의 결과 서술. 선택이 원인이 아니면 생략. */
function finish(state: GameState, ending: Ending, scene?: string): GameState {
  return { ...state, phase: 'ended', ending, pendingEnding: null, endingScene: scene ?? null }
}

// ───────────────────────── 리플레이 ─────────────────────────

/**
 * 시드와 선택 기록만으로 판을 다시 돌린다. 선택 기록이 끝났는데 판이 안 끝났으면 그 시점의 상태를 돌려준다.
 * 기록이 현재 객체·단계(또는 막간 이벤트)와 맞지 않으면 에러를 던진다 (조작되었거나 콘텐츠가 바뀐 경우).
 */
export function replayGame(
  ctx: GameContext,
  options: GameOptions,
  choices: readonly ChoiceLogEntry[],
): GameState {
  let state = createGame(ctx, options)
  let index = 0
  while (state.phase !== 'ended') {
    if (state.phase === 'briefing') {
      state = reduce(ctx, state, { type: 'begin' })
    } else if (state.phase === 'choosing' || state.phase === 'interlude') {
      if (index >= choices.length) {
        return state
      }
      const entry = choices[index]
      index += 1
      if (state.phase === 'interlude') {
        const def = getCurrentInterlude(ctx, state)
        if (!def || !('interludeId' in entry) || entry.interludeId !== def.id) {
          throw new Error(`리플레이 불일치: ${index}번째 선택은 막간 이벤트(${def?.id})여야 함`)
        }
      } else {
        const object = getCurrentObject(ctx, state)
        const stage = getCurrentStage(ctx, state)
        if (!object || !stage || !('objectId' in entry) || entry.objectId !== object.id || entry.stageId !== stage.id) {
          throw new Error(`리플레이 불일치: ${index}번째 선택은 ${object?.id}/${stage?.id}여야 함`)
        }
      }
      state = reduce(ctx, state, { type: 'choose', choiceId: entry.choiceId })
    } else {
      state = reduce(ctx, state, { type: 'continue' })
    }
  }
  return state
}
