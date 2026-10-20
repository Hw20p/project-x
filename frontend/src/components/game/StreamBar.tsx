import { SPEEDS } from '../../game/useStream'
import type { Speed } from '../../game/useStream'

/** 줄거리가 흐르는 속도 (1×·2×·4×). 상태 패널 위쪽에 붙는다. */
export function SpeedControl({ speed, onChange }: { speed: Speed; onChange: (speed: Speed) => void }) {
  return (
    <div className="flex shrink-0 items-center gap-1" role="group" aria-label="흐르는 속도">
      {SPEEDS.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={speed === value}
          className={`rounded-full border px-2.5 py-0.5 text-xs tabular-nums transition-colors ${
            speed === value ? 'border-glow/60 text-glow' : 'border-edge text-ash hover:border-fog hover:text-fog'
          }`}
        >
          {value}×
        </button>
      ))}
    </div>
  )
}

interface PendingCardProps {
  /** 카드 제목. 결정 종류마다 다른 문구를 쓴다 */
  title: string
  /** 기다리는 결정의 이름 (예: "X-001 · 첫 번째 단계") */
  label: string
  /** 팝업을 다시 여는 버튼 문구 */
  action: string
  onOpen: () => void
}

/** 닫아 둔 팝업을 다시 여는 카드. 줄거리가 다 흐르고 팝업이 닫혀 있을 때만 화면 아래에 떠 있다. */
export function PendingCard({ title, label, action, onOpen }: PendingCardProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 px-4">
      <div className="animate-fade-in-up pointer-events-auto mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-xl border border-blood/60 bg-ink px-5 py-3.5 shadow-2xl">
        <div className="min-w-0">
          <p className="text-bone">{title}</p>
          <p className="truncate text-sm text-ash">{label}</p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 rounded-lg bg-blood/80 px-5 py-2.5 text-sm text-bone transition-colors hover:bg-blood"
        >
          {action}
        </button>
      </div>
    </div>
  )
}
