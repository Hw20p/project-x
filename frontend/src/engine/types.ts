// 엔진(engine/)과 콘텐츠(content/)가 공유하는 타입.
// 콘텐츠 파일은 `satisfies ContainmentObject`로 작성하면 필드 오타를 컴파일 단계에서 잡을 수 있다.

export const STAT_KEYS = ['sanity', 'health', 'reputation', 'knowledge'] as const
/** sanity=정신력, health=체력, reputation=평판, knowledge=지식 */
export type StatKey = (typeof STAT_KEYS)[number]
export type Stats = Record<StatKey, number>
export type StatDelta = Partial<Record<StatKey, number>>

/** 플레이어 직급이자 객체 등급. 1(수습)에서 시작해 5(수석)까지. */
export type Rank = 1 | 2 | 3 | 4 | 5
/** 선택지 위험도 (표시용). 높을수록 성공 확률이 낮고 보상이 큼. */
export type Risk = 1 | 2 | 3 | 4 | 5

/**
 * 실패 종류
 * - setback : 스탯 피해만 입고 다음 단계로 진행
 * - demotion: 규정 위반 등으로 관리가 즉시 종료되고 한 직급 좌천 (수습이면 해고)
 * - death   : 즉사 — 그 판이 끝남
 */
export type FailureKind = 'setback' | 'demotion' | 'death'

/**
 * 선택 결과가 스탯 외에 상태에 남기는 것. 객체 선택지와 막간 이벤트 선택지 모두에서 쓴다.
 * 이게 NPC·큰 줄거리를 "데이터로 추가"하는 기반이다 (플래그로 이야기를 잇고, 관계 값으로 인물과의 사이를 쌓는다).
 */
export interface OutcomeExtras {
  /** 켜는 플래그. 이후 이벤트의 등장 조건(`when.flags`)으로 쓴다. */
  setFlags?: string[]
  /** 끄는 플래그 */
  clearFlags?: string[]
  /** NPC id → 관계 변화량 (-100~100 범위로 잘림) */
  relations?: Record<string, number>
}

export interface SuccessOutcome extends OutcomeExtras {
  text: string
  effects?: StatDelta
  /** true면 남은 단계를 건너뛰고 관리를 바로 끝냄 — 그만큼 시간이 절약됨 (하이리스크 하이리턴) */
  finish?: boolean
  /** 최종 객체(`finale`)에서만 사용. 이 선택이 성공하면 해당 엔딩으로 판이 끝난다. */
  endingId?: string
}

/** 최종 객체의 선택으로 도달하는 엔딩의 표시용 정의 (`content/endings.ts`) */
export interface EndingDef {
  id: string
  title: string
  text: string
}

export interface FailureOutcome extends OutcomeExtras {
  kind: FailureKind
  text: string
  effects?: StatDelta
}

/**
 * 입사 배경. 새 판을 시작할 때 고르는 첫 선택으로, 입사 시점의 스탯을 정한다.
 * 배경 사이의 스탯 합계는 모두 같게 둔다 (검증기가 강제) — "무엇을 포기하느냐"의 선택이 되도록.
 */
export interface BackgroundDef {
  id: string
  name: string
  /** 입사 서류에 적힌 한두 문장 */
  summary: string
  /** 입사 시점의 스탯 */
  stats: Stats
}

// ───────────────────────── 막간 이벤트 · NPC ─────────────────────────

/**
 * 막간 이벤트 종류
 * - recovery    : 정신력(·체력) 회복
 * - growth      : 스탯 증가 (교육, 훈련 등. 시간이 들기도 함)
 * - relationship: 직장 내 관계 (NPC와의 일. 관계 값과 플래그를 쌓음)
 */
export type InterludeKind = 'recovery' | 'growth' | 'relationship'

/** 막간 이벤트가 나올 수 있는 조건. 지정한 항목을 모두 만족해야 한다. */
export interface InterludeCondition {
  minRank?: Rank
  maxRank?: Rank
  /** 정수 나이 기준 */
  minAge?: number
  maxAge?: number
  /** 스탯 범위. 예: 정신력이 낮을 때만 나오는 상담 이벤트는 { sanity: { max: 45 } } */
  stats?: Partial<Record<StatKey, { min?: number; max?: number }>>
  /** 모두 켜져 있어야 하는 플래그 */
  flags?: string[]
  /** 하나라도 켜져 있으면 안 되는 플래그 */
  notFlags?: string[]
  /** NPC id → 관계 값 범위 */
  relations?: Record<string, { min?: number; max?: number }>
  /** 이 중 하나의 입사 배경일 때 (배경 id 목록) */
  backgrounds?: string[]
  /** 지금 관리 중인 객체가 이 중 하나일 때 (객체 id 목록). 관리 중이 아니면 만족하지 않는다. */
  objects?: string[]
  /** 지금 관리 중인 객체의 등급이 이 중 하나일 때. 관리 중이 아니면 만족하지 않는다. */
  objectTiers?: Rank[]
}

// ───────────────────────── 흐르는 서술 ─────────────────────────

/**
 * 흐르는 서술의 종류
 * - ambient: 일상 서술. 시간이 흐를 때 상태에 맞는 문장이 하나씩 보인다 (반복 가능, 최근에 나온 건 피함)
 * - beat   : 이야기 비트. 조건이 맞으면 한 번만 나온다 (큰 줄거리·복선)
 */
export type FlowKind = 'ambient' | 'beat'

/**
 * 선택 없이 흘러가는 서술 조각. 시간이 흐르는 전환마다 조건에 맞는 것이 골라져 다음 화면 위에 붙는다.
 * 등장 조건은 막간 이벤트와 같은 구조(`InterludeCondition`)를 쓴다.
 */
export interface FlowDef {
  id: string
  kind: FlowKind
  /**
   * 문장. 배열이면 그중 하나를 무작위로 고른다 (같은 조건의 변주).
   * 문장 안에서 `{age}`(나이), `{rank}`(직급명), `{object}`(관리 중인 객체 이름), `{background}`(입사 배경 이름)를 쓸 수 있다.
   */
  text: string | string[]
  /** 등장 조건. 이야기 비트에는 반드시 있어야 한다 (없으면 첫 전환에 바로 나옴). */
  when?: InterludeCondition
  /** 일상 서술의 기본 가중치. 기본 1. 조건이 많을수록 더 자주 나오게 하는 보정이 따로 붙는다. */
  weight?: number
  /** 이야기 비트가 한 전환에 여러 개 걸릴 때의 우선순위. 클수록 먼저. 기본 0. */
  priority?: number
  /**
   * 이야기 사슬: 이 서술(id)이 이미 나온 뒤에만 열린다. 같은 조건이면 먼저 나와야 하는 순서를 만든다.
   * 이 필드만으로도 등장 조건이 되지만, 직급·나이 같은 `when`을 같이 걸어 두면 너무 늦게 나오지 않게 막을 수 있다.
   */
  after?: string
  /** `after`가 나온 뒤 최소 몇 년이 지나야 열리는지. 기본 0. */
  afterYears?: number
  /** 이 서술이 나오면 켜지는 플래그. 막간 이벤트·다른 서술의 `flags` 조건으로 줄거리의 진행을 이을 수 있다. */
  setFlags?: string[]
  /**
   * 이 서술이 나오면 바뀌는 스탯. 선택 결과와 같은 규칙(상승분에 수확체감)을 따른다.
   * 몇몇 서술에만 쓴다: 특히 입사 초기에 자주 나오는 서술에 넣어 천천히 쌓이게 한다.
   */
  effects?: StatDelta
  /** 이 서술이 나오면 바뀌는 NPC 관계 (npc id → 변화량). 읽은 줄이 곧 관계 변화로 이어진다. */
  relations?: Record<string, number>
}

/** 입사 배경별 오프닝 장면. 배경을 고른 직후 첫 화면 위에 줄 단위로 보인다. */
export interface OpeningDef {
  id: string
  backgroundId: string
  lines: string[]
}

/**
 * 막간 이벤트. 객체 관리 사이사이에 끼어들고, 선택지와 결과는 객체와 같은 `Choice` 구조를 쓴다.
 * 막간 이벤트의 실패는 `setback`만 허용한다 (좌천·즉사는 객체 관리 중에만 일어난다).
 */
export interface InterludeDef {
  id: string
  kind: InterludeKind
  title: string
  text: string
  /** 이 이벤트의 주인공 NPC (표시용·검증용) */
  npcId?: string
  /** 등장 가중치. 기본 1. */
  weight?: number
  /** true면 한 판에 한 번만 나온다 (이야기 이벤트) */
  once?: boolean
  /** 같은 이벤트가 다시 나오기까지의 쿨다운(년). 기본값은 `INTERLUDE.defaultCooldownYears`. */
  cooldownYears?: number
  when?: InterludeCondition
  choices: Choice[]
}

/** 관계 값에 따라 매년 붙는 효과 (동료와 친하면 정신력이 조금씩 회복되는 식) */
export interface NpcBond {
  /** 화면에 보여 줄 관계 이름 */
  label: string
  minRelation?: number
  maxRelation?: number
  yearly: StatDelta
}

export interface NpcDef {
  id: string
  name: string
  role: string
  /** 나이 차이: 이 인물의 나이 = 플레이어 나이 + ageGap (동기는 0, 선배는 +). 해가 지나면 같이 늘어난다. */
  ageGap: number
  summary: string
  bonds?: NpcBond[]
}

export interface Choice {
  id: string
  text: string
  /**
   * 선택을 한 직후, 결과(성공·실패)가 나오기 전에 줄거리 스트림에 흐르는 "선택에 따른 이야기 진행".
   * 판정과 무관하게 이 선택을 실행하는 과정을 보여 주고, 이어서 성공·실패 결과가 나온다. 없으면 바로 결과가 나온다.
   */
  story?: string
  risk: Risk
  /** 스탯 보정 전 성공 확률 (0~1) */
  baseChance: number
  /** 스탯이 기준값(50)보다 1점 높을 때마다 더해지는 확률. 예: { knowledge: 0.005 } */
  statWeights?: StatDelta
  success: SuccessOutcome
  failure: FailureOutcome
}

export interface Stage {
  id: string
  title: string
  /**
   * 이 단계가 이야기상 차지하는 시간(년). 1 이상의 정수. 객체 관리 중에는 시간이 흐르지 않고, 단계의 years는 객체에 쓴 시간으로
   * 쌓여서 다음 객체까지의 간격에 반영된다 (그 시간은 객체가 끝난 뒤 한 해씩 흐른다). 화면에는 보이지 않는다.
   */
  years: number
  text: string
  choices: Choice[]
}

/** 객체 관리의 결말: 관리 성공 / 실패(허용치 초과) / 규정 위반 */
export type ClosingOutcome = 'cleared' | 'failed' | 'demoted'

/**
 * 객체 관리가 끝났을 때 보고서 앞에 흘러나오는 마무리 서술. 결말마다 문장 하나 또는 변주 배열(그중 하나를 고름).
 * 쓰지 않은 결말은 `content/closings.ts`의 기본 문구를 쓴다. 자리표시자는 `{object}`(객체 이름)만 쓸 수 있다.
 */
export type ObjectClosing = Partial<Record<ClosingOutcome, string | string[]>>

export interface ContainmentObject {
  id: string
  /** 표시용 관리 번호. 정렬 기준이기도 함. */
  code: string
  name: string
  /** 이 객체가 배정되는 직급 */
  tier: Rank
  summary: string
  /** 관찰 기록 — 객체 상세 화면에 보여 줄 사실들 */
  observation: string[]
  /** 관리 매뉴얼 — 선택지 판단의 힌트. 일부는 지워져 있거나 불완전할 수 있음. */
  manual: string[]
  /** 관리를 마칠 때의 마무리 서술. 없으면 기본 문구. */
  closing?: ObjectClosing
  /** 실패(setback)가 이 횟수 이하면 관리 성공으로 인정. 기본 0. */
  failureTolerance?: number
  /**
   * 최종 객체 여부. 수석이 된 뒤 시간과 줄거리(3막 서술이 끝나거나 오래 수석으로 지냄)가 차면 배정되고(`FINALE`),
   * 이 객체의 마지막 선택(또는 일찍 끝내는 선택)이 성공하면 `endingId`에 해당하는 엔딩으로 판이 끝난다. 반드시 tier 5여야 한다.
   */
  finale?: boolean
  stages: Stage[]
}

export interface Career {
  rank: Rank
  /** 지금 직급이 된 나이. 수석이 된 지 얼마나 됐는지(최종 객체 개방 조건)를 잴 때 쓴다. */
  rankSince: number
  /** 현재 직급에서 쌓은 승급 점수 (시간이 흐르며 저절로 쌓이고, 객체 성과가 가감한다) */
  promotionPoints: number
  /** 연속 관리 성공 횟수 */
  streak: number
  totalSuccesses: number
  totalFailures: number
}

export interface PlayerState {
  /** 나이(년). 0.5 단위로 늘어남. 표시할 때는 내림. */
  age: number
  stats: Stats
  career: Career
}
