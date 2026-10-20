import { useEffect } from 'react'
import type { ChoiceOption } from '../../engine/game'
import { RISK_LABELS } from '../../game/format'

function RiskDots({ risk }: { risk: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((level) => (
        <span
          key={level}
          className={`inline-block size-1.5 rounded-full ${level <= risk ? 'bg-blood' : 'bg-edge'}`}
        />
      ))}
    </span>
  )
}

/**
 * 선택지 목록. 성공 확률 숫자는 보여 주지 않고 위험도(난이도)만 보여 준다. 객체 정보를 읽고 추리하는 재미를 위해서이고,
 * 실제 확률은 선택한 뒤 기록(스트림)에 남는다.
 * 숫자 키(1, 2, 3...)로도 고를 수 있다.
 */
export function ChoiceList({ options, onChoose }: { options: ChoiceOption[]; onChoose: (choiceId: string) => void }) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) {
        return
      }
      const index = Number(event.key) - 1
      if (Number.isInteger(index) && index >= 0 && index < options.length) {
        onChoose(options[index].choice.id)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [options, onChoose])

  return (
    <ol className="grid gap-3">
      {options.map(({ choice }, index) => (
        <li key={choice.id}>
          <button
            type="button"
            onClick={() => onChoose(choice.id)}
            className="group grid w-full grid-cols-[1.5rem_1fr_auto] items-start gap-x-3 rounded border border-edge bg-panel/60 px-4 py-3 text-left transition-colors hover:border-glow/60 hover:bg-panel"
          >
            <span className="pt-0.5 text-sm tabular-nums text-ash group-hover:text-glow">{index + 1}</span>
            <span className="font-serif-kr leading-relaxed text-bone">{choice.text}</span>
            <span className="flex items-center gap-1.5 pt-1 text-xs text-fog">
              <RiskDots risk={choice.risk} />
              {RISK_LABELS[choice.risk]}
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}
