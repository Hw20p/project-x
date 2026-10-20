import { npcs } from '../../content'
import { RELATION_MAX, RELATION_MIN } from '../../engine/config'
import { STAT_LABELS } from '../../engine/report'
import { findActiveBonds } from '../../engine/rules'
import type { NpcDef } from '../../engine/types'
import { STAT_KEYS } from '../../engine/types'
import type { RelationsView as RelationsData } from '../../game/feed'
import { formatAge, formatSigned } from '../../game/format'
import { relationStageLabel } from '../../game/relations'
import { Portrait } from './Portrait'

/** 관계가 달라지는 경계(`NpcBond`의 구간 경계). 막대에 눈금으로 보여 준다. */
const MARKS = [-30, -10, 10, 30]

/** 지금 관계가 해마다 주는 효과: "매년 정신력 +1" */
function yearlyText(npc: NpcDef, relation: number): string | null {
  const total: Partial<Record<(typeof STAT_KEYS)[number], number>> = {}
  for (const bond of findActiveBonds(npc, relation)) {
    for (const key of STAT_KEYS) {
      const change = bond.yearly[key]
      if (change !== undefined) {
        total[key] = (total[key] ?? 0) + change
      }
    }
  }
  const parts = STAT_KEYS.filter((key) => total[key]).map((key) => `${STAT_LABELS[key]} ${formatSigned(total[key] ?? 0)}`)
  return parts.length > 0 ? `매년 ${parts.join(', ')}` : null
}

/** -100~100 사이의 값을 막대 위 위치(%)로 */
function position(value: number): number {
  return ((value - RELATION_MIN) / (RELATION_MAX - RELATION_MIN)) * 100
}

/** 가운데(0)에서 값 쪽으로 뻗는 막대 */
function Meter({ value, name }: { value: number; name: string }) {
  const center = position(0)
  const at = position(value)
  const left = Math.min(center, at)
  const width = Math.abs(at - center)
  return (
    <div
      className="relative h-1.5 rounded-full bg-edge"
      role="meter"
      aria-label={`${name}과의 관계`}
      aria-valuemin={RELATION_MIN}
      aria-valuemax={RELATION_MAX}
      aria-valuenow={value}
    >
      <div
        className="absolute top-0 h-full rounded-full transition-[left,width] duration-500"
        style={{
          left: `${left}%`,
          width: `${width}%`,
          backgroundColor: value >= 0 ? 'var(--color-gain)' : 'var(--color-loss)',
        }}
      />
      {MARKS.map((mark) => (
        <span key={mark} className="absolute top-[-2px] h-2.5 w-px bg-ash/60" style={{ left: `${position(mark)}%` }} aria-hidden="true" />
      ))}
      <span className="absolute top-[-3px] h-3 w-px bg-bone" style={{ left: `${center}%` }} aria-hidden="true" />
    </div>
  )
}

/**
 * 인간관계 화면. 만난 사람마다 지금의 관계 단계·값·해마다 받는 효과·최근의 변화를 보여 준다.
 * 아직 읽지 않은 줄거리의 결과는 반영하지 않는다 (`relations`는 읽은 줄 기준).
 */
export function RelationsView({
  relations,
  changes = {},
  playerAge,
}: {
  relations: RelationsData
  /** 사람별로 아직 못 본 관계 변화의 합. 0이 아니면 점수 옆에 (+3)처럼 보여 준다. */
  changes?: Record<string, number>
  playerAge: number
}) {
  const met = npcs.filter((npc) => relations.values[npc.id] !== undefined)
  const unmet = npcs.length - met.length

  if (met.length === 0) {
    return <p className="py-6 text-center text-sm text-ash">아직 이름을 아는 사람이 없다.</p>
  }

  return (
    <div>
      <ul className="grid gap-4">
        {met.map((npc) => {
          const value = relations.values[npc.id] ?? 0
          const effect = yearlyText(npc, value)
          return (
            <li key={npc.id} className="rounded-lg border border-edge bg-panel/60 px-4 py-3">
              <div className="flex items-start gap-3">
                <Portrait npcId={npc.id} age={playerAge + npc.ageGap} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-bone">
                      {npc.name}{' '}
                      <span className="text-xs text-ash">
                        {npc.role} · {formatAge(playerAge + npc.ageGap)}
                      </span>
                    </p>
                    <span className={`text-sm tabular-nums ${value > 0 ? 'text-gain' : value < 0 ? 'text-loss' : 'text-fog'}`}>
                      {value}
                      {changes[npc.id] ? (
                        <span className={`ml-1 text-xs ${changes[npc.id] > 0 ? 'text-gain' : 'text-loss'}`}>
                          ({formatSigned(changes[npc.id])})
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-fog">{npc.summary}</p>
                </div>
              </div>

              <div className="mt-3">
                <Meter value={value} name={npc.name} />
                <div className="mt-1.5 flex flex-wrap justify-between gap-x-3 text-xs">
                  <span className="text-bone">{relationStageLabel(npc, value)}</span>
                  {effect && <span className="text-ash">{effect}</span>}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      {unmet > 0 && <p className="mt-4 text-center text-xs text-ash">아직 마주치지 않은 사람이 있다.</p>}
    </div>
  )
}
