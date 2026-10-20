import { useEffect } from 'react'
import { backgrounds } from '../../../content'
import { DEFAULT_STATS } from '../../../engine/config'
import { STAT_LABELS } from '../../../engine/report'
import { STAT_KEYS } from '../../../engine/types'
import type { BackgroundDef } from '../../../engine/types'
import { formatSigned } from '../../../game/format'
import { Eyebrow } from '../Controls'
import { Narration } from '../Narration'

/** 기본 스탯과 비교한 입사 시점 스탯. 무엇을 얻고 무엇을 포기하는지 한눈에 보이게 한다. */
function BackgroundStats({ background }: { background: BackgroundDef }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {STAT_KEYS.map((key) => {
        const diff = background.stats[key] - DEFAULT_STATS[key]
        return (
          <li key={key} className="tabular-nums">
            <span className="text-fog">{STAT_LABELS[key]}</span> <span className="text-bone">{background.stats[key]}</span>
            {diff !== 0 && <span className={diff > 0 ? 'text-gain' : 'text-loss'}> ({formatSigned(diff)})</span>}
          </li>
        )
      })}
    </ul>
  )
}

interface BackgroundScreenProps {
  seed: number
  onSelect: (backgroundId: string) => void
}

/** 새 판의 첫 화면: 입사 서류의 경력란을 채운다. 고른 배경이 입사 시점의 스탯을 정한다. */
export function BackgroundScreen({ seed, onSelect }: BackgroundScreenProps) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) {
        return
      }
      const index = Number(event.key) - 1
      if (Number.isInteger(index) && index >= 0 && index < backgrounds.length) {
        onSelect(backgrounds[index].id)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onSelect])

  return (
    <section className="reveal grid gap-6">
      <div className="grid gap-2">
        <Eyebrow>입사 서류 · 시드 {seed}</Eyebrow>
        <h2 className="font-serif-kr text-3xl tracking-wide text-bone">경력란</h2>
      </div>

      <Narration text="입사 서류의 경력란이 비어 있다. 무엇을 적든 담당자는 더 묻지 않을 것이다. 다만 적은 대로 배치된다." />

      <ol className="grid gap-3">
        {backgrounds.map((background, index) => (
          <li key={background.id}>
            <button
              type="button"
              onClick={() => onSelect(background.id)}
              className="group grid w-full grid-cols-[1.5rem_1fr] items-start gap-x-3 gap-y-2 rounded border border-edge bg-panel/60 px-4 py-3 text-left transition-colors hover:border-glow/60 hover:bg-panel"
            >
              <span className="pt-0.5 text-sm tabular-nums text-ash group-hover:text-glow">{index + 1}</span>
              <span className="grid gap-1.5">
                <span className="font-serif-kr text-lg text-bone">{background.name}</span>
                <span className="font-serif-kr leading-relaxed text-fog">{background.summary}</span>
                <BackgroundStats background={background} />
              </span>
            </button>
          </li>
        ))}
      </ol>

      <p className="text-xs text-ash">고른 배경은 입사 시점의 스탯만 정한다 · 숫자 키로도 고를 수 있다</p>
    </section>
  )
}
