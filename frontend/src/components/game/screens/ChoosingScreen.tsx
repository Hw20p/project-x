import type { ChoiceOption } from '../../../engine/game'
import type { ContainmentObject, Stage } from '../../../engine/types'
import { formatYears } from '../../../game/format'
import { ChoiceList } from '../ChoiceList'
import { Eyebrow } from '../Controls'

interface ChoosingScreenProps {
  object: ContainmentObject
  stage: Stage
  stageIndex: number
  options: ChoiceOption[]
  onChoose: (choiceId: string) => void
}

/** 관리 중인 객체의 현재 단계 서술과 선택지 */
export function ChoosingScreen({ object, stage, stageIndex, options, onChoose }: ChoosingScreenProps) {
  return (
    <section className="reveal grid gap-6">
      <div className="grid gap-2">
        <Eyebrow>
          {object.code} {object.name} · {stageIndex + 1}/{object.stages.length}단계
        </Eyebrow>
        <h2 className="text-2xl tracking-wide text-bone">{stage.title}</h2>
      </div>

      <p className="whitespace-pre-line leading-loose text-bone/90">{stage.text}</p>

      <ChoiceList options={options} onChoose={onChoose} />

      <p className="text-xs text-ash">
        이 단계에는 {formatYears(stage.years)}이 걸린다 · 숫자 키로도 고를 수 있다
      </p>
    </section>
  )
}
