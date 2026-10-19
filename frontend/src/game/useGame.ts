import { useCallback, useEffect, useReducer } from 'react'
import { gameContext } from '../content'
import { createGame, reduce } from '../engine/game'
import type { GameAction } from '../engine/game'
import type { GameState } from '../engine/state'
import type { StatDelta } from '../engine/types'
import { diffStats, randomSeed } from './format'
import { buildRecord, clearGame, loadGame, saveGame, saveRecord } from './storage'

/** 엔진 상태와, 직전 전이에서 실제로 바뀐 스탯(수확체감까지 반영된 값). 결과 화면에서 변화량을 보여 준다. */
interface GameView {
  game: GameState
  delta: StatDelta
}

type GameMessage = GameAction | { type: 'reset'; seed: number }

export interface StartOptions {
  /** 지정하면 그 시드로 새 판을 시작한다 (같은 시드 + 같은 선택이면 같은 결과) */
  seed?: number
  /** true면 저장본을 무시하고 새 판을 시작한다 */
  fresh?: boolean
}

function freshView(seed: number): GameView {
  return { game: createGame(gameContext, { seed }), delta: {} }
}

function init(options: StartOptions): GameView {
  if (options.seed !== undefined) {
    return freshView(options.seed)
  }
  if (!options.fresh) {
    const saved = loadGame()
    if (saved) {
      return { game: saved, delta: {} }
    }
  }
  return freshView(randomSeed())
}

function reducer(view: GameView, message: GameMessage): GameView {
  if (message.type === 'reset') {
    return freshView(message.seed)
  }
  const game = reduce(gameContext, view.game, message)
  return { game, delta: diffStats(view.game.player.stats, game.player.stats) }
}

/** 엔진 상태 머신을 React에 연결한다. 진행 중인 판은 자동 저장되고, 끝난 판은 기록으로 남는다. */
export function useGame(options: StartOptions) {
  const [view, dispatch] = useReducer(reducer, options, init)

  useEffect(() => {
    if (view.game.phase === 'ended') {
      clearGame()
      const record = buildRecord(view.game)
      if (record) {
        saveRecord(record)
      }
    } else {
      saveGame(view.game)
    }
  }, [view.game])

  const act = useCallback((action: GameAction) => dispatch(action), [])
  const restart = useCallback((seed?: number) => dispatch({ type: 'reset', seed: seed ?? randomSeed() }), [])

  return { game: view.game, delta: view.delta, act, restart }
}
