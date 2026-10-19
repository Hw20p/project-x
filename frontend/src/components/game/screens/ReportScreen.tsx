import { RANK_LABELS } from '../../../engine/config'
import type { Ending, ObjectReport } from '../../../engine/state'
import type { Rank } from '../../../engine/types'
import { formatYears } from '../../../game/format'
import { ContinueButton, Eyebrow } from '../Controls'

interface ReportScreenProps {
  report: ObjectReport
  /** 이 보고서를 본 뒤 판이 끝나는 경우(해고)의 종료 */
  pendingEnding: Ending | null
  onContinue: () => void
}

const OUTCOME_LABELS: Record<ObjectReport['outcome'], string> = {
  cleared: '관리 성공',
  failed: '관리 실패',
  demoted: '규정 위반',
}

/** 객체 한 건의 관리가 끝난 뒤 보는 결과 보고서 */
export function ReportScreen({ report, pendingEnding, onContinue }: ReportScreenProps) {
  const failed = report.outcome !== 'cleared'
  return (
    <section className="reveal grid gap-6">
      <div className="grid gap-2">
        <Eyebrow>
          {report.code} {report.name} · 관리 보고서
        </Eyebrow>
        <h2 className={`text-3xl tracking-wide ${failed ? 'text-loss' : 'text-bone'}`}>
          {OUTCOME_LABELS[report.outcome]}
        </h2>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 border-l border-edge pl-4 text-sm">
        <dt className="text-fog">소요 기간</dt>
        <dd>{formatYears(report.yearsSpent)}</dd>
        <dt className="text-fog">실패한 단계</dt>
        <dd>{report.failures}회{report.flawless ? ' · 무결점' : ''}</dd>
        {report.reassigned && (
          <>
            <dt className="text-fog">구분</dt>
            <dd>재배정 (승급 점수 절반)</dd>
          </>
        )}
      </dl>

      {report.promoted && (
        <p className="text-gain">
          승급: {RANK_LABELS[(report.rankAfter - 1) as Rank]} → {RANK_LABELS[report.rankAfter]}
        </p>
      )}
      {report.demoted && <p className="text-loss">좌천: {RANK_LABELS[report.rankAfter]}(으)로 내려간다.</p>}
      {pendingEnding?.kind === 'dismissed' && (
        <p className="text-loss">수습 직급에서의 규정 위반이다. 인사팀에서 해고 통보가 도착했다.</p>
      )}

      <ContinueButton label={pendingEnding ? '사원증을 반납한다' : '다음으로'} onClick={onContinue} />
    </section>
  )
}
