import { useState } from 'react'
import type { ChoiceOption } from '../../../engine/game'
import type { ContainmentObject, Stage } from '../../../engine/types'
import { ChoiceList } from '../ChoiceList'
import { Eyebrow } from '../Controls'
import { Narration } from '../Narration'
import { ObjectNotes } from '../ObjectNotes'

type Tab = 'choose' | 'info'

const TABS: { id: Tab; label: string }[] = [
  { id: 'choose', label: '선택' },
  { id: 'info', label: '객체 정보' },
]

interface ChoosingScreenProps {
  object: ContainmentObject
  stage: Stage
  stageIndex: number
  options: ChoiceOption[]
  onChoose: (choiceId: string) => void
}

/**
 * 관리 중인 객체의 현재 단계 서술과 선택지.
 * "객체 정보" 탭에서 배정 때 읽은 관찰 기록과 매뉴얼을 다시 볼 수 있다 (단계가 바뀌면 다시 "선택" 탭으로 열린다).
 */
export function ChoosingScreen({ object, stage, stageIndex, options, onChoose }: ChoosingScreenProps) {
  const [tab, setTab] = useState<Tab>('choose')

  return (
    <section className="grid gap-6">
      <div className="reveal grid gap-2">
        <Eyebrow>
          {object.code} {object.name} · {stageIndex + 1}/{object.stages.length}단계
        </Eyebrow>
        <h2 className="font-serif-kr text-2xl tracking-wide text-bone">{stage.title}</h2>
      </div>

      <div role="tablist" aria-label="객체 관리" className="-mt-2 flex gap-5 border-b border-edge">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 pb-2 text-sm transition-colors ${
              tab === id ? 'border-glow text-glow' : 'border-transparent text-ash hover:text-fog'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'choose' ? (
        <div role="tabpanel" className="reveal grid gap-6">
          <Narration text={stage.text} />

          <ChoiceList options={options} onChoose={onChoose} />

          <p className="text-xs text-ash">
            숫자 키로도 고를 수 있다
          </p>
        </div>
      ) : (
        <div role="tabpanel" className="reveal">
          <ObjectNotes object={object} />
        </div>
      )}
    </section>
  )
}
