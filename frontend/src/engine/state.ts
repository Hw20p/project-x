// 게임 진행 상태 타입. 전부 JSON으로 직렬화할 수 있는 값만 담는다 (localStorage 저장, 리플레이 검증용).
import type { FailureKind, PlayerState, Rank, StatDelta } from './types'

/**
 * 진행 단계
 * - briefing: 새 객체를 배정받고 관찰 기록·매뉴얼을 읽는 중
 * - choosing: 현재 단계의 선택지를 고르는 중
 * - outcome : 선택 결과 서술을 보는 중 (`continue`로 시간이 흐름)
 * - report  : 객체 관리가 끝나고 결과 보고서를 보는 중
 * - interlude       : 막간 이벤트(회복·성장·관계)가 끼어들어 선택지를 고르는 중
 * - interludeOutcome: 막간 이벤트의 선택 결과를 보는 중 (`continue`로 원래 흐름에 복귀)
 * - ended   : 판이 끝남 (`ending` 참고)
 */
export type Phase =
  | 'briefing'
  | 'choosing'
  | 'outcome'
  | 'report'
  | 'interlude'
  | 'interludeOutcome'
  | 'ended'

/**
 * 종료 종류
 * - death    : 사망 (원인은 `deathCause`)
 * - breakdown: 정신 붕괴
 * - dismissed: 수습이 좌천되어 해고
 * - retired  : 배정할 객체가 더 없어 퇴직 (콘텐츠가 비정상적으로 적을 때만)
 * - longevity: 100세까지 삶
 * - finale   : 최종 객체의 선택으로 도달한 엔딩 (`endingId`)
 */
export type EndingKind = 'death' | 'breakdown' | 'dismissed' | 'retired' | 'longevity' | 'finale'
/** instant=즉사 선택지, injury=관리 중 입은 피해, illness=병, aging=노화 */
export type DeathCause = 'instant' | 'injury' | 'illness' | 'aging'

export interface Ending {
  kind: EndingKind
  age: number
  deathCause?: DeathCause
  /** kind가 finale일 때 도달한 엔딩 id (`content/endings.ts`) */
  endingId?: string
  /** 종료 시점에 관리 중이던 객체 */
  objectId?: string
}

/** 지금 관리 중인 객체의 진행 상황 */
export interface ObjectProgress {
  objectId: string
  reassigned: boolean
  /** 이 객체를 관리하는 동안만 확률 계산에 더해지는 지식 보너스 */
  knowledgeBonus: number
  stageIndex: number
  /** 지금까지의 실패(setback) 횟수 */
  failures: number
  /** 이 객체 관리에 쓴 시간(년) */
  yearsSpent: number
}

/** 방금 한 선택의 결과 — `outcome` 단계에서 화면에 보여 줄 내용 */
export interface ChoiceResult {
  objectId: string
  stageId: string
  choiceId: string
  /** 판정에 쓰인 최종 성공 확률 */
  chance: number
  success: boolean
  text: string
  effects?: StatDelta
  /** 실패했을 때의 종류 */
  failureKind?: FailureKind
  /** 이 선택으로 객체 관리가 끝나는지 (일찍 끝내기 성공, 좌천, 마지막 단계) */
  endsObject: boolean
}

/** 객체 한 건의 관리 결과 보고서. 사망 기록의 재료이기도 하다. */
export interface ObjectReport {
  objectId: string
  code: string
  name: string
  tier: Rank
  reassigned: boolean
  /** cleared=관리 성공, failed=실패 허용치 초과, demoted=규정 위반으로 좌천 */
  outcome: 'cleared' | 'failed' | 'demoted'
  failures: number
  flawless: boolean
  yearsSpent: number
  promoted: boolean
  /** 좌천되었는지 (해고는 포함하지 않음) */
  demoted: boolean
  rankAfter: Rank
  ageAtEnd: number
}

/** 마지막 전이 중에 일어난 일. 매 전이마다 새로 채워진다. */
export type GameEvent = { type: 'illness'; age: number }

/** 진행 중인 막간 이벤트. `resume`은 이벤트가 끝난 뒤 돌아갈 곳. */
export interface InterludeProgress {
  eventId: string
  /** choosing=관리 중이던 객체의 다음 단계, assign=다음 객체 배정 */
  resume: 'choosing' | 'assign'
}

/** 막간 이벤트의 선택 결과 — `interludeOutcome` 단계에서 화면에 보여 줄 내용 */
export interface InterludeResult {
  eventId: string
  choiceId: string
  chance: number
  success: boolean
  text: string
  effects?: StatDelta
  /** 이 선택으로 바뀐 NPC 관계 (npcId → 변화량) */
  relations?: Record<string, number>
}

/** 지금까지 겪은 막간 이벤트 기록. 쿨다운·한 번만 나오는 이벤트 판정과 집계에 쓴다. */
export interface InterludeRecord {
  eventId: string
  age: number
  choiceId: string
  success: boolean
}

/** 리플레이 검증용 선택 기록. 객체 선택지는 객체·단계를, 막간 이벤트 선택지는 이벤트 id를 가진다. */
export type ChoiceLogEntry =
  | { objectId: string; stageId: string; choiceId: string }
  | { interludeId: string; choiceId: string }

export interface GameState {
  /** 최초 시드 (리플레이 때 필요) */
  seed: number
  /** 난수 내부 상태. 매 전이마다 이어서 쓴다. */
  rngState: number
  phase: Phase
  player: PlayerState
  /** 객체 id → 이번 판에서 관리를 마친 횟수 */
  managedCounts: Record<string, number>
  /** briefing / choosing / outcome 동안 존재 */
  progress: ObjectProgress | null
  /** outcome 단계(와 선택 직후 종료된 경우)에서 보여 줄 선택 결과 */
  lastResult: ChoiceResult | null
  /** 지금까지 끝낸 객체 보고서 (오래된 순). report 단계에서는 마지막 항목이 방금 끝낸 것. */
  history: ObjectReport[]
  /** report를 보고 나면 판이 끝나는 경우(해고)에 미리 정해 둔 종료 */
  pendingEnding: Ending | null
  ending: Ending | null
  choiceLog: ChoiceLogEntry[]
  events: GameEvent[]
  /** 켜져 있는 플래그. 이야기 이벤트의 등장 조건이 된다. */
  flags: string[]
  /** NPC id → 관계 값 (-100~100). 만난 적 없는 NPC는 키가 없다. */
  relations: Record<string, number>
  /** interlude 단계 동안 존재 */
  interlude: InterludeProgress | null
  /** interludeOutcome 단계에서 보여 줄 막간 이벤트 선택 결과 */
  lastInterludeResult: InterludeResult | null
  /** 지금까지 겪은 막간 이벤트 (오래된 순) */
  interludeLog: InterludeRecord[]
  /** 마지막 막간 이벤트를 겪은 나이. 다음 이벤트까지의 간격 계산에 쓴다. 시작 나이로 초기화. */
  lastInterludeAge: number
  /**
   * 판이 끝난 원인이 된 선택의 결과 서술 (즉사·붕괴·최종 엔딩 등). 종료 화면에서 그 장면을 보여 주는 용도.
   * 노화·병·해고처럼 선택이 원인이 아닌 종료에서는 null.
   */
  endingScene: string | null
}
