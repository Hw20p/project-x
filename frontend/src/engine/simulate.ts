// 밸런스 확인용 자동 플레이. 봇이 선택지를 골라 엔진을 끝까지 돌리고, 수천 판의 결과를 집계한다.
// 게임 로직은 건드리지 않고 `game.ts`의 공개 함수만 쓴다.
import { ENTRY_AGE } from './config'
import { createGame, getChoiceOptions, reduce } from './game'
import type { ChoiceOption, GameContext, GameOptions } from './game'
import { createRng } from './rng'
import type { Rng } from './rng'
import type { DeathCause, EndingKind, GameState } from './state'
import type { InterludeKind, Rank } from './types'

/**
 * 봇 전략
 * - safest  : 항상 성공 확률이 가장 높은 선택지
 * - balanced: 성공 확률이 중간인 선택지
 * - riskiest: 항상 성공 확률이 가장 낮은 선택지 (하이리스크 하이리턴)
 * - random  : 무작위
 * - bonding : 관계 이벤트에서는 성공 시 NPC 관계가 가장 많이 오르는 선택지, 그 밖에는 안전 우선.
 *             관계로 이어지는 이야기(사직서·선임의 서랍 등)에 실제로 도달할 수 있는지 확인하는 용도.
 */
export type BaseStrategy = 'safest' | 'balanced' | 'riskiest' | 'random' | 'bonding'

/**
 * 엔딩 선호 봇 — `ending:<엔딩 id>`. 최종 객체 전까지는 안전 우선으로 플레이하다가,
 * 선택지 중 그 엔딩이 걸린 것(`success.endingId`가 같은 것)이 있으면 그걸 고른다.
 * 엔딩별로 "그 엔딩을 노렸을 때 실제로 얼마나 도달하는가"를 보기 위한 봇이다.
 */
export type EndingBot = `ending:${string}`

export type BotStrategy = BaseStrategy | EndingBot

export const BASE_STRATEGIES: readonly BaseStrategy[] = ['safest', 'balanced', 'riskiest', 'random', 'bonding']

const ENDING_BOT_PREFIX = 'ending:'

export function endingBot(endingId: string): EndingBot {
  return `${ENDING_BOT_PREFIX}${endingId}`
}

export function isEndingBot(strategy: BotStrategy): strategy is EndingBot {
  return strategy.startsWith(ENDING_BOT_PREFIX)
}

export const BOT_LABELS: Record<BaseStrategy, string> = {
  safest: '안전 우선 (성공 확률 최고)',
  balanced: '중간 위험',
  riskiest: '모험 (성공 확률 최저)',
  random: '무작위',
  bonding: '관계 중시 (관계가 가장 오르는 선택)',
}

/** 화면·리포트에 보여 줄 봇 이름. 엔딩 선호 봇은 엔딩 제목을 붙인다. */
export function botLabel(strategy: BotStrategy, endingTitles: Readonly<Record<string, string>> = {}): string {
  if (isEndingBot(strategy)) {
    const endingId = strategy.slice(ENDING_BOT_PREFIX.length)
    return `엔딩 선호: ${endingTitles[endingId] ?? endingId}`
  }
  return BOT_LABELS[strategy]
}

const RANKS: readonly Rank[] = [1, 2, 3, 4, 5]
const ENDING_KINDS: readonly EndingKind[] = ['death', 'breakdown', 'dismissed', 'retired', 'longevity', 'finale']
const DEATH_CAUSES: readonly DeathCause[] = ['instant', 'injury', 'illness', 'aging']
/** 무한 루프 방지. 정상적인 한 판은 수백 스텝을 넘지 않는다. */
const MAX_STEPS = 100_000

export interface Distribution {
  min: number
  p10: number
  median: number
  p90: number
  max: number
  mean: number
}

export interface ObjectStat {
  objectId: string
  code: string
  name: string
  tier: Rank
  /** 배정된 횟수 (끝까지 못 간 것 포함) */
  assigned: number
  cleared: number
  failed: number
  demoted: number
  /** 이 객체 관리 중 즉사하거나 입은 피해로 사망한 횟수 */
  killed: number
  /** 이 객체 관리 중 정신 붕괴한 횟수 */
  brokeDown: number
  /** 관리 도중 병·노화·100세로 끝난 횟수 */
  unfinished: number
}

/** 막간 이벤트 하나의 집계 */
export interface InterludeStat {
  eventId: string
  title: string
  kind: InterludeKind
  /** 전체 판에서 나온 횟수 */
  taken: number
  /** 판당 평균 횟수 */
  perGame: number
  /** 그 이벤트에서 고른 선택이 성공한 비율 (0~1). 나온 적이 없으면 0. */
  successRate: number
}

/** NPC 관계 집계 */
export interface NpcStat {
  npcId: string
  name: string
  /** 한 번이라도 관계 이벤트가 일어나 관계 값이 생긴 판의 비율 (0~1) */
  metRate: number
  /** 만난 판들의 종료 시점 평균 관계 값. 만난 판이 없으면 0. */
  avgRelation: number
}

export interface SimulationSummary {
  strategy: BotStrategy
  games: number
  /** 판당 평균 선택 횟수 (객체 단계 선택 + 막간 이벤트 선택). 선택 피로를 재는 값 */
  avgChoices: number
  /** 판당 평균 막간 이벤트 횟수 */
  avgInterludes: number
  /** 종류별 판당 평균 막간 이벤트 횟수 */
  interludesByKind: Record<InterludeKind, number>
  interludeStats: InterludeStat[]
  npcStats: NpcStat[]
  /** 종료 시점 나이 */
  endAge: Distribution
  /** 입사 후 경과 년수 */
  careerYears: Distribution
  endings: Record<EndingKind, number>
  /** 최종 객체가 한 번이라도 배정된 판 수 */
  finaleReached: number
  /** 최종 객체로 끝난 판의 엔딩 id별 판 수 */
  finaleEndings: Record<string, number>
  deathCauses: Record<DeathCause, number>
  /** 종료 시점의 직급별 판 수 */
  finalRank: Record<Rank, number>
  /** 한 번이라도 그 직급 이상에 오른 판의 비율 (0~1) */
  reachedRank: Record<Rank, number>
  /** 입사 후 처음 그 직급에 오르기까지 걸린 평균 년수 (도달한 판만 대상) */
  yearsToRank: Partial<Record<Rank, number>>
  /** 판당 평균 관리 완료 객체 수 */
  avgObjectsManaged: number
  /** 관리를 끝낸 객체 중 성공 비율 (0~1) */
  clearRate: number
  /** 관리를 끝낸 객체 중 재배정 비율 (0~1) */
  reassignRate: number
  objects: ObjectStat[]
}

function pickChoiceId(strategy: BotStrategy, options: readonly ChoiceOption[], botRng: Rng): string {
  if (isEndingBot(strategy)) {
    const targetId = strategy.slice(ENDING_BOT_PREFIX.length)
    const target = options.find((option) => option.choice.success.endingId === targetId)
    return target ? target.choice.id : pickByStrategy('safest', options, botRng)
  }
  return pickByStrategy(strategy, options, botRng)
}

function pickByStrategy(strategy: BaseStrategy, options: readonly ChoiceOption[], botRng: Rng): string {
  if (strategy === 'bonding') {
    // 관계가 가장 오르는 선택을 고르되, 실패하면 즉사하거나 좌천(관리 중단)되는 선택은 피한다
    // ("관계를 쌓지만 직급과 목숨을 걸지는 않는" 봇). 객체 선택지에도 관계 변화가 생기면서, 즉사 선택지(예: 합창에 내
    // 이름을 내어줌)와 좌천 선택지(예: X-009 근무자 교대)가 관계를 가장 많이 올려 이 봇이 스스로 무너지는 문제가
    // 생겨서 걸러 낸다. 실패가 setback인 선택만 고른다.
    const relationGain = (option: ChoiceOption) =>
      Object.values(option.choice.success.relations ?? {}).reduce((sum, change) => sum + change, 0)
    const careful = options.filter((option) => option.choice.failure.kind === 'setback')
    const pool = careful.length > 0 ? careful : options
    const best = pool.reduce((top, option) => (relationGain(option) > relationGain(top) ? option : top))
    return relationGain(best) > 0 ? best.choice.id : pickByStrategy('safest', options, botRng)
  }
  if (strategy === 'random') {
    return options[botRng.int(0, options.length - 1)].choice.id
  }
  const sorted = [...options].sort((a, b) => b.chance - a.chance)
  let index = Math.floor((sorted.length - 1) / 2)
  if (strategy === 'safest') {
    index = 0
  } else if (strategy === 'riskiest') {
    index = sorted.length - 1
  }
  return sorted[index].choice.id
}

/** 봇 하나가 한 판을 끝까지 플레이한다. 같은 (전략, 시드, 옵션)이면 항상 같은 결과. */
export function playGame(
  ctx: GameContext,
  strategy: BotStrategy,
  seed: number,
  base: Omit<GameOptions, 'seed'> = {},
): GameState {
  // 봇의 선택용 난수는 게임 난수와 분리해서, 게임 쪽 난수열을 건드리지 않는다.
  const botRng = createRng(seed ^ 0x9e3779b9)
  let state = createGame(ctx, { ...base, seed })
  let steps = 0
  while (state.phase !== 'ended') {
    steps += 1
    if (steps > MAX_STEPS) {
      throw new Error(`시뮬레이션이 끝나지 않음 (seed=${seed}, phase=${state.phase})`)
    }
    if (state.phase === 'briefing') {
      state = reduce(ctx, state, { type: 'begin' })
    } else if (state.phase === 'choosing' || state.phase === 'interlude') {
      const choiceId = pickChoiceId(strategy, getChoiceOptions(ctx, state), botRng)
      state = reduce(ctx, state, { type: 'choose', choiceId })
    } else {
      state = reduce(ctx, state, { type: 'continue' })
    }
  }
  return state
}

function describe(values: number[]): Distribution {
  if (values.length === 0) {
    return { min: 0, p10: 0, median: 0, p90: 0, max: 0, mean: 0 }
  }
  const sorted = [...values].sort((a, b) => a - b)
  const at = (p: number) => sorted[Math.floor(p * (sorted.length - 1))]
  const sum = sorted.reduce((total, value) => total + value, 0)
  return {
    min: sorted[0],
    p10: at(0.1),
    median: at(0.5),
    p90: at(0.9),
    max: sorted[sorted.length - 1],
    mean: sum / sorted.length,
  }
}

function zeroCounts<K extends string>(keys: readonly K[]): Record<K, number> {
  const counts = {} as Record<K, number>
  for (const key of keys) {
    counts[key] = 0
  }
  return counts
}

function zeroRankCounts(): Record<Rank, number> {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
}

/**
 * 같은 전략으로 `games`판을 돌려 결과를 집계한다.
 * 판마다 시드를 다르게 파생하고, 같은 `baseSeed`면 항상 같은 집계가 나온다.
 */
export function simulate(
  ctx: GameContext,
  strategy: BotStrategy,
  games: number,
  baseSeed = 1,
  base: Omit<GameOptions, 'seed'> = {},
): SimulationSummary {
  const startAge = base.age ?? ENTRY_AGE
  const endAges: number[] = []
  const careerYears: number[] = []
  const endings = zeroCounts(ENDING_KINDS)
  const finaleEndings: Record<string, number> = {}
  const finaleObjectIds = new Set(ctx.objects.filter((object) => object.finale).map((object) => object.id))
  let finaleReached = 0
  const deathCauses = zeroCounts(DEATH_CAUSES)
  const finalRank = zeroRankCounts()
  const reachedCount = zeroRankCounts()
  const yearsToRankSum = zeroRankCounts()
  const yearsToRankCount = zeroRankCounts()
  let totalManaged = 0
  let totalCleared = 0
  let totalReassigned = 0

  const interludeTaken = new Map<string, { taken: number; succeeded: number }>()
  const interludeKinds = new Map((ctx.interludes ?? []).map((def) => [def.id, def] as const))
  const interludesByKind: Record<InterludeKind, number> = { recovery: 0, growth: 0, relationship: 0 }
  let totalInterludes = 0
  let totalChoices = 0
  const npcMet = new Map<string, { met: number; relationSum: number }>()

  const objectStats = new Map<string, ObjectStat>()
  for (const object of ctx.objects) {
    objectStats.set(object.id, {
      objectId: object.id,
      code: object.code,
      name: object.name,
      tier: object.tier,
      assigned: 0,
      cleared: 0,
      failed: 0,
      demoted: 0,
      killed: 0,
      brokeDown: 0,
      unfinished: 0,
    })
  }

  for (let i = 0; i < games; i++) {
    const seed = (baseSeed + Math.imul(i + 1, 0x9e3779b1)) >>> 0
    const state = playGame(ctx, strategy, seed, base)
    const { ending } = state
    if (!ending) {
      throw new Error(`종료 정보가 없는 게임 (seed=${seed})`)
    }

    endAges.push(ending.age)
    careerYears.push(ending.age - startAge)
    endings[ending.kind] += 1
    if (ending.deathCause) {
      deathCauses[ending.deathCause] += 1
    }
    if (ending.endingId) {
      finaleEndings[ending.endingId] = (finaleEndings[ending.endingId] ?? 0) + 1
    }
    // 최종 객체를 맡은 적이 있는지: 끝난 보고서에 있거나, 맡고 있던 도중에 판이 끝난 경우
    const reachedFinale =
      state.history.some((report) => finaleObjectIds.has(report.objectId)) ||
      (ending.objectId !== undefined && finaleObjectIds.has(ending.objectId))
    if (reachedFinale) {
      finaleReached += 1
    }
    finalRank[state.player.career.rank] += 1
    totalChoices += state.choiceLog.length

    for (const record of state.interludeLog) {
      totalInterludes += 1
      const tally = interludeTaken.get(record.eventId) ?? { taken: 0, succeeded: 0 }
      tally.taken += 1
      if (record.success) {
        tally.succeeded += 1
      }
      interludeTaken.set(record.eventId, tally)
      const def = interludeKinds.get(record.eventId)
      if (def) {
        interludesByKind[def.kind] += 1
      }
    }
    for (const [npcId, relation] of Object.entries(state.relations)) {
      const tally = npcMet.get(npcId) ?? { met: 0, relationSum: 0 }
      tally.met += 1
      tally.relationSum += relation
      npcMet.set(npcId, tally)
    }

    // 직급 도달: 승급은 시간이 흐르며 저절로도 일어나므로 보고서가 아니라 직급 기록(rankLog)으로 센다
    let maxRank: Rank = 1
    const firstReached = new Set<Rank>()
    for (const record of state.rankLog) {
      if (record.rank > maxRank) {
        maxRank = record.rank
      }
      if (record.rank > 1 && !firstReached.has(record.rank)) {
        firstReached.add(record.rank)
        yearsToRankSum[record.rank] += record.age - startAge
        yearsToRankCount[record.rank] += 1
      }
    }
    for (const report of state.history) {
      totalManaged += 1
      if (report.outcome === 'cleared') {
        totalCleared += 1
      }
      if (report.reassigned) {
        totalReassigned += 1
      }

      const stat = objectStats.get(report.objectId)
      if (stat) {
        stat.assigned += 1
        if (report.outcome === 'cleared') {
          stat.cleared += 1
        } else if (report.outcome === 'failed') {
          stat.failed += 1
        } else {
          stat.demoted += 1
        }
      }
    }
    for (const rank of RANKS) {
      if (maxRank >= rank) {
        reachedCount[rank] += 1
      }
    }

    // 관리 도중에 끝난 판은 보고서가 없으므로 종료 정보로 그 객체에 귀속한다. (해고는 이미 보고서가 있음)
    if (ending.objectId && ending.kind !== 'dismissed') {
      const stat = objectStats.get(ending.objectId)
      if (stat) {
        stat.assigned += 1
        if (ending.kind === 'finale') {
          stat.cleared += 1
        } else if (ending.kind === 'breakdown') {
          stat.brokeDown += 1
        } else if (ending.deathCause === 'instant' || ending.deathCause === 'injury') {
          stat.killed += 1
        } else {
          stat.unfinished += 1
        }
      }
    }
  }

  const reachedRank = zeroRankCounts()
  const yearsToRank: Partial<Record<Rank, number>> = {}
  for (const rank of RANKS) {
    reachedRank[rank] = games > 0 ? reachedCount[rank] / games : 0
    if (yearsToRankCount[rank] > 0) {
      yearsToRank[rank] = yearsToRankSum[rank] / yearsToRankCount[rank]
    }
  }

  const perGame = (count: number) => (games > 0 ? count / games : 0)
  const interludeStats: InterludeStat[] = (ctx.interludes ?? []).map((def) => {
    const tally = interludeTaken.get(def.id) ?? { taken: 0, succeeded: 0 }
    return {
      eventId: def.id,
      title: def.title,
      kind: def.kind,
      taken: tally.taken,
      perGame: perGame(tally.taken),
      successRate: tally.taken > 0 ? tally.succeeded / tally.taken : 0,
    }
  })
  const npcStats: NpcStat[] = (ctx.npcs ?? []).map((npc) => {
    const tally = npcMet.get(npc.id) ?? { met: 0, relationSum: 0 }
    return {
      npcId: npc.id,
      name: npc.name,
      metRate: perGame(tally.met),
      avgRelation: tally.met > 0 ? tally.relationSum / tally.met : 0,
    }
  })

  return {
    strategy,
    games,
    avgChoices: perGame(totalChoices),
    avgInterludes: perGame(totalInterludes),
    interludesByKind: {
      recovery: perGame(interludesByKind.recovery),
      growth: perGame(interludesByKind.growth),
      relationship: perGame(interludesByKind.relationship),
    },
    interludeStats,
    npcStats,
    endAge: describe(endAges),
    careerYears: describe(careerYears),
    endings,
    finaleReached,
    finaleEndings,
    deathCauses,
    finalRank,
    reachedRank,
    yearsToRank,
    avgObjectsManaged: games > 0 ? totalManaged / games : 0,
    clearRate: totalManaged > 0 ? totalCleared / totalManaged : 0,
    reassignRate: totalManaged > 0 ? totalReassigned / totalManaged : 0,
    objects: [...objectStats.values()].sort((a, b) => a.code.localeCompare(b.code)),
  }
}
