// 진행 중인 판과 끝난 판의 기록을 브라우저(localStorage)에 보관한다. 서버는 없다.
// 저장소를 못 쓰는 환경(사생활 보호 모드 등)이어도 게임은 돌아가야 하므로 모든 접근을 try/catch로 감싼다.
import { gameContext } from '../content'
import { findInterlude, findObject } from '../engine/game'
import type { DeathCause, EndingKind, GameState } from '../engine/state'
import type { Rank } from '../engine/types'
import type { FeedItem } from './feed'

const GAME_KEY = 'lifesim:game'
const RECORDS_KEY = 'lifesim:records'
const SAVE_VERSION = 4
const MAX_RECORDS = 10

/** 콘텐츠(객체·이벤트 구성)가 바뀌면 이전 저장본을 이어 하지 못하게 하는 서명 */
function contentSignature(): string {
  const parts = [
    ...gameContext.objects.map((object) => `${object.id}:${object.stages.length}`),
    ...(gameContext.interludes ?? []).map((def) => def.id),
  ]
  let hash = 5381
  for (const char of parts.join('|')) {
    hash = ((hash * 33) ^ char.charCodeAt(0)) >>> 0
  }
  return hash.toString(36)
}

/** 이어 할 수 있는 저장본: 엔진 상태와 지금까지 쌓인 줄거리 스트림 */
export interface SavedGame {
  state: GameState
  feed: FeedItem[]
}

export function saveGame(state: GameState, feed: readonly FeedItem[]): void {
  try {
    localStorage.setItem(
      GAME_KEY,
      JSON.stringify({ version: SAVE_VERSION, signature: contentSignature(), state, feed }),
    )
  } catch {
    // 저장은 편의 기능이라 실패해도 무시한다.
  }
}

export function clearGame(): void {
  try {
    localStorage.removeItem(GAME_KEY)
  } catch {
    // 무시
  }
}

/** 이어 할 수 있는 저장본. 없거나 현재 콘텐츠와 안 맞으면 null. */
export function loadGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(GAME_KEY)
    if (!raw) {
      return null
    }
    const saved = JSON.parse(raw) as {
      version?: number
      signature?: string
      state?: GameState
      feed?: FeedItem[]
    }
    if (
      saved.version !== SAVE_VERSION ||
      saved.signature !== contentSignature() ||
      !saved.state ||
      !Array.isArray(saved.feed)
    ) {
      return null
    }
    const state = saved.state
    if (typeof state.phase !== 'string' || state.phase === 'ended' || !state.player) {
      return null
    }
    // 저장본이 가리키는 객체·이벤트가 실제로 있는지 확인 (없으면 findXxx가 던진다)
    if (state.progress) {
      findObject(gameContext, state.progress.objectId)
    }
    if (state.interlude) {
      findInterlude(gameContext, state.interlude.eventId)
    }
    return { state, feed: saved.feed }
  } catch {
    return null
  }
}

/** 끝난 판의 요약. 홈 화면의 "지난 기록"에 쓴다. */
export interface GameRecord {
  seed: number
  /** 고른 입사 배경 id */
  backgroundId?: string
  savedAt: number
  endingKind: EndingKind
  endingId?: string
  deathCause?: DeathCause
  age: number
  rank: Rank
  /** 관리를 마친 객체 수 / 그중 성공한 수 */
  managed: number
  cleared: number
}

export function buildRecord(state: GameState): GameRecord | null {
  const { ending } = state
  if (!ending) {
    return null
  }
  return {
    seed: state.seed,
    backgroundId: state.backgroundId ?? undefined,
    savedAt: Date.now(),
    endingKind: ending.kind,
    endingId: ending.endingId,
    deathCause: ending.deathCause,
    age: ending.age,
    rank: state.player.career.rank,
    managed: state.history.length,
    cleared: state.history.filter((report) => report.outcome === 'cleared').length,
  }
}

export function loadRecords(): GameRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as GameRecord[]) : []
  } catch {
    return []
  }
}

/** 같은 시드의 기록은 하나만 남기고(다시 저장돼도 중복되지 않게), 최근 10개만 보관한다. */
export function saveRecord(record: GameRecord): void {
  try {
    const records = [record, ...loadRecords().filter((existing) => existing.seed !== record.seed)]
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records.slice(0, MAX_RECORDS)))
  } catch {
    // 무시
  }
}
