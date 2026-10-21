// 등장 조건(`InterludeCondition`·`AfterwordCondition`)을 사람이 읽는 짧은 문구 목록으로 바꾼다. 개발용 안내 페이지가 쓴다.
import { backgrounds, endingTitles, npcs } from '../content'
import type { AfterwordCondition } from '../engine/afterword'
import { RANK_LABELS } from '../engine/config'
import { ENDING_LABELS, STAT_LABELS } from '../engine/report'
import type { StatKey } from '../engine/types'

function span(min: number | undefined, max: number | undefined, unit = ''): string {
  if (min !== undefined && max !== undefined) {
    return `${min}~${max}${unit}`
  }
  return min !== undefined ? `${min}${unit} 이상` : `${max}${unit} 이하`
}

export function describeCondition(when: AfterwordCondition | undefined): string[] {
  if (!when) {
    return ['조건 없음']
  }
  const parts: string[] = []
  if (when.minRank !== undefined) {
    parts.push(`직급 ${RANK_LABELS[when.minRank]} 이상`)
  }
  if (when.maxRank !== undefined) {
    parts.push(`직급 ${RANK_LABELS[when.maxRank]} 이하`)
  }
  if (when.minAge !== undefined || when.maxAge !== undefined) {
    parts.push(`나이 ${span(when.minAge, when.maxAge, '세')}`)
  }
  for (const [key, range] of Object.entries(when.stats ?? {})) {
    if (range) {
      parts.push(`${STAT_LABELS[key as StatKey]} ${span(range.min, range.max)}`)
    }
  }
  for (const flag of when.flags ?? []) {
    parts.push(`플래그 ${flag}`)
  }
  if (when.anyFlags) {
    parts.push(`플래그 중 하나 ${when.anyFlags.join(' / ')}`)
  }
  for (const flag of when.notFlags ?? []) {
    parts.push(`${flag} 아님`)
  }
  for (const [npcId, range] of Object.entries(when.relations ?? {})) {
    const name = npcs.find((npc) => npc.id === npcId)?.name ?? npcId
    parts.push(`${name} 관계 ${span(range.min, range.max)}`)
  }
  if (when.backgrounds) {
    parts.push(`입사 배경 ${when.backgrounds.map((id) => backgrounds.find((item) => item.id === id)?.name ?? id).join('·')}`)
  }
  if (when.objects) {
    parts.push(`객체 ${when.objects.join('·')}`)
  }
  if (when.objectTiers) {
    parts.push(`객체 ${when.objectTiers.join('·')}급`)
  }
  if (when.endingKinds) {
    parts.push(`끝 ${when.endingKinds.map((kind) => ENDING_LABELS[kind]).join('·')}`)
  }
  if (when.endingIds) {
    parts.push(`엔딩 ${when.endingIds.map((id) => endingTitles[id] ?? id).join('·')}`)
  }
  return parts.length > 0 ? parts : ['조건 없음']
}
