import type { ReactNode } from 'react'
import { PROMOTION_REQUIREMENTS, RANK_LABELS } from '../../engine/config'
import { STAT_LABELS } from '../../engine/report'
import type { GameState } from '../../engine/state'
import { STAT_KEYS } from '../../engine/types'
import type { StatKey } from '../../engine/types'
import type { YearSnapshot } from '../../game/feed'
import { formatAge } from '../../game/format'

const STAT_COLORS: Record<StatKey, string> = {
  sanity: 'var(--color-sanity)',
  health: 'var(--color-health)',
  reputation: 'var(--color-reputation)',
  knowledge: 'var(--color-knowledge)',
}

function Bar({ label, value, color, max = 100 }: { label: string; value: number; color: string; max?: number }) {
  const ratio = Math.max(0, Math.min(1, value / max))
  return (
    <div className="grid grid-cols-[3.2rem_1fr_2rem] items-center gap-2 text-xs">
      <span className="text-fog">{label}</span>
      <div
        className="h-1 overflow-hidden rounded-full bg-edge"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round(value)}
      >
        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${ratio * 100}%`, backgroundColor: color }} />
      </div>
      <span className="text-right tabular-nums text-bone">{Math.round(value)}</span>
    </div>
  )
}

interface StatusPanelProps {
  state: GameState
  /** 오른쪽 위에 붙는 조작부 (속도·일시정지) */
  controls?: ReactNode
  /**
   * 화면이 재생 중인 시점의 나이·스탯·직급·승급 점수. 주면 엔진 상태 대신 이 값을 보여 줘서,
   * 줄거리가 한 해씩 재생되는 동안 나이와 스탯이 같이 올라가게 한다.
   */
  view?: YearSnapshot
  /**
   * 시간의 흐름 게이지. 한 해가 시작될 때(key가 바뀔 때) 비어 있다가 `durationMs`에 걸쳐 끊기지 않고 차오른다.
   * `full`이면 가득 찬 채로 멈춰 있다 (팝업 앞에서 시간이 멈춘 때). `paused`이면 찬 만큼에서 멈춘다.
   */
  gauge?: { key: number; durationMs: number; full: boolean; paused: boolean }
  /** 이름을 알게 된 사람이 있는지. 있으면 "관계" 버튼이 나온다. */
  hasRelations?: boolean
  /** 아직 관계 화면에서 확인하지 않은 변화가 있는지. 버튼에 빨간 점이 붙는다. */
  relationsChanged?: boolean
  onOpenRelations?: () => void
}

/** 화면 위쪽에 항상 보이는 상태: 나이·직급·승급 진행, 시간의 흐름 게이지, 네 가지 스탯, 인간관계 */
export function StatusPanel({ state, controls, view, gauge, hasRelations = false, relationsChanged = false, onOpenRelations }: StatusPanelProps) {
  const age = view?.age ?? state.player.age
  const stats = view?.stats ?? state.player.stats
  const rank = view?.rank ?? state.player.career.rank
  const points = view?.points ?? state.player.career.promotionPoints
  const requirement = rank === 5 ? null : PROMOTION_REQUIREMENTS[rank]

  return (
    <header className="border-b border-edge bg-ink/70 px-4 py-3 backdrop-blur">
      <div className="mx-auto max-w-2xl">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-bone">
            {RANK_LABELS[rank]} <span className="text-fog">· {rank}급</span>
            <span className="ml-3 tabular-nums text-fog">{formatAge(age)}</span>
          </span>
          <span className="flex items-center gap-3">
            {hasRelations && onOpenRelations && (
              <button
                type="button"
                onClick={onOpenRelations}
                className="relative rounded border border-glow/70 px-2 py-0.5 text-xs text-glow hover:bg-glow/10"
              >
                관계
                {relationsChanged && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-loss" role="img" aria-label="새 변화" />
                )}
              </button>
            )}
            {controls}
          </span>
        </div>

        {gauge && (
          <div className="mb-2 h-0.5 overflow-hidden rounded-full bg-edge" role="presentation" aria-hidden="true">
            {gauge.full ? (
              <div className="h-full w-full rounded-full bg-fog" />
            ) : (
              <div
                key={gauge.key}
                className="year-gauge-fill h-full w-full rounded-full bg-fog"
                style={{
                  animationDuration: `${Math.max(1, Math.round(gauge.durationMs))}ms`,
                  animationPlayState: gauge.paused ? 'paused' : 'running',
                }}
              />
            )}
          </div>
        )}

        <div className="grid gap-1.5">
          {STAT_KEYS.map((key) => (
            <Bar key={key} label={STAT_LABELS[key]} value={stats[key]} color={STAT_COLORS[key]} />
          ))}
        </div>

        {requirement ? (
          <div className="mt-2 grid gap-1">
            <Bar label="승급" value={points} max={requirement.points} color="var(--color-glow)" />
            <p className="text-right text-xs text-ash">
              점수 {Math.round(points)}/{requirement.points} · 평판 {Math.round(stats.reputation)}/{requirement.reputation}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-right text-xs text-ash">최고 직급</p>
        )}
      </div>
    </header>
  )
}
