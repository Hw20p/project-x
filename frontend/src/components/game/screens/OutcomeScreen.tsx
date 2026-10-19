import type { ChoiceResult } from '../../../engine/state'
import type { StatDelta } from '../../../engine/types'
import { formatYears } from '../../../game/format'
import { ContinueButton, Eyebrow } from '../Controls'
import { StatDeltaChips } from '../Effects'

interface OutcomeScreenProps {
  result: ChoiceResult
  /** 이 단계에 걸린 시간(년). 계속하면 이만큼 시간이 흐른다. */
  stageYears: number
  delta: StatDelta
  onContinue: () => void
}

/** 객체 선택지의 결과 서술. 읽고 나서 계속하면 시간이 흐른다. */
export function OutcomeScreen({ result, stageYears, delta, onContinue }: OutcomeScreenProps) {
  const demoted = result.failureKind === 'demotion'
  return (
    <section className="reveal grid gap-6" aria-live="polite">
      <div className="grid gap-1">
        <Eyebrow>{result.success ? '성공' : '실패'} · 성공 확률 {Math.round(result.chance * 100)}%</Eyebrow>
      </div>

      <p className={`whitespace-pre-line leading-loose ${result.success ? 'text-bone' : 'text-bone/90'}`}>
        {result.text}
      </p>

      <StatDeltaChips delta={delta} />

      <div className="grid gap-1 text-sm text-fog">
        {demoted && <p className="text-loss">규정 위반으로 이 객체의 관리가 중단된다.</p>}
        {result.endsObject && !demoted && <p>이 객체의 관리가 끝난다.</p>}
        {stageYears > 0 && <p>시간이 흐른다: {formatYears(stageYears)}</p>}
      </div>

      <ContinueButton onClick={onContinue} />
    </section>
  )
}
