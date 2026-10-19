import { npcs } from '../../content'
import { STAT_LABELS } from '../../engine/report'
import { STAT_KEYS } from '../../engine/types'
import type { StatDelta } from '../../engine/types'
import { formatSigned } from '../../game/format'

/** 선택 결과로 실제 바뀐 스탯 (수확체감까지 반영된 값). 변화가 없으면 아무것도 그리지 않는다. */
export function StatDeltaChips({ delta }: { delta: StatDelta }) {
  const keys = STAT_KEYS.filter((key) => delta[key] !== undefined)
  if (keys.length === 0) {
    return null
  }
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm" aria-label="스탯 변화">
      {keys.map((key) => {
        const value = delta[key] ?? 0
        return (
          <li key={key} className={value > 0 ? 'text-gain' : 'text-loss'}>
            {STAT_LABELS[key]} {formatSigned(value)}
          </li>
        )
      })}
    </ul>
  )
}

/** 선택 결과로 바뀐 NPC 관계. 변화가 없으면 아무것도 그리지 않는다. */
export function RelationChips({ relations }: { relations: Record<string, number> | undefined }) {
  const entries = Object.entries(relations ?? {}).filter(([, change]) => change !== 0)
  if (entries.length === 0) {
    return null
  }
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm" aria-label="관계 변화">
      {entries.map(([npcId, change]) => {
        const name = npcs.find((npc) => npc.id === npcId)?.name ?? npcId
        return (
          <li key={npcId} className={change > 0 ? 'text-gain' : 'text-loss'}>
            {name}과의 관계 {formatSigned(change)}
          </li>
        )
      })}
    </ul>
  )
}
