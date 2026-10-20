// 개발용 밸런스 확인 페이지 (/dev/sim, 개발 서버에서만 열림). 봇이 수천 판을 자동으로 돌려 집계한다.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { backgrounds, endings, endingTitles, gameContext, objects } from '../content'
import { DEFAULT_STATS, RANK_LABELS } from '../engine/config'
import {
  DEATH_CAUSE_LABELS,
  distributionText,
  ENDING_LABELS,
  finaleEndingsText,
  finaleReachedText,
  formatSimulationReport,
  percent,
  RANKS,
  STAT_LABELS,
  years,
} from '../engine/report'
import type { ReportSettings } from '../engine/report'
import { BASE_STRATEGIES, botLabel, endingBot, simulate } from '../engine/simulate'
import type { BotStrategy, SimulationSummary } from '../engine/simulate'
import { STAT_KEYS } from '../engine/types'
import type { Stats } from '../engine/types'

type CopyState = 'idle' | 'done' | 'failed'

const INTERLUDE_KIND_LABELS = { recovery: '회복', growth: '성장', relationship: '관계' } as const
/** 봇 선택: 개별 봇, 기본 봇 4종 전체(all), 엔딩 선호 봇 전체(endings) */
type StrategyChoice = BotStrategy | 'all' | 'endings'

const ENDING_BOTS: readonly BotStrategy[] = endings.map((ending) => endingBot(ending.id))

function SummaryCard({ summary }: { summary: SimulationSummary }) {
  const finaleText = finaleEndingsText(summary, endingTitles)
  return (
    <section className="rounded-lg border border-gray-300 p-4">
      <h2 className="text-lg font-bold">{botLabel(summary.strategy, endingTitles)}</h2>
      <p className="mb-3 text-sm text-gray-500">{summary.games.toLocaleString()}판</p>

      <dl className="mb-4 grid gap-1 text-sm">
        <div>
          <dt className="inline font-semibold">종료 나이: </dt>
          <dd className="inline">{distributionText(summary.endAge)}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">입사 후 경과 년수: </dt>
          <dd className="inline">{distributionText(summary.careerYears)}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">판당 관리 완료 객체: </dt>
          <dd className="inline">
            {summary.avgObjectsManaged.toFixed(1)}개 · 성공률 {percent(summary.clearRate)} · 재배정 비율{' '}
            {percent(summary.reassignRate)}
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold">판당 막간 이벤트: </dt>
          <dd className="inline">
            {summary.avgInterludes.toFixed(1)}회 (회복 {summary.interludesByKind.recovery.toFixed(1)} · 성장{' '}
            {summary.interludesByKind.growth.toFixed(1)} · 관계 {summary.interludesByKind.relationship.toFixed(1)})
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold">최종 객체 도달: </dt>
          <dd className="inline">{finaleReachedText(summary)}</dd>
        </div>
        {finaleText && (
          <div>
            <dt className="inline font-semibold">최종 엔딩별: </dt>
            <dd className="inline">{finaleText}</dd>
          </div>
        )}
      </dl>

      <div className="grid gap-4 sm:grid-cols-2">
        <table className="w-full text-sm">
          <caption className="mb-1 text-left font-semibold">종료 종류</caption>
          <tbody>
            {(Object.keys(ENDING_LABELS) as (keyof typeof ENDING_LABELS)[]).map((kind) => (
              <tr key={kind}>
                <td>{ENDING_LABELS[kind]}</td>
                <td className="text-right">{percent(summary.endings[kind] / summary.games)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="w-full text-sm">
          <caption className="mb-1 text-left font-semibold">사망 원인 (전체 판 대비)</caption>
          <tbody>
            {(Object.keys(DEATH_CAUSE_LABELS) as (keyof typeof DEATH_CAUSE_LABELS)[]).map((cause) => (
              <tr key={cause}>
                <td>{DEATH_CAUSE_LABELS[cause]}</td>
                <td className="text-right">{percent(summary.deathCauses[cause] / summary.games)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <table className="mt-4 w-full text-sm">
        <caption className="mb-1 text-left font-semibold">직급 도달</caption>
        <thead>
          <tr className="text-left text-gray-500">
            <th>직급</th>
            <th className="text-right">도달 비율</th>
            <th className="text-right">평균 도달 시점(입사 후 년)</th>
            <th className="text-right">종료 시 직급</th>
          </tr>
        </thead>
        <tbody>
          {RANKS.map((rank) => {
            const yearsToReach = summary.yearsToRank[rank]
            return (
              <tr key={rank}>
                <td>
                  {rank}급 {RANK_LABELS[rank]}
                </td>
                <td className="text-right">{percent(summary.reachedRank[rank])}</td>
                <td className="text-right">{rank === 1 || yearsToReach === undefined ? '-' : years(yearsToReach)}</td>
                <td className="text-right">{percent(summary.finalRank[rank] / summary.games)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <table className="mt-4 w-full text-sm">
        <caption className="mb-1 text-left font-semibold">객체별 결과 (배정 횟수 대비)</caption>
        <thead>
          <tr className="text-left text-gray-500">
            <th>객체</th>
            <th className="text-right">배정</th>
            <th className="text-right">성공</th>
            <th className="text-right">실패</th>
            <th className="text-right">좌천</th>
            <th className="text-right">사망</th>
            <th className="text-right">붕괴</th>
            <th className="text-right">중단</th>
          </tr>
        </thead>
        <tbody>
          {summary.objects.map((stat) => {
            const rate = (count: number) => (stat.assigned > 0 ? percent(count / stat.assigned) : '-')
            return (
              <tr key={stat.objectId}>
                <td>
                  {stat.code} {stat.name} <span className="text-gray-400">({stat.tier}급)</span>
                </td>
                <td className="text-right">{stat.assigned.toLocaleString()}</td>
                <td className="text-right">{rate(stat.cleared)}</td>
                <td className="text-right">{rate(stat.failed)}</td>
                <td className="text-right">{rate(stat.demoted)}</td>
                <td className="text-right">{rate(stat.killed)}</td>
                <td className="text-right">{rate(stat.brokeDown)}</td>
                <td className="text-right">{rate(stat.unfinished)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-gray-500">
        중단 = 객체 관리 도중 병·노화·100세로 끝난 경우. 사망 = 즉사 선택지 또는 관리 중 입은 피해.
      </p>

      {summary.interludeStats.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold">막간 이벤트·NPC 집계</summary>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th>이벤트</th>
                <th>종류</th>
                <th className="text-right">판당 횟수</th>
                <th className="text-right">선택 성공률</th>
              </tr>
            </thead>
            <tbody>
              {summary.interludeStats.map((stat) => (
                <tr key={stat.eventId}>
                  <td>{stat.title}</td>
                  <td>{INTERLUDE_KIND_LABELS[stat.kind]}</td>
                  <td className="text-right">{stat.perGame.toFixed(2)}</td>
                  <td className="text-right">{stat.taken > 0 ? percent(stat.successRate) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th>NPC</th>
                <th className="text-right">만난 판 비율</th>
                <th className="text-right">종료 시 평균 관계</th>
              </tr>
            </thead>
            <tbody>
              {summary.npcStats.map((stat) => (
                <tr key={stat.npcId}>
                  <td>{stat.name}</td>
                  <td className="text-right">{percent(stat.metRate)}</td>
                  <td className="text-right">{stat.metRate > 0 ? stat.avgRelation.toFixed(1) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </section>
  )
}

export function SimulationPage() {
  const [games, setGames] = useState(2000)
  const [seed, setSeed] = useState(1)
  const [strategy, setStrategy] = useState<StrategyChoice>('all')
  const [stats, setStats] = useState<Stats>({ ...DEFAULT_STATS })
  const [running, setRunning] = useState(false)
  const [summaries, setSummaries] = useState<SimulationSummary[]>([])
  const [elapsedMs, setElapsedMs] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  // 결과가 나온 시점의 입력값. 실행 후 입력칸을 바꿔도 리포트는 실제로 돌린 조건을 기록하도록 따로 보관한다.
  const [runSettings, setRunSettings] = useState<ReportSettings | null>(null)
  const [copyState, setCopyState] = useState<CopyState>('idle')

  const reportText =
    runSettings && summaries.length > 0 ? formatSimulationReport(summaries, runSettings, objects, endingTitles) : ''

  const handleRun = () => {
    setRunning(true)
    setError(null)
    // 렌더링을 먼저 끝내고 무거운 계산을 시작해서 "실행 중" 표시가 보이게 함
    setTimeout(() => {
      const started = performance.now()
      try {
        const targets: readonly BotStrategy[] =
          strategy === 'all' ? BASE_STRATEGIES : strategy === 'endings' ? ENDING_BOTS : [strategy]
        setSummaries(targets.map((target) => simulate(gameContext, target, games, seed, { stats })))
        setRunSettings({ games, seed, stats: { ...stats } })
        setElapsedMs(performance.now() - started)
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setRunning(false)
      }
    }, 30)
  }

  // 입사 배경을 고르면 아래 시작 스탯 입력칸이 그 배경의 값으로 채워진다 (직접 고쳐서 시험할 수도 있다)
  const handleBackgroundChange = (backgroundId: string) => {
    const background = backgrounds.find((candidate) => candidate.id === backgroundId)
    setStats({ ...(background?.stats ?? DEFAULT_STATS) })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText)
      setCopyState('done')
    } catch {
      // 클립보드 접근이 막힌 환경이면 아래 미리보기 텍스트를 직접 선택해서 복사하면 된다.
      setCopyState('failed')
    }
    setTimeout(() => setCopyState('idle'), 2500)
  }

  const handleDownload = () => {
    const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)
    const url = URL.createObjectURL(new Blob([reportText], { type: 'text/markdown;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `sim-${stamp}.md`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <Link to="/" className="text-sm text-gray-500 underline">
        ← 홈
      </Link>
      <h1 className="mt-2 text-2xl font-bold">밸런스 시뮬레이션</h1>
      <p className="mb-6 text-sm text-gray-500">
        봇이 선택지를 자동으로 골라 한 판을 끝까지 돌리고 수천 판을 집계한다. 같은 시드면 항상 같은 결과가 나온다. 수치를
        고치려면 <code>engine/config.ts</code>와 <code>content/objects/</code>를 수정하고 다시 실행하면 된다.
      </p>

      <div className="mb-6 grid gap-4 rounded-lg border border-gray-300 p-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="font-semibold">판 수</span>
          <input
            type="number"
            min={1}
            max={50000}
            value={games}
            onChange={(e) => setGames(Math.max(1, Math.min(50000, Number(e.target.value) || 1)))}
            className="rounded border border-gray-300 px-2 py-1"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-semibold">시드</span>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value) || 0)}
            className="rounded border border-gray-300 px-2 py-1"
          />
        </label>
        <label className="grid gap-1 text-sm sm:col-span-2">
          <span className="font-semibold">봇 전략</span>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as StrategyChoice)}
            className="rounded border border-gray-300 px-2 py-1"
          >
            <option value="all">전체 비교 (기본 봇 {BASE_STRATEGIES.length}종)</option>
            <option value="endings">엔딩 선호 봇 전체 ({ENDING_BOTS.length}종)</option>
            <optgroup label="기본 봇">
              {BASE_STRATEGIES.map((candidate) => (
                <option key={candidate} value={candidate}>
                  {botLabel(candidate)}
                </option>
              ))}
            </optgroup>
            <optgroup label="엔딩 선호 봇 (최종 객체 전까지는 안전 우선)">
              {ENDING_BOTS.map((candidate) => (
                <option key={candidate} value={candidate}>
                  {botLabel(candidate, endingTitles)}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <label className="grid gap-1 text-sm sm:col-span-2">
          <span className="font-semibold">입사 배경 (고르면 아래 스탯이 채워진다)</span>
          <select
            defaultValue=""
            onChange={(e) => handleBackgroundChange(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1"
          >
            <option value="">기본 스탯 (정신력 50, 체력 50, 평판 20, 지식 50)</option>
            {backgrounds.map((background) => (
              <option key={background.id} value={background.id}>
                {background.name} (정신력 {background.stats.sanity}, 체력 {background.stats.health}, 평판{' '}
                {background.stats.reputation}, 지식 {background.stats.knowledge})
              </option>
            ))}
          </select>
        </label>
        <fieldset className="grid gap-2 sm:col-span-2">
          <legend className="mb-1 text-sm font-semibold">입사 시점 스탯 (0~100)</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STAT_KEYS.map((key) => (
              <label key={key} className="grid gap-1 text-sm">
                <span>{STAT_LABELS[key]}</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={stats[key]}
                  onChange={(e) =>
                    setStats((prev) => ({ ...prev, [key]: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))
                  }
                  className="rounded border border-gray-300 px-2 py-1"
                />
              </label>
            ))}
          </div>
        </fieldset>
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="rounded bg-edge px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {running ? '실행 중...' : '실행'}
          </button>
          {elapsedMs !== null && !running && (
            <span className="ml-3 text-sm text-gray-500">{Math.round(elapsedMs).toLocaleString()}ms</span>
          )}
        </div>
      </div>

      {error && <p className="mb-4 rounded border border-red-300 p-3 text-sm text-red-600">{error}</p>}

      {reportText && (
        <section className="mb-6 rounded-lg border border-gray-300 p-4">
          <h2 className="mb-1 text-lg font-bold">결과 내보내기</h2>
          <p className="mb-3 text-sm text-gray-500">
            설정값과 전략별 집계를 마크다운 텍스트로 정리한다. 복사해서 그대로 붙여넣거나 파일로 저장하면 된다.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded bg-edge px-4 py-2 text-sm font-semibold text-white"
            >
              결과 복사
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded border border-fog px-4 py-2 text-sm font-semibold"
            >
              .md 파일로 저장
            </button>
            {copyState === 'done' && <span className="text-sm text-green-600">복사했습니다.</span>}
            {copyState === 'failed' && (
              <span className="text-sm text-red-600">복사에 실패했습니다. 아래 텍스트를 직접 선택해 복사하세요.</span>
            )}
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-sm text-gray-500">텍스트 미리보기</summary>
            <textarea
              readOnly
              value={reportText}
              rows={16}
              onFocus={(e) => e.currentTarget.select()}
              className="mt-2 w-full rounded border border-gray-300 p-2 font-mono text-xs"
            />
          </details>
        </section>
      )}

      <div className="grid gap-6">
        {summaries.map((summary) => (
          <SummaryCard key={summary.strategy} summary={summary} />
        ))}
      </div>
    </main>
  )
}
