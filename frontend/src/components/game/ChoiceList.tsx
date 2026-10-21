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
 * 조건부 선택지(`Choice.requires`)는 조건을 채웠을 때만 `options`에 들어와서, 못 채웠으면 목록에 아예 나오지 않는다.
 * 나타난 조건부 선택지는 번호 아래에 옅은 ◆ 표식이 붙어서, 이력으로 열린 길임을 알 수 있다 (카드 모양은 다른 선택지와 같다).
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
            // 조건부 선택지(`requires`)는 지금까지의 이력으로 열린 길이라 번호 아래에 옅은 ◆ 표식만 붙인다
            title={choice.requires ? '지금까지의 이력으로 열린 선택지' : undefined}
            className="group grid w-full grid-cols-[1.5rem_1fr_auto] items-start gap-x-3 rounded border border-edge bg-panel/60 px-4 py-3 text-left transition-colors hover:border-glow/60 hover:bg-panel"
          >
            <span className="flex flex-col items-center gap-0.5 pt-0.5 text-sm tabular-nums text-ash group-hover:text-glow">
              {index + 1}
              {choice.requires && (
                <span className="text-[0.6rem] leading-none text-glow/50" aria-hidden="true">
                  ◆
                </span>
              )}
            </span>
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
