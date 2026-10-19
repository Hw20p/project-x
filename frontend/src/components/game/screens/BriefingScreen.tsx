import { RANK_LABELS } from '../../../engine/config'
import { getObjectYears } from '../../../engine/rules'
import type { ContainmentObject } from '../../../engine/types'
import { formatYears } from '../../../game/format'
import { ContinueButton, Eyebrow, SectionLabel } from '../Controls'

interface BriefingScreenProps {
  object: ContainmentObject
  /** 이미 겪어 본 객체를 다시 맡는 경우 */
  reassigned: boolean
  knowledgeBonus: number
  onBegin: () => void
}

/** 새 객체를 배정받고 관찰 기록과 관리 매뉴얼을 읽는 화면 */
export function BriefingScreen({ object, reassigned, knowledgeBonus, onBegin }: BriefingScreenProps) {
  return (
    <section className="reveal grid gap-6">
      <div className="grid gap-2">
        <Eyebrow>
          {object.code} · {RANK_LABELS[object.tier]} 등급 객체{object.finale ? ' · 최종' : ''}
        </Eyebrow>
        <h2 className="text-3xl tracking-wide text-bone">{object.name}</h2>
        <p className="text-fog">{object.summary}</p>
      </div>

      {reassigned && (
        <p className="border-l-2 border-glow/50 pl-3 text-sm text-fog">
          이미 겪어 본 객체를 다시 맡는다. 그때의 기억이 판단을 돕는다. <span className="text-glow">지식 +{knowledgeBonus}</span>
          <span className="text-ash"> (이 객체를 관리하는 동안만)</span>
        </p>
      )}

      <div>
        <SectionLabel>관찰 기록</SectionLabel>
        <ul className="grid gap-2 border-l border-edge pl-4 leading-relaxed text-bone/90">
          {object.observation.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div>
        <SectionLabel>관리 매뉴얼</SectionLabel>
        <ol className="grid list-decimal gap-2 pl-8 leading-relaxed marker:text-ash">
          {object.manual.map((line) => (
            <li key={line} className={line.startsWith('(') ? 'italic text-ash' : 'text-bone/90'}>
              {line}
            </li>
          ))}
        </ol>
      </div>

      <p className="text-sm text-ash">
        예상 관리 기간 {formatYears(getObjectYears(object))} · {object.stages.length}단계
      </p>

      <ContinueButton label="관리를 시작한다" onClick={onBegin} />
    </section>
  )
}
