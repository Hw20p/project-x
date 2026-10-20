import { useState } from 'react'
import { Link } from 'react-router-dom'
import { findBackground } from '../../../content'
import { describeEnding } from '../../../content/epilogues'
import { RANK_LABELS } from '../../../engine/config'
import type { GameState, ObjectReport } from '../../../engine/state'
import { formatAge, formatYears } from '../../../game/format'
import { Eyebrow, SectionLabel } from '../Controls'
import { Narration } from '../Narration'

const OUTCOME_LABELS: Record<ObjectReport['outcome'], string> = {
  cleared: '성공',
  failed: '실패',
  demoted: '규정 위반',
}

interface EndedScreenProps {
  state: GameState
  onRestart: () => void
}

/** 판이 끝난 뒤: 마지막 장면, 에필로그, 이번 삶의 기록 */
export function EndedScreen({ state, onRestart }: EndedScreenProps) {
  const [copied, setCopied] = useState(false)
  const { ending } = state
  if (!ending) {
    return null
  }
  const epilogue = describeEnding(ending)
  const cleared = state.history.filter((report) => report.outcome === 'cleared').length
  const interludeCount = state.interludeLog.length
  const background = state.backgroundId ? findBackground(state.backgroundId) : undefined
  const seedUrl = `${window.location.origin}/play?seed=${state.seed}${state.backgroundId ? `&bg=${state.backgroundId}` : ''}`

  const copySeedUrl = async () => {
    try {
      await navigator.clipboard.writeText(seedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 클립보드를 못 쓰는 환경에서는 아래에 보이는 주소를 직접 복사하면 된다.
    }
  }

  return (
    <section className="reveal grid gap-8">
      <div className="grid gap-4">
        <Eyebrow>끝 · {formatAge(ending.age)}</Eyebrow>
        <h2 className="font-serif-kr text-4xl tracking-widest text-bone">{epilogue.title}</h2>
        <Narration text={epilogue.text} />
      </div>

      <div>
        <SectionLabel>이번 삶의 기록</SectionLabel>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 border-l border-edge pl-4 text-sm">
          {background && (
            <>
              <dt className="text-fog">입사 배경</dt>
              <dd>{background.name}</dd>
            </>
          )}
          <dt className="text-fog">마지막 직급</dt>
          <dd>{RANK_LABELS[state.player.career.rank]}</dd>
          <dt className="text-fog">관리한 객체</dt>
          <dd>
            {state.history.length}건 (성공 {cleared}건)
          </dd>
          <dt className="text-fog">막간 이벤트</dt>
          <dd>{interludeCount}번</dd>
          <dt className="text-fog">시드</dt>
          <dd className="tabular-nums">{state.seed}</dd>
        </dl>
      </div>

      {state.history.length > 0 && (
        <details>
          <summary className="cursor-pointer select-none text-sm text-fog hover:text-bone">관리한 객체 목록</summary>
          <ul className="mt-3 grid gap-1 text-sm">
            {state.history.map((report, index) => (
              <li key={`${report.objectId}-${index}`} className="flex justify-between gap-4 border-b border-edge/60 py-1">
                <span>
                  {report.code} {report.name}
                  {report.reassigned && <span className="text-ash"> · 재배정</span>}
                </span>
                <span className={report.outcome === 'cleared' ? 'text-gain' : 'text-loss'}>
                  {OUTCOME_LABELS[report.outcome]} · {formatYears(report.yearsSpent)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="rounded border border-glow/50 px-6 py-2.5 text-glow transition-colors hover:bg-glow/10"
        >
          새 삶을 시작한다
        </button>
        <button
          type="button"
          onClick={copySeedUrl}
          className="rounded border border-edge px-4 py-2.5 text-sm text-fog transition-colors hover:border-fog hover:text-bone"
        >
          {copied ? '복사했다' : '이 삶의 주소 복사'}
        </button>
        <Link to="/" className="px-2 py-2.5 text-sm text-ash hover:text-fog">
          처음으로
        </Link>
      </div>
      <p className="break-all text-xs text-ash">같은 주소로 들어가면 같은 시드와 입사 배경으로 다시 시작할 수 있다 (선택이 같으면 결과도 같다).</p>
    </section>
  )
}
