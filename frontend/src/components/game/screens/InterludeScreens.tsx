import { npcs } from '../../../content'
import type { ChoiceOption } from '../../../engine/game'
import type { InterludeDef, InterludeKind } from '../../../engine/types'
import { ChoiceList } from '../ChoiceList'
import { Eyebrow } from '../Controls'
import { Narration } from '../Narration'

const KIND_LABELS: Record<InterludeKind, string> = {
  recovery: '휴식',
  growth: '성장',
  relationship: '사람',
}

function eyebrowText(def: InterludeDef): string {
  const npc = npcs.find((candidate) => candidate.id === def.npcId)
  return npc ? `${KIND_LABELS[def.kind]} · ${npc.name} (${npc.role})` : KIND_LABELS[def.kind]
}

interface InterludeScreenProps {
  def: InterludeDef
  options: ChoiceOption[]
  onChoose: (choiceId: string) => void
}

/** 객체 관리 사이에 끼어드는 막간 이벤트의 서술과 선택지 */
export function InterludeScreen({ def, options, onChoose }: InterludeScreenProps) {
  return (
    <section className="reveal grid gap-6">
      <div className="grid gap-2">
        <Eyebrow>{eyebrowText(def)}</Eyebrow>
        <h2 className="font-serif-kr text-2xl tracking-wide text-bone">{def.title}</h2>
      </div>

      <Narration text={def.text} />

      <ChoiceList options={options} onChoose={onChoose} />
    </section>
  )
}
