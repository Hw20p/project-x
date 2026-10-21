// 줄거리 스트림에 쌓이는 항목(feed)과, 엔진 상태 전이를 항목으로 바꾸는 함수.
// 선택의 결과·객체 보고서·시간이 흘러간 서술은 팝업이 아니라 이 스트림으로 보여 준다.
import { pickClosing } from '../content/closings'
import { pickIntro } from '../content/intros'
import { RANK_LABELS } from '../engine/config'
import { findInterlude, findObject } from '../engine/game'
import type { GameContext } from '../engine/game'
import type { GameState } from '../engine/state'
import type { Act, Rank, StatDelta, Stats } from '../engine/types'
import { toParagraphs } from './text'

/**
 * 항목 종류
 * - year   : 한 해가 흘렀다는 표시 (본문 없음, 게이지·상태 패널 동기화용 스냅샷을 담는다)
 * - opening/ambient/beat: 엔진이 만든 흐르는 서술
 * - choice : 플레이어가 고른 선택지 (기록용)
 * - result : 선택의 결과 서술 (실제로 바뀐 스탯·관계, 안내 문구 포함)
 * - story  : 고른 선택지를 실행하는 이야기 진행 (선택지의 `story`. 결과가 나오기 전에 흐른다)
 * - closing: 객체 관리를 마칠 때의 마무리 서술 (보고서 바로 앞)
 * - report : 객체 한 건의 관리 보고서
 * - assign : 새 객체를 맡게 됨
 * - system : 막간 이벤트 시작, 병 같은 알림
 */
export type FeedKind =
  | 'year'
  | 'opening'
  | 'ambient'
  | 'beat'
  | 'choice'
  | 'story'
  | 'result'
  | 'closing'
  | 'report'
  | 'assign'
  | 'system'
export type FeedTone = 'good' | 'bad'

export interface FeedItem {
  /** 판 안에서 겹치지 않는 키 (쌓인 순서) */
  id: string
  /** 이 일이 일어난 나이. 화면에 나이 표시로 붙는다. */
  age: number
  kind: FeedKind
  text: string
  tone?: FeedTone
  /** result: 실제로 바뀐 스탯 (수확체감까지 반영된 값) */
  delta?: StatDelta
  /** result: 바뀐 NPC 관계 */
  relations?: Record<string, number>
  /** 보조 안내 문구 (확률, 승급·좌천 등) */
  notes?: string[]
  /** year: 그 해가 끝난 시점의 나이·스탯·직급·승급 점수. 상태 패널이 재생에 맞춰 보여 준다. */
  snapshot?: YearSnapshot
}

/** 한 해가 끝난 시점의 플레이어 상태 (화면 재생용) */
export interface YearSnapshot {
  /** 큰 줄거리의 막 */
  act: Act
  age: number
  stats: Stats
  rank: Rank
  points: number
}

/** 관계 화면이 보여 주는, 지금까지 읽은 줄거리 기준의 NPC 관계 */
export interface RelationsView {
  /** NPC id → 관계 값. 아직 만난 적 없는 NPC는 키가 없다. */
  values: Record<string, number>
  /** 관계가 바뀐 기록 (오래된 순) */
  log: { npcId: string; age: number; change: number }[]
}

/**
 * 읽은 줄(앞쪽 `revealed`개)까지의 관계를 줄거리에서 다시 모은다. 엔진 상태의 관계는 아직 읽지 않은 결과까지 반영돼 있어서,
 * 그대로 보여 주면 결과를 읽기 전에 관계가 바뀐 것을 먼저 알게 된다. 관계는 선택 결과로만 바뀌므로 결과 줄을 모으면 같은 값이 된다.
 */
export function deriveRelations(feed: readonly FeedItem[], revealed: number, min: number, max: number): RelationsView {
  const values: Record<string, number> = {}
  const log: RelationsView['log'] = []
  for (const item of feed.slice(0, Math.max(0, revealed))) {
    for (const [npcId, change] of Object.entries(item.relations ?? {})) {
      values[npcId] = Math.max(min, Math.min(max, (values[npcId] ?? 0) + change))
      if (change !== 0) {
        log.push({ npcId, age: item.age, change })
      }
    }
  }
  return { values, log }
}

export type FeedDraft = Omit<FeedItem, 'id'>

/** 새 항목들을 스트림 뒤에 붙인다. id는 쌓인 순서로 매긴다. */
export function appendFeed(feed: readonly FeedItem[], drafts: readonly FeedDraft[]): FeedItem[] {
  return [...feed, ...drafts.map((draft, index) => ({ ...draft, id: String(feed.length + index) }))]
}

/** 방금 고른 선택지 한 줄과, 그 선택을 실행하는 이야기 진행(`story`)이 있으면 이어지는 줄들 */
function describeChoice(ctx: GameContext, state: GameState, age: number): FeedDraft[] {
  const entry = state.choiceLog[state.choiceLog.length - 1]
  if (!entry) {
    return []
  }
  const choice =
    'interludeId' in entry
      ? findInterlude(ctx, entry.interludeId).choices.find((candidate) => candidate.id === entry.choiceId)
      : findObject(ctx, entry.objectId)
          .stages.find((stage) => stage.id === entry.stageId)
          ?.choices.find((candidate) => candidate.id === entry.choiceId)
  if (!choice) {
    return []
  }
  const story = choice.story ? toParagraphs(choice.story) : []
  return [
    { age, kind: 'choice', text: choice.text },
    ...story.map((text) => ({ age, kind: 'story' as const, text })),
  ]
}

/** 결과 서술을 문장 단위 문단으로 쪼개 항목들로 만든다. 스탯·관계·안내는 마지막 문단에 붙는다. */
function resultDrafts(
  age: number,
  text: string,
  tone: FeedTone,
  extras: { delta: StatDelta; relations?: Record<string, number>; notes: string[] },
): FeedDraft[] {
  const paragraphs = toParagraphs(text)
  return paragraphs.map((paragraph, index) => {
    const isLast = index === paragraphs.length - 1
    return isLast
      ? { age, kind: 'result' as const, text: paragraph, tone, ...extras }
      : { age, kind: 'result' as const, text: paragraph, tone }
  })
}

/**
 * 한 번의 상태 전이(prev → next)에서 스트림에 새로 붙일 항목들.
 * @param prev 전이 전의 상태. 판이 막 시작됐으면 null.
 * @param delta 이 전이에서 실제로 바뀐 스탯
 */
export function describeTransition(
  ctx: GameContext,
  prev: GameState | null,
  next: GameState,
  delta: StatDelta,
): FeedDraft[] {
  const drafts: FeedDraft[] = []
  const age = next.player.age

  // 1) 방금 선택을 했다면 고른 선택지
  if (prev && next.choiceLog.length > prev.choiceLog.length) {
    drafts.push(...describeChoice(ctx, next, prev.player.age))
  }

  // 2) 이번 전이에서 흘러간 서술과 병
  for (const event of next.events) {
    switch (event.type) {
      case 'year':
        // 한 해가 흘렀다는 표시. 화면이 이걸 지날 때 나이·스탯·게이지를 그 해로 맞춘다.
        drafts.push({
          age: event.age,
          kind: 'year',
          text: '',
          snapshot: { age: event.age, stats: event.stats, rank: event.rank, points: event.points, act: event.act },
        })
        break
      case 'flow':
        drafts.push({
          age: event.entry.age,
          kind: event.entry.kind,
          text: event.entry.text,
          // 서술이 스탯·관계를 바꿨다면 줄 아래에 칩으로 보여 준다
          ...(event.entry.effects ? { delta: event.entry.effects } : {}),
          ...(event.entry.relations ? { relations: event.entry.relations } : {}),
        })
        break
      case 'illness':
        drafts.push({ age: event.age, kind: 'system', text: '몸에 병이 들었다.', tone: 'bad' })
        break
      case 'promotion':
        drafts.push({
          age: event.age,
          kind: 'system',
          text: `승급 — ${RANK_LABELS[event.from]}에서 ${RANK_LABELS[event.to]}이(가) 되었다.`,
          tone: 'good',
        })
        break
    }
  }

  // 3) 도달한 단계에 따른 항목
  // 선택 직후 곧바로 판이 끝나는 경우(즉사·붕괴·최종 엔딩)에도 그 선택의 결과는 스트림에 남긴다.
  const choseJustNow = next.phase === 'outcome' || (next.phase === 'ended' && prev?.phase === 'choosing')
  const interludeChoseJustNow =
    next.phase === 'interludeOutcome' || (next.phase === 'ended' && prev?.phase === 'interlude')
  if (choseJustNow && next.lastResult) {
    const result = next.lastResult
    const notes = [`${result.success ? '성공' : '실패'} · 확률 ${Math.round(result.chance * 100)}%`]
    if (next.phase === 'outcome') {
      if (result.failureKind === 'demotion') {
        notes.push('규정 위반으로 이 객체의 관리가 중단된다.')
      } else if (result.endsObject) {
        notes.push('이 객체의 관리가 끝난다.')
      }
    }
    drafts.push(
      ...resultDrafts(age, result.text, result.success ? 'good' : 'bad', {
        delta,
        relations: result.relations,
        notes,
      }),
    )
  } else if (interludeChoseJustNow && next.lastInterludeResult) {
    const result = next.lastInterludeResult
    const notes = [`${result.success ? '성공' : '실패'} · 확률 ${Math.round(result.chance * 100)}%`]
    drafts.push(
      ...resultDrafts(age, result.text, result.success ? 'good' : 'bad', {
        delta,
        relations: result.relations,
        notes,
      }),
    )
  } else if (next.phase === 'report') {
    const report = next.history[next.history.length - 1]
    if (report) {
      const label = report.outcome === 'cleared' ? '관리 성공' : report.outcome === 'failed' ? '관리 실패' : '규정 위반'
      const notes = [`실패한 단계 ${report.failures}회${report.flawless ? ' · 무결점' : ''}`]
      if (report.reassigned) {
        notes.push('재배정 (승급 점수 절반)')
      }
      if (report.promoted) {
        notes.push(`승급: ${RANK_LABELS[(report.rankAfter - 1) as Rank]} → ${RANK_LABELS[report.rankAfter]}`)
      }
      if (report.demoted) {
        notes.push(`좌천: ${RANK_LABELS[report.rankAfter]}(으)로 내려간다`)
      }
      if (next.pendingEnding?.kind === 'dismissed') {
        notes.push('수습 직급에서의 규정 위반이다. 인사팀에서 해고 통보가 도착했다.')
      }
      drafts.push(
        ...toParagraphs(pickClosing(findObject(ctx, report.objectId), report.outcome, next.seed, next.history.length)).map(
          (text) => ({ age, kind: 'closing' as const, text }),
        ),
      )
      drafts.push({
        age,
        kind: 'report',
        text: `${report.code} 「${report.name}」 — ${label}`,
        tone: report.outcome === 'cleared' ? 'good' : 'bad',
        notes,
      })
    }
  } else if (
    next.phase === 'choosing' &&
    prev?.phase === 'outcome' &&
    next.progress &&
    prev.progress &&
    next.progress.stageIndex > prev.progress.stageIndex
  ) {
    // 다음 단계로 넘어올 때: 앞 단계의 결과에서 새 단계의 상황으로 이어 주는 연결 해설 (선택 팝업이 뜨기 전에 스트림에 흐른다)
    const stage = findObject(ctx, next.progress.objectId).stages[next.progress.stageIndex]
    const lead = prev.lastResult?.success === false ? (stage.leadAfterFailure ?? stage.lead) : stage.lead
    if (lead) {
      drafts.push(...toParagraphs(lead).map((text) => ({ age, kind: 'story' as const, text })))
    }
  } else if (next.phase === 'briefing' && next.progress && prev?.phase !== 'briefing') {
    const object = findObject(ctx, next.progress.objectId)
    // 어떤 계기로 이 객체를 맡게 되었는지: 배정 안내 바로 앞에 한두 문장 (재배정이면 기본 문구)
    const intro = pickIntro(object, next.progress.reassigned, next.seed, next.history.length)
    if (intro) {
      drafts.push(...toParagraphs(intro).map((text) => ({ age, kind: 'story' as const, text })))
    }
    drafts.push({
      age,
      kind: 'assign',
      text: `${object.code} 「${object.name}」 관리를 맡게 되었다.`,
      ...(next.progress.reassigned && {
        notes: [`이미 겪어 본 객체를 다시 맡는다 (지식 +${next.progress.knowledgeBonus})`],
      }),
    })
  } else if (next.phase === 'interlude' && next.interlude && prev?.phase !== 'interlude') {
    drafts.push({ age, kind: 'system', text: `막간 — ${findInterlude(ctx, next.interlude.eventId).title}` })
  }

  return drafts
}
