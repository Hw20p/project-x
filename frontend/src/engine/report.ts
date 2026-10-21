// 시뮬레이션 결과를 복사·저장하기 좋은 마크다운 텍스트로 정리한다.
// 설정값(시드, 입사 스탯, 승급 기준 등)도 함께 담아서, 나중에 같은 조건으로 다시 돌려 비교할 수 있게 한다.
import {
  AGE_CHANCE_PENALTY,
  CHANCE_MAX,
  CHANCE_MIN,
  FINALE,
  GAIN_FLOOR,
  INTERLUDE,
  OBJECT_SCHEDULE,
  PASSIVE_PROMOTION,
  PROMOTION,
  PROMOTION_REQUIREMENTS,
  RANK_LABELS,
  REASSIGNMENT,
  TIER_CHANCE_MODIFIER,
  YEARLY_SANITY_RECOVERY,
} from './config'
import { botLabel } from './simulate'
import type { Distribution, SimulationSummary } from './simulate'
import type { DeathCause, EndingKind } from './state'
import { STAT_KEYS } from './types'
import type { ContainmentObject, InterludeKind, Rank, StatKey, Stats } from './types'

export const STAT_LABELS: Record<StatKey, string> = {
  sanity: '정신력',
  health: '체력',
  reputation: '평판',
  knowledge: '지식',
}

export const ENDING_LABELS: Record<EndingKind, string> = {
  death: '사망',
  breakdown: '정신 붕괴',
  dismissed: '해고',
  retired: '퇴직',
  longevity: '천수(100세)',
  finale: '최종 엔딩',
}

export const DEATH_CAUSE_LABELS: Record<DeathCause, string> = {
  instant: '즉사 선택지',
  injury: '관리 중 피해',
  illness: '병',
  aging: '노화',
}

export const RANKS: readonly Rank[] = [1, 2, 3, 4, 5]

export function percent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`
}

export function years(value: number): string {
  return value.toFixed(1)
}

export function distributionText(distribution: Distribution): string {
  return `평균 ${years(distribution.mean)} · 중앙값 ${years(distribution.median)} · 하위 10% ${years(distribution.p10)} · 상위 10% ${years(distribution.p90)} (최소 ${years(distribution.min)}, 최대 ${years(distribution.max)})`
}

/** 시뮬레이션을 돌릴 때 쓴 입력값 */
export interface ReportSettings {
  games: number
  seed: number
  stats: Stats
}

/**
 * 최종 엔딩별 비율 텍스트 (전체 판 대비, 최종 객체 도달 대비). 최종 엔딩에 도달한 판이 없으면 빈 문자열.
 * "도달 대비"는 최종 객체를 맡은 판 중 그 엔딩으로 끝난 비율이라서, 엔딩을 노렸을 때의 성공률로 읽으면 된다.
 */
export function finaleEndingsText(
  summary: SimulationSummary,
  endingTitles: Readonly<Record<string, string>>,
): string {
  return Object.entries(summary.finaleEndings)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => {
      const text = `${endingTitles[id] ?? id} ${percent(count / summary.games)}`
      return summary.finaleReached > 0 ? `${text} (도달 대비 ${percent(count / summary.finaleReached)})` : text
    })
    .join(', ')
}

/**
 * 최종 객체별로 어떤 엔딩이 나왔는지 정리한 줄들. 맡은 판이 없는 객체는 "0판"으로 남겨서
 * 어떤 객체에 한 번도 못 닿았는지도 보이게 한다. (엔딩 비율은 그 객체를 맡은 판 대비)
 */
export function finaleObjectLines(
  summary: SimulationSummary,
  endingTitles: Readonly<Record<string, string>>,
): string[] {
  return summary.finaleObjects.map((stat) => {
    const head = `${stat.code} ${stat.name}: ${stat.reached}판 (${percent(stat.reached / summary.games)})`
    const endings = Object.entries(stat.endings).sort((a, b) => b[1] - a[1])
    if (endings.length === 0) {
      return head
    }
    const text = endings
      .map(([id, count]) => `${endingTitles[id] ?? id} ${count}판 (${percent(count / stat.reached)})`)
      .join(', ')
    return `${head} → ${text}`
  })
}

/** 최종 객체 도달 비율 텍스트 */
export function finaleReachedText(summary: SimulationSummary): string {
  return `${percent(summary.finaleReached / summary.games)} (${summary.finaleReached}판)`
}

function formatSummary(summary: SimulationSummary, endingTitles: Readonly<Record<string, string>>): string {
  const endings = (Object.keys(ENDING_LABELS) as EndingKind[])
    .map((kind) => `${ENDING_LABELS[kind]} ${percent(summary.endings[kind] / summary.games)}`)
    .join(', ')
  const finaleText = finaleEndingsText(summary, endingTitles)
  const causes = (Object.keys(DEATH_CAUSE_LABELS) as DeathCause[])
    .map((cause) => `${DEATH_CAUSE_LABELS[cause]} ${percent(summary.deathCauses[cause] / summary.games)}`)
    .join(', ')

  const kindLabel: Record<InterludeKind, string> = { recovery: '회복', growth: '성장', relationship: '관계' }
  const interludeRows = summary.interludeStats.map(
    (stat) =>
      `| ${stat.title} | ${kindLabel[stat.kind]} | ${stat.perGame.toFixed(2)} | ${stat.taken > 0 ? percent(stat.successRate) : '-'} |`,
  )
  const npcRows = summary.npcStats.map(
    (stat) => `| ${stat.name} | ${percent(stat.metRate)} | ${stat.metRate > 0 ? stat.avgRelation.toFixed(1) : '-'} |`,
  )

  const rankRows = RANKS.map((rank) => {
    const yearsToReach = summary.yearsToRank[rank]
    const reachedAt = rank === 1 || yearsToReach === undefined ? '-' : years(yearsToReach)
    return `| ${rank}급 ${RANK_LABELS[rank]} | ${percent(summary.reachedRank[rank])} | ${reachedAt} | ${percent(summary.finalRank[rank] / summary.games)} |`
  })

  const objectRows = summary.objects.map((stat) => {
    const rate = (count: number) => (stat.assigned > 0 ? percent(count / stat.assigned) : '-')
    return `| ${stat.code} ${stat.name} | ${stat.tier}급 | ${stat.assigned} | ${rate(stat.cleared)} | ${rate(stat.failed)} | ${rate(stat.demoted)} | ${rate(stat.killed)} | ${rate(stat.brokeDown)} | ${rate(stat.unfinished)} |`
  })

  return [
    `## ${botLabel(summary.strategy, endingTitles)}`,
    '',
    `- 판 수: ${summary.games}`,
    `- 종료 나이: ${distributionText(summary.endAge)}`,
    `- 입사 후 경과 년수: ${distributionText(summary.careerYears)}`,
    `- 판당 관리 완료 객체: ${summary.avgObjectsManaged.toFixed(1)}개, 성공률 ${percent(summary.clearRate)}, 재배정 비율 ${percent(summary.reassignRate)}`,
    `- 판당 선택 횟수: ${summary.avgChoices.toFixed(1)}번`,
    `- 판당 막간 이벤트: ${summary.avgInterludes.toFixed(1)}회 (회복 ${summary.interludesByKind.recovery.toFixed(1)}, 성장 ${summary.interludesByKind.growth.toFixed(1)}, 관계 ${summary.interludesByKind.relationship.toFixed(1)})`,
    `- 종료 종류: ${endings}`,
    `- 최종 객체 도달: ${finaleReachedText(summary)}`,
    ...(finaleText ? [`- 최종 엔딩별: ${finaleText}`] : []),
    ...(finaleText
      ? [
          '- 최종 객체별 (맡은 판 수 → 엔딩, 비율은 그 객체를 맡은 판 대비; 맡았지만 엔딩 없이 끝난 판은 붕괴·사망·중단):',
          ...finaleObjectLines(summary, endingTitles).map((line) => `  - ${line}`),
        ]
      : []),
    `- 사망 원인(전체 판 대비): ${causes}`,
    '',
    '| 직급 | 도달 비율 | 평균 도달 시점(입사 후 년) | 종료 시 직급 |',
    '| --- | --- | --- | --- |',
    ...rankRows,
    '',
    '| 객체 | 등급 | 배정 | 성공 | 실패 | 좌천 | 사망 | 붕괴 | 중단 |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...objectRows,
    '',
    '(중단 = 객체 관리 도중 병·노화·100세로 끝남, 사망 = 즉사 선택지 또는 관리 중 입은 피해)',
    ...(interludeRows.length > 0
      ? [
          '',
          '| 막간 이벤트 | 종류 | 판당 횟수 | 선택 성공률 |',
          '| --- | --- | --- | --- |',
          ...interludeRows,
          '',
          '| NPC | 만난 판 비율 | 종료 시 평균 관계 |',
          '| --- | --- | --- |',
          ...npcRows,
        ]
      : []),
  ].join('\n')
}

export function formatSimulationReport(
  summaries: readonly SimulationSummary[],
  settings: ReportSettings,
  objects: readonly ContainmentObject[],
  endingTitles: Readonly<Record<string, string>> = {},
): string {
  const statsText = STAT_KEYS.map((key) => `${STAT_LABELS[key]} ${settings.stats[key]}`).join(', ')
  const objectCounts = RANKS.map((rank) => `${rank}급 ${objects.filter((object) => object.tier === rank).length}개`).join(', ')
  const promotionText = ([1, 2, 3, 4] as const)
    .map((rank) => {
      const requirement = PROMOTION_REQUIREMENTS[rank]
      return `${RANK_LABELS[rank]}→${RANK_LABELS[(rank + 1) as Rank]} ${requirement.points}점/평판 ${requirement.reputation}`
    })
    .join(', ')

  const tierModifierText = RANKS.map((rank) => {
    const modifier = TIER_CHANCE_MODIFIER[rank]
    return `${rank}급 ${modifier >= 0 ? '+' : ''}${(modifier * 100).toFixed(0)}%p`
  }).join(', ')

  const agePenaltyText = AGE_CHANCE_PENALTY.map(
    (tier) => `${tier.minAge}세+ -${(tier.penalty * 100).toFixed(0)}%p`,
  ).join(', ')

  return [
    '# 밸런스 시뮬레이션 결과',
    '',
    '## 설정',
    '',
    `- 판 수: ${settings.games} / 시드: ${settings.seed}`,
    `- 입사 스탯: ${statsText}`,
    `- 객체: ${objectCounts} (총 ${objects.length}개)`,
    `- 승급 기준: ${promotionText}`,
    `- 승급 점수: 성공 ${PROMOTION.successPoints}, 연속 성공 +${PROMOTION.streakBonusPerStep}/회(최대 ${PROMOTION.streakBonusMaxSteps}회), 무결점 +${PROMOTION.flawlessBonus}`,
    `- 재배정: 지식 보너스 +${REASSIGNMENT.knowledgeBonusFirst}(+${REASSIGNMENT.knowledgeBonusPerExtra}/회, 상한 +${REASSIGNMENT.knowledgeBonusMax}), 승급 점수 ×${REASSIGNMENT.pointMultiplier}`,
    `- 성공 확률 범위: ${percent(CHANCE_MIN)}~${percent(CHANCE_MAX)}`,
    `- 등급별 확률 보정: ${tierModifierText}`,
    `- 나이별 확률 감소: ${agePenaltyText}`,
    `- 정신력 연간 회복: +${YEARLY_SANITY_RECOVERY} / 스탯 상승 수확체감 하한: ×${GAIN_FLOOR}`,
    `- 막간 이벤트: 최소 간격 ${INTERLUDE.minIntervalYears}년, 조건 이벤트는 해마다 ${percent(INTERLUDE.specificChancePerYear)}, 일상 이벤트는 ${INTERLUDE.freeIntervalYears}년 이상 지난 뒤 해마다 ${percent(INTERLUDE.freeChancePerYear)}, 기본 쿨다운 ${INTERLUDE.defaultCooldownYears}년, 정신력 낮을 때 회복 가중 최대 ×${1 + INTERLUDE.recoveryNeedBonus}`,
    `- 시간 모델: 객체 시작 간격 ${OBJECT_SCHEDULE.intervalYears}±${OBJECT_SCHEDULE.jitterYears}년(끝난 뒤 최소 ${OBJECT_SCHEDULE.minGapAfterObject}년), 승급 점수 자동 누적 해마다 ${PASSIVE_PROMOTION.basePerYear}(평판·지식 보정, ${PASSIVE_PROMOTION.minPerYear}~${PASSIVE_PROMOTION.maxPerYear}), 객체 실패 -${PROMOTION.failurePenalty}점`,
    `- 최종 객체: 수석이 된 지 ${FINALE.minYearsAtRank5}년 이상이고 3막 서술(${FINALE.storyFlag})이 끝났거나 ${FINALE.maxYearsAtRank5}년 이상 수석일 때`,
    '- 봇의 선택: 확정 성공 선택지(최종 객체 X-011의 "문을 등지고 걸어 나간다", 퇴직)는 고르지 않는다 (퇴직을 노리는 엔딩 선호 봇만 고른다). 제안되는 최종 객체(X-016·X-017)는 항상 받아들인다.',
    '',
    ...summaries.flatMap((summary) => [formatSummary(summary, endingTitles), '']),
  ].join('\n')
}
