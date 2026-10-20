import { useState } from 'react'
import { Link } from 'react-router-dom'
import { afterwords as afterwordDefs, findBackground, npcs } from '../../../content'
import { describeEnding } from '../../../content/epilogues'
import { pickAfterwords } from '../../../engine/afterword'
import { RANK_LABELS } from '../../../engine/config'
import type { GameState, ObjectReport } from '../../../engine/state'
import { canShareImage, downloadBlob, renderEndingCard } from '../../../game/endingCard'
import { formatAge } from '../../../game/format'
import { relationStageLabel } from '../../../game/relations'
import { Eyebrow, SectionLabel } from '../Controls'
import { Narration } from '../Narration'

const OUTCOME_LABELS: Record<ObjectReport['outcome'], string> = {
  cleared: '성공',
  failed: '실패',
  demoted: '규정 위반',
}

/** 관리 성공이 연속된 가장 긴 횟수 */
function longestClearStreak(history: readonly ObjectReport[]): number {
  let best = 0
  let run = 0
  for (const report of history) {
    run = report.outcome === 'cleared' ? run + 1 : 0
    best = Math.max(best, run)
  }
  return best
}

interface EndedScreenProps {
  state: GameState
  onRestart: () => void
}

/** 판이 끝난 뒤: 마지막 장면, 에필로그, 이번 삶의 기록 */
export function EndedScreen({ state, onRestart }: EndedScreenProps) {
  const [copied, setCopied] = useState(false)
  const [cardState, setCardState] = useState<'idle' | 'busy' | 'error'>('idle')
  const { ending } = state
  if (!ending) {
    return null
  }
  const epilogue = describeEnding(ending)
  const afterwords = pickAfterwords(afterwordDefs, state)
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

  // 엔딩 카드: 종료 화면의 내용을 한 장의 이미지로 그려 저장하거나(공유 시트가 되는 기기에서는) 공유한다
  const makeCard = () =>
    renderEndingCard({
      age: ending.age,
      title: epilogue.title,
      epilogue: epilogue.text,
      afterwords: afterwords.map((afterword) => afterword.text),
      backgroundId: state.backgroundId,
      backgroundName: background?.name,
      rankLabel: RANK_LABELS[state.player.career.rank],
      stats: state.player.stats,
      rankPath: state.rankLog.map((record) => ({ label: RANK_LABELS[record.rank], age: record.age })),
      relations: npcs
        .filter((npc) => state.relations[npc.id] !== undefined)
        .map((npc) => ({
          npcId: npc.id,
          name: npc.name,
          role: npc.role,
          age: ending.age + npc.ageGap,
          label: relationStageLabel(npc, state.relations[npc.id]),
          value: state.relations[npc.id],
          lover: state.flags.includes(`${npc.id}-lover`),
        })),
      objects: state.history.map((report) => ({
        code: report.code,
        name: report.name,
        outcome: report.outcome,
        reassigned: report.reassigned,
      })),
      highlights: {
        managed: state.history.length,
        streak: longestClearStreak(state.history),
        flawless: state.history.filter((report) => report.flawless).length,
        choices: state.choiceLog.length + state.interludeLog.length,
      },
      seed: state.seed,
      host: window.location.host,
    })
  const cardFilename = `제단X-${epilogue.title}-${Math.floor(ending.age)}세.png`

  const saveCard = async () => {
    setCardState('busy')
    try {
      downloadBlob(await makeCard(), cardFilename)
      setCardState('idle')
    } catch {
      setCardState('error')
    }
  }

  const shareCard = async () => {
    setCardState('busy')
    try {
      const file = new File([await makeCard()], cardFilename, { type: 'image/png' })
      await navigator.share({ files: [file], title: '제단X', text: `${epilogue.title} · ${Math.floor(ending.age)}세` })
      setCardState('idle')
    } catch (error) {
      // 공유 시트를 닫은 것(AbortError)은 실패가 아니다
      setCardState(error instanceof DOMException && error.name === 'AbortError' ? 'idle' : 'error')
    }
  }

  return (
    <section className="reveal grid gap-8">
      <div className="grid gap-4">
        <Eyebrow>끝 · {formatAge(ending.age)}</Eyebrow>
        <h2 className="font-serif-kr text-4xl tracking-widest text-bone">{epilogue.title}</h2>
        <Narration text={epilogue.text} />
        {afterwords.length > 0 && (
          // 후일담: 살아온 이력(연인·관계·직급·입사 배경)과 끝난 방식에 따라 골라진 짧은 글
          <div className="grid gap-2 border-l border-edge pl-4" aria-label="후일담">
            {afterwords.map((afterword) => (
              <p key={afterword.id} className="narration text-[0.95rem] text-fog">
                {afterword.text}
              </p>
            ))}
          </div>
        )}
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
                  {OUTCOME_LABELS[report.outcome]}
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
          onClick={saveCard}
          disabled={cardState === 'busy'}
          className="rounded border border-edge px-4 py-2.5 text-sm text-fog transition-colors hover:border-fog hover:text-bone disabled:opacity-50"
        >
          {cardState === 'busy' ? '카드를 그리는 중…' : '엔딩 카드 저장'}
        </button>
        {canShareImage() && (
          <button
            type="button"
            onClick={shareCard}
            disabled={cardState === 'busy'}
            className="rounded border border-edge px-4 py-2.5 text-sm text-fog transition-colors hover:border-fog hover:text-bone disabled:opacity-50"
          >
            공유
          </button>
        )}
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
      {cardState === 'error' && <p className="text-xs text-loss">카드를 만들지 못했다. 잠시 뒤 다시 시도해 주세요.</p>}
      <p className="break-all text-xs text-ash">같은 주소로 들어가면 같은 시드와 입사 배경으로 다시 시작할 수 있다 (선택이 같으면 결과도 같다).</p>
    </section>
  )
}
