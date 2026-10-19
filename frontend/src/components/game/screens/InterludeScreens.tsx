import { npcs } from '../../../content'
import type { ChoiceOption } from '../../../engine/game'
import type { InterludeResult } from '../../../engine/state'
import type { InterludeDef, InterludeKind, StatDelta } from '../../../engine/types'
import { formatYears } from '../../../game/format'
import { ChoiceList } from '../ChoiceList'
import { ContinueButton, Eyebrow } from '../Controls'
import { RelationChips, StatDeltaChips } from '../Effects'

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
        <h2 className="text-2xl tracking-wide text-bone">{def.title}</h2>
      </div>

      <p className="whitespace-pre-line leading-loose text-bone/90">{def.text}</p>

      <ChoiceList options={options} onChoose={onChoose} />

      {def.years !== undefined && def.years > 0 && (
        <p className="text-xs text-ash">이 일에는 {formatYears(def.years)}이 걸린다</p>
      )}
    </section>
  )
}

interface InterludeOutcomeScreenProps {
  def: InterludeDef
  result: InterludeResult
  delta: StatDelta
  onContinue: () => void
}

/** 막간 이벤트 선택의 결과. 계속하면 (시간이 들면 흐른 뒤) 원래 하던 일로 돌아간다. */
export function InterludeOutcomeScreen({ def, result, delta, onContinue }: InterludeOutcomeScreenProps) {
  return (
    <section className="reveal grid gap-6" aria-live="polite">
      <Eyebrow>
        {eyebrowText(def)} · {def.title}
      </Eyebrow>

      <p className="whitespace-pre-line leading-loose text-bone/90">{result.text}</p>

      <div className="grid gap-1">
        <StatDeltaChips delta={delta} />
        <RelationChips relations={result.relations} />
      </div>

      {def.years !== undefined && def.years > 0 && (
        <p className="text-sm text-fog">시간이 흐른다: {formatYears(def.years)}</p>
      )}

      <ContinueButton onClick={onContinue} />
    </section>
  )
}
