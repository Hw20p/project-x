import { useCallback, useEffect, useReducer } from 'react'
import { gameContext } from '../content'
import { createGame, reduce } from '../engine/game'
import type { GameAction } from '../engine/game'
import type { GameState } from '../engine/state'
import type { StatDelta } from '../engine/types'
import { appendFeed, describeTransition } from './feed'
import type { FeedItem } from './feed'
import { diffStats, randomSeed } from './format'
import { buildRecord, clearGame, loadGame, saveGame, saveRecord } from './storage'

/**
 * 엔진 상태와 부가 정보.
 * 새 판은 시드가 먼저 정해지고(`seed`), 입사 배경을 고르면(`start`) 그 시드로 판이 시작된다.
 */
interface GameView {
  /** null이면 아직 입사 배경을 고르는 중 */
  game: GameState | null
  /** 이 판(배경을 고르는 중이면 곧 시작할 판)의 시드 */
  seed: number
  /** 직전 전이에서 실제로 바뀐 스탯(수확체감까지 반영된 값) */
  delta: StatDelta
  /** 지금까지 쌓인 줄거리 스트림 (오래된 순) */
  feed: FeedItem[]
  /** 저장본을 이어 한 판인지. 그렇다면 쌓인 줄거리를 애니메이션 없이 바로 보여 준다. */
  resumed: boolean
}

type GameMessage =
  | GameAction
  | { type: 'start'; backgroundId: string }
  | { type: 'reset'; seed: number }

export interface StartOptions {
  /** 지정하면 그 시드로 새 판을 시작한다 (같은 시드 + 같은 배경 + 같은 선택이면 같은 결과) */
  seed?: number
  /** 시드와 함께 지정하면 배경 선택 화면을 건너뛰고 바로 시작한다 */
  backgroundId?: string
  /** true면 저장본을 무시하고 새 판을 시작한다 */
  fresh?: boolean
}

function startGame(seed: number, backgroundId: string): GameView {
  const game = createGame(gameContext, { seed, backgroundId })
  return { game, seed, delta: {}, feed: appendFeed([], describeTransition(gameContext, null, game, {})), resumed: false }
}

function init(options: StartOptions): GameView {
  if (options.seed !== undefined && options.backgroundId) {
    return startGame(options.seed, options.backgroundId)
  }
  if (options.seed !== undefined) {
    return { game: null, seed: options.seed, delta: {}, feed: [], resumed: false }
  }
  if (!options.fresh) {
    const saved = loadGame()
    if (saved) {
      return { game: saved.state, seed: saved.state.seed, delta: {}, feed: saved.feed, resumed: true }
    }
  }
  return { game: null, seed: randomSeed(), delta: {}, feed: [], resumed: false }
}

function reducer(view: GameView, message: GameMessage): GameView {
  if (message.type === 'reset') {
    return { game: null, seed: message.seed, delta: {}, feed: [], resumed: false }
  }
  if (message.type === 'start') {
    return startGame(view.seed, message.backgroundId)
  }
  if (!view.game) {
    return view
  }
  const game = reduce(gameContext, view.game, message)
  const delta = diffStats(view.game.player.stats, game.player.stats)
  return {
    ...view,
    game,
    delta,
    feed: appendFeed(view.feed, describeTransition(gameContext, view.game, game, delta)),
  }
}

/**
 * 엔진 상태 머신을 React에 연결한다. 진행 중인 판은 줄거리 스트림과 함께 자동 저장되고, 끝난 판은 기록으로 남는다.
 * 배경을 고르는 중(`game`이 null)에는 이전 저장본을 지운다 (새 판을 시작하겠다는 뜻이므로).
 */
export function useGame(options: StartOptions) {
  const [view, dispatch] = useReducer(reducer, options, init)

  useEffect(() => {
    const { game, feed } = view
    if (!game) {
      clearGame()
    } else if (game.phase === 'ended') {
      clearGame()
      const record = buildRecord(game)
      if (record) {
        saveRecord(record)
      }
    } else {
      saveGame(game, feed)
    }
  }, [view.game, view.feed])

  const act = useCallback((action: GameAction) => dispatch(action), [])
  const start = useCallback((backgroundId: string) => dispatch({ type: 'start', backgroundId }), [])
  const restart = useCallback((seed?: number) => dispatch({ type: 'reset', seed: seed ?? randomSeed() }), [])

  return { game: view.game, seed: view.seed, delta: view.delta, feed: view.feed, resumed: view.resumed, act, start, restart }
}
