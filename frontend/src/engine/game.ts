// 게임 상태 머신. React/DOM과 무관한 순수 TS이고, 모든 전이는 새 상태를 돌려준다 (기존 상태는 건드리지 않음).
//
// 흐름:
//   briefing --begin--> choosing --choose--> outcome --continue--> choosing (다음 단계)
//                                                              \-> report --continue--> briefing (다음 객체)
//   choose 중 즉사/사망/정신 붕괴/최종 엔딩, continue 중 노화·병 사망/100세, 해고(report 직후)면 ended
//
// 막간 이벤트: 마지막 이벤트 이후 일정 시간이 지났으면, 객체 보고서를 본 뒤(다음 객체 배정 전)나
// 긴 객체의 단계 사이에 끼어든다.
//   (report | outcome) --continue--> interlude --choose--> interludeOutcome --continue--> 원래 흐름 (briefing | choosing)
//
// 같은 시드와 같은 선택 기록이면 항상 같은 결과가 나온다 (`replayGame`으로 검증 가능).
import { pickNextObject } from './assignment'
import { ENTRY_AGE, MAX_AGE } from './config'
import { isInterludeDue, pickInterlude } from './interlude'
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
  crossedAges,
  demote,
  isObjectCleared,
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
  InterludeProgress,
  InterludeResult,
  ObjectProgress,
  ObjectReport,
} from './state'
import type {
  Choice,
  ContainmentObject,
  InterludeDef,
  NpcDef,
  PlayerState,
  StatDelta,
  Stage,
  Stats,
} from './types'

/** 게임이 참조하는 콘텐츠. 보통 `content/index.ts`의 `gameContext`를 넘긴다. */
export interface GameContext {
  objects: readonly ContainmentObject[]
  /** 막간 이벤트. 없으면 막간 이벤트 없이 객체 관리만 이어진다. */
  interludes?: readonly InterludeDef[]
  /** NPC. 관계 값에 따른 매년 효과(`bonds`) 계산에 쓴다. */
  npcs?: readonly NpcDef[]
}

export interface GameOptions {
  seed: number
  /** 입사 시점의 스탯. 인생 구간이 구현되면 그 결과를 넘긴다. 없으면 임시 기본값. */
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
  const player: PlayerState = {
    age: options.age ?? ENTRY_AGE,
    stats: options.stats ? { ...options.stats } : createInitialStats(),
    career: createCareer(),
  }
  const initial: GameState = {
    seed: options.seed,
    rngState: options.seed >>> 0,
    phase: 'ended',
    player,
    managedCounts: {},
    progress: null,
    lastResult: null,
    history: [],
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
    endingScene: null,
  }
  return assignNext(ctx, initial)
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

/** 선택 결과를 본 뒤: 단계에 걸리는 시간이 흐르고, 다음 단계로 가거나 객체 관리를 마무리한다. */
function continueFromOutcome(ctx: GameContext, state: GameState): GameState {
  const { progress, lastResult } = state
  if (state.phase !== 'outcome' || !progress || !lastResult) {
    throw new Error(`continue는 outcome/report/interludeOutcome 단계에서만 가능 (현재: ${state.phase})`)
  }
  const object = findObject(ctx, progress.objectId)
  const stage = object.stages[progress.stageIndex]

  const rng = createRng(state.rngState)
  const time = advanceTime(rng, state.player, stage.years, calcBondEffects(ctx.npcs ?? [], state.relations))
  const updatedProgress: ObjectProgress = { ...progress, yearsSpent: progress.yearsSpent + stage.years }
  const next: GameState = {
    ...state,
    rngState: rng.getState(),
    player: time.player,
    progress: updatedProgress,
    events: time.events,
  }

  if (time.ending) {
    return finish(next, { ...time.ending, objectId: object.id })
  }
  if (!lastResult.endsObject) {
    const resumed: GameState = {
      ...next,
      phase: 'choosing',
      progress: { ...updatedProgress, stageIndex: progress.stageIndex + 1 },
    }
    // 긴 객체는 단계 사이에도 막간 이벤트가 낄 수 있다.
    return startInterlude(ctx, resumed, 'choosing') ?? resumed
  }
  return finalizeObject(next, object, updatedProgress, lastResult)
}

/** 객체 관리 결과를 경력에 반영하고 보고서를 만든다. */
function finalizeObject(
  state: GameState,
  object: ContainmentObject,
  progress: ObjectProgress,
  lastResult: ChoiceResult,
): GameState {
  const demotedByViolation = lastResult.failureKind === 'demotion'
  const cleared = !demotedByViolation && isObjectCleared(object, progress.failures)
  const flawless = cleared && progress.failures === 0

  let career = recordObjectResult(state.player.career, cleared, flawless, progress.reassigned)
  let promoted = false
  let demoted = false
  let dismissed = false
  if (demotedByViolation) {
    const result = demote(career)
    career = result.career
    dismissed = result.dismissed
    demoted = !result.dismissed
  } else if (cleared && canPromote(career, state.player.stats)) {
    career = promote(career)
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
    ageAtEnd: state.player.age,
  }
  return {
    ...state,
    phase: 'report',
    player: { ...state.player, career },
    managedCounts: { ...state.managedCounts, [object.id]: (state.managedCounts[object.id] ?? 0) + 1 },
    progress: null,
    history: [...state.history, report],
    pendingEnding: dismissed ? { kind: 'dismissed', age: state.player.age, objectId: object.id } : null,
  }
}

function continueFromReport(ctx: GameContext, state: GameState): GameState {
  if (state.pendingEnding) {
    return finish(state, state.pendingEnding)
  }
  return startInterlude(ctx, state, 'assign') ?? assignNext(ctx, state)
}

// ───────────────────────── 막간 이벤트 ─────────────────────────

/**
 * 막간 이벤트를 끼울 때가 됐고 나올 수 있는 이벤트가 있으면 interlude 단계로 넘어간 상태를 돌려준다.
 * 아니면 null (난수도 쓰지 않으므로 상태는 그대로다).
 */
function startInterlude(ctx: GameContext, state: GameState, resume: InterludeProgress['resume']): GameState | null {
  const defs = ctx.interludes ?? []
  if (defs.length === 0 || !isInterludeDue(state)) {
    return null
  }
  const rng = createRng(state.rngState)
  const def = pickInterlude(rng, defs, state)
  if (!def) {
    return null
  }
  return {
    ...state,
    rngState: rng.getState(),
    phase: 'interlude',
    interlude: { eventId: def.id, resume },
    lastInterludeResult: null,
    events: [],
  }
}

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
    interludeLog: [
      ...state.interludeLog,
      { eventId: def.id, age: state.player.age, choiceId: choice.id, success },
    ],
    choiceLog: [...state.choiceLog, { interludeId: def.id, choiceId: choice.id }],
    events: [],
  }

  const age = state.player.age
  const objectId = state.progress?.objectId
  if (stats.health <= 0) {
    return finish(next, { kind: 'death', deathCause: 'injury', age, objectId }, outcome.text)
  }
  if (stats.sanity <= 0) {
    return finish(next, { kind: 'breakdown', age, objectId }, outcome.text)
  }
  return { ...next, phase: 'interludeOutcome' }
}

/** 막간 이벤트 결과를 본 뒤: 이벤트에 드는 시간이 흐르고, 원래 흐름(다음 객체 배정 / 객체의 다음 단계)으로 돌아간다. */
function continueFromInterlude(ctx: GameContext, state: GameState): GameState {
  const { interlude } = state
  if (state.phase !== 'interludeOutcome' || !interlude) {
    throw new Error(`continue는 outcome/report/interludeOutcome 단계에서만 가능 (현재: ${state.phase})`)
  }
  const def = findInterlude(ctx, interlude.eventId)
  const rng = createRng(state.rngState)
  const time = advanceTime(rng, state.player, def.years ?? 0, calcBondEffects(ctx.npcs ?? [], state.relations))
  const next: GameState = {
    ...state,
    rngState: rng.getState(),
    player: time.player,
    events: time.events,
    interlude: null,
    lastInterludeAge: time.player.age,
  }
  if (time.ending) {
    return finish(next, { ...time.ending, objectId: state.progress?.objectId })
  }
  if (interlude.resume === 'assign') {
    return assignNext(ctx, next)
  }
  return { ...next, phase: 'choosing' }
}

// ───────────────────────── 내부 도우미 ─────────────────────────

function assignNext(ctx: GameContext, state: GameState): GameState {
  const rng = createRng(state.rngState)
  const clearedIds = new Set(
    state.history.filter((report) => report.outcome === 'cleared').map((report) => report.objectId),
  )
  const assignment = pickNextObject(rng, ctx.objects, state.player.career.rank, state.managedCounts, clearedIds)
  const withRng: GameState = { ...state, rngState: rng.getState(), events: [] }
  if (!assignment) {
    return finish(withRng, { kind: 'retired', age: state.player.age })
  }
  return {
    ...withRng,
    phase: 'briefing',
    progress: {
      objectId: assignment.object.id,
      reassigned: assignment.reassigned,
      knowledgeBonus: assignment.knowledgeBonus,
      stageIndex: 0,
      failures: 0,
      yearsSpent: 0,
    },
    lastResult: null,
    pendingEnding: null,
  }
}

/** @param scene 판이 끝난 원인이 된 선택의 결과 서술. 선택이 원인이 아니면 생략. */
function finish(state: GameState, ending: Ending, scene?: string): GameState {
  return { ...state, phase: 'ended', ending, pendingEnding: null, endingScene: scene ?? null }
}

/**
 * 시간을 `years`만큼 흘려보낸다. 해가 바뀔 때마다(정수 나이에 도달할 때마다) 노화·병을 판정하고
 * NPC와의 관계가 주는 매년 효과(`bondYearly`)를 더한다. 체력이나 정신력이 0이 되거나 100세에 닿으면
 * 거기서 멈추고 종료를 알려 준다.
 */
function advanceTime(
  rng: Rng,
  player: PlayerState,
  years: number,
  bondYearly: StatDelta,
): { player: PlayerState; events: GameEvent[]; ending: Ending | null } {
  const targetAge = player.age + years
  const events: GameEvent[] = []
  let stats = player.stats

  for (const age of crossedAges(player.age, targetAge)) {
    if (age >= MAX_AGE) {
      return { player: { ...player, age: MAX_AGE, stats }, events, ending: { kind: 'longevity', age: MAX_AGE } }
    }
    const aging = applyYearlyAging(rng, age, stats)
    stats = applyDelta(aging.stats, bondYearly)
    if (aging.illness) {
      events.push({ type: 'illness', age })
    }
    if (stats.health <= 0) {
      return {
        player: { ...player, age, stats },
        events,
        ending: { kind: 'death', deathCause: aging.illness ? 'illness' : 'aging', age },
      }
    }
    if (stats.sanity <= 0) {
      return { player: { ...player, age, stats }, events, ending: { kind: 'breakdown', age } }
    }
  }
  return { player: { ...player, age: targetAge, stats }, events, ending: null }
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
