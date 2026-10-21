import type { ContainmentObject } from '../../../engine/types'
import { ContinueButton, Eyebrow } from '../Controls'
import { ObjectNotes } from '../ObjectNotes'

interface BriefingScreenProps {
  object: ContainmentObject
  /** 이미 겪어 본 객체를 다시 맡는 경우 */
  reassigned: boolean
  knowledgeBonus: number
  /** 지금까지의 이력으로 제안된 최종 객체인지. true면 거절하고 기본 최종 객체로 갈 수 있다. */
  offered?: boolean
  onBegin: () => void
  /** 제안을 거절하고 기본 최종 객체로 간다 (`offered`일 때만 쓰인다) */
  onDecline?: () => void
}

/** 새 객체를 배정받고 관찰 기록과 관리 매뉴얼을 읽는 화면 */
export function BriefingScreen({ object, reassigned, knowledgeBonus, offered = false, onBegin, onDecline }: BriefingScreenProps) {
  return (
    <section className="reveal grid gap-6">
      <div className="grid gap-2">
        <Eyebrow>
          {object.code} · 위험 등급 {object.tier}{object.finale ? ' · 최종' : ''}
        </Eyebrow>
        <h2 className="font-serif-kr text-3xl tracking-wide text-bone">{object.name}</h2>
        <p className="narration text-fog">{object.summary}</p>
      </div>

      {reassigned && (
        <p className="border-l-2 border-glow/50 pl-3 text-sm text-fog">
          이미 겪어 본 객체를 다시 맡는다. 그때의 기억이 판단을 돕는다. <span className="text-glow">지식 +{knowledgeBonus}</span>
          <span className="text-ash"> (이 객체를 관리하는 동안만)</span>
          {object.retryChanceBonus ? <span> 이번에는 모든 선택의 성공 확률이 올라간다.</span> : null}
        </p>
      )}

      {offered && (
        <p className="border-l-2 border-glow/50 pl-3 text-sm text-fog">
          지금까지의 이력으로 열린 길이다. <span className="text-glow">받아들이면</span> 이 객체를 맡고,{' '}
          <span className="text-glow">거절하면</span> 원래의 문으로 간다. 거절해도 이력은 그대로다.
        </p>
      )}

      <ObjectNotes object={object} />

      <div className="flex flex-wrap items-center gap-3">
        <ContinueButton label={offered ? '받아들인다' : '관리를 시작한다'} onClick={onBegin} />
        {offered && onDecline && (
          <button
            type="button"
            onClick={onDecline}
            className="mt-2 rounded border border-edge px-5 py-2.5 text-fog transition-colors hover:border-fog hover:text-bone"
          >
            거절하고 원래의 문으로 간다
          </button>
        )}
      </div>
    </section>
  )
}
