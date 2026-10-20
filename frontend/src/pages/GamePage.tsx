import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { findBackground, gameContext } from '../content'
import { DecisionPopup } from '../components/game/DecisionPopup'
import { Stream } from '../components/game/Stream'
import { PendingCard, SpeedControl } from '../components/game/StreamBar'
import { StatusPanel } from '../components/game/StatusPanel'
import { BackgroundScreen } from '../components/game/screens/BackgroundScreen'
import { BriefingScreen } from '../components/game/screens/BriefingScreen'
import { ChoosingScreen } from '../components/game/screens/ChoosingScreen'
import { EndedScreen } from '../components/game/screens/EndedScreen'
import { InterludeScreen } from '../components/game/screens/InterludeScreens'
import { getChoiceOptions, getCurrentInterlude, getCurrentObject, getCurrentStage } from '../engine/game'
import type { GameAction } from '../engine/game'
import type { GameState } from '../engine/state'
import type { FeedItem, YearSnapshot } from '../game/feed'
import { useGame } from '../game/useGame'
import type { StartOptions } from '../game/useGame'
import { readingDelay, useStream } from '../game/useStream'

/**
 * 주소를 읽는다.
 * - `?seed=123&bg=researcher`: 그 시드와 입사 배경으로 바로 시작 (같은 삶을 다시 시작할 때)
 * - `?seed=123`: 그 시드로 새 판, 입사 배경은 고른다
 * - `?new=1`: 새 판 (시드는 무작위, 입사 배경은 고른다)
 * - 없으면 저장된 판을 이어 하고, 저장된 판이 없으면 새 판
 */
function readStartOptions(params: URLSearchParams): StartOptions {
  const seed = Number(params.get('seed'))
  if (params.has('seed') && Number.isInteger(seed) && seed >= 0) {
    const backgroundId = params.get('bg')
    // 모르는 배경 id는 무시하고 배경 선택 화면으로 보낸다
    return backgroundId && findBackground(backgroundId) ? { seed, backgroundId } : { seed }
  }
  return { fresh: params.has('new') }
}

export function GamePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // 시작 옵션은 처음 한 번만 읽는다. 이후 주소가 바뀌어도 진행 중인 판은 그대로 둔다.
  const [startOptions] = useState(() => readStartOptions(searchParams))
  const { game, seed, feed, resumed, act, start, restart } = useGame(startOptions)

  // 새 판 주소로 들어왔다면 주소를 정리해서, 새로고침했을 때 또 새 판이 시작되지 않게 한다.
  useEffect(() => {
    if (searchParams.size > 0) {
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  // 아직 입사 배경을 고르는 중이면 배경 선택 화면만 보여 준다 (상태 패널은 판이 시작된 뒤부터)
  if (!game) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-14">
          <BackgroundScreen seed={seed} onSelect={start} />
        </main>
        <footer className="mx-auto flex w-full max-w-2xl justify-between px-5 pb-6 text-xs text-ash">
          <Link to="/" className="hover:text-fog">
            처음으로
          </Link>
        </footer>
      </div>
    )
  }

  return <PlayView game={game} feed={feed} resumed={resumed} act={act} restart={restart} />
}

interface PlayViewProps {
  game: GameState
  feed: FeedItem[]
  resumed: boolean
  act: (action: GameAction) => void
  restart: () => void
}

/** 선택을 기다리는 단계(팝업으로 띄운다)인지, 시간이 흘러가는 단계(스트림으로 보여 준다)인지 */
const DECISION_PHASES: readonly GameState['phase'][] = ['briefing', 'choosing', 'interlude']
const FLOWING_PHASES: readonly GameState['phase'][] = ['outcome', 'report', 'interludeOutcome']

/** 새 줄이 나올 때 읽던 곳이 바닥 근처이면 따라 내려간다 (위로 올려 읽는 중이면 그대로 둔다) */
const FOLLOW_DISTANCE_PX = 420

function snapshotOf(game: GameState): YearSnapshot {
  const { age, stats, career } = game.player
  return { age, stats, rank: career.rank, points: career.promotionPoints }
}

/** 한 해에 속하는 줄의 종류: 한 해 표시 뒤에 이어지는 서술·알림. 선택 결과·보고서·객체 배정 같은 것은 그 해가 아니다. */
const YEAR_LINE_KINDS: readonly FeedItem['kind'][] = ['ambient', 'beat', 'system']

/**
 * 줄거리 재생 상황에서 상태 패널과 게이지가 보여 줄 것을 정한다.
 * - view: 아직 재생하지 않은 "한 해 표시"가 남아 있으면(엔진 상태가 재생보다 앞서 있으면), 마지막으로 재생한 해의
 *   스냅샷(없으면 재생 전 기준 상태)을 보여 준다. 남아 있지 않으면 undefined (엔진 상태를 그대로).
 * - gauge: 시간의 흐름 게이지. 한 해 표시가 재생되는 순간부터 그 해의 줄을 다 읽을 때까지 끊기지 않고 천천히 찬다
 *   (한 해의 길이 = 그 해의 줄을 읽는 시간의 합). 흐르는 시간이 아닐 때(팝업에서 멈춘 때)는 가득 찬 채로 있다.
 *   한 해 표시가 한 번도 없으면 undefined.
 */
function describePlayback(
  feed: readonly FeedItem[],
  revealed: number,
  base: { snapshot: YearSnapshot; feedLength: number },
): { view: YearSnapshot | undefined; gauge: { key: number; durationMs: number; full: boolean } | undefined } {
  let lastYear = -1
  for (let index = Math.min(revealed, feed.length) - 1; index >= 0; index--) {
    if (feed[index].kind === 'year') {
      lastYear = index
      break
    }
  }
  const yearAfterRevealed = feed.findIndex((item, index) => index >= revealed && item.kind === 'year')
  // 기준 상태를 잡은 뒤에 생긴 한 해 표시만 "지금 흐르는 시간"의 것이다 (그보다 앞의 것은 이미 지난 일)
  const flowing = lastYear >= base.feedLength

  let view: YearSnapshot | undefined
  if (yearAfterRevealed !== -1) {
    view = flowing ? feed[lastYear].snapshot : base.snapshot
  }

  let gauge: { key: number; durationMs: number; full: boolean } | undefined
  if (lastYear >= 0) {
    const age = feed[lastYear].age
    if (!flowing) {
      gauge = { key: age, durationMs: 0, full: true }
    } else {
      // 이 해에 속하는 줄(다음 한 해 표시 전까지의 서술·알림)을 읽는 시간의 합이 게이지가 차는 시간이다
      let durationMs = readingDelay(feed[lastYear])
      for (let index = lastYear + 1; index < feed.length && YEAR_LINE_KINDS.includes(feed[index].kind); index++) {
        durationMs += readingDelay(feed[index])
      }
      gauge = { key: age, durationMs, full: false }
    }
  }
  return { view, gauge }
}

/**
 * 진행 중인 판의 화면. 줄거리는 스트림에 한 줄씩 쌓이고, 선택이 필요한 순간(객체 배정·단계 선택·막간 이벤트)에만
 * 팝업이 뜬다. 선택하면 팝업이 닫히고 그 결과·보고서·시간이 흐르는 서술이 이어서 스트림에 나온다.
 */
function PlayView({ game, feed, resumed, act, restart }: PlayViewProps) {
  // 저장본을 이어 한 경우 쌓여 있던 줄은 바로 보여 준다. 새 판이면 처음부터 한 줄씩.
  const [initialRevealed] = useState(() => (resumed ? feed.length : 0))
  const stream = useStream(feed, initialRevealed)

  const object = getCurrentObject(gameContext, game)
  const stage = getCurrentStage(gameContext, game)
  const interlude = getCurrentInterlude(gameContext, game)
  const options = getChoiceOptions(gameContext, game)

  // ── 팝업: 선택이 필요한 단계에서, 줄거리가 다 흐르면(배정 안내 줄까지 읽은 뒤) 저절로 열린다.
  // 닫으면 그 단계가 끝날 때까지 닫힌 채로 있고, 아래 카드의 "다시 펼치기"로 다시 연다. 줄거리가 흐르는 동안에는 열 수 없다.
  const decisionKey = DECISION_PHASES.includes(game.phase)
    ? `${game.phase}:${game.choiceLog.length}:${game.history.length}`
    : null
  const [closedKey, setClosedKey] = useState<string | null>(null)
  const decisionReady = decisionKey !== null && stream.idle
  const popupOpen = decisionReady && closedKey !== decisionKey
  const closePopup = useCallback(() => setClosedKey(decisionKey), [decisionKey])
  const openPopup = () => setClosedKey(null)

  let popupLabel = ''
  let pendingLabel: string | null = null
  // 팝업을 닫았을 때 떠 있는 카드의 문구: 결정 종류마다 다르게
  let pendingTitle = ''
  let pendingAction = ''
  let popupBody: ReactNode = null
  if (game.phase === 'briefing' && object && game.progress) {
    popupLabel = '새 객체 배정'
    pendingLabel = `${object.code} 「${object.name}」 배정`
    pendingTitle = '서류가 책상 위에 놓여 있다'
    pendingAction = '서류를 펼친다'
    popupBody = (
      <BriefingScreen
        object={object}
        reassigned={game.progress.reassigned}
        knowledgeBonus={game.progress.knowledgeBonus}
        onBegin={() => act({ type: 'begin' })}
      />
    )
  } else if (game.phase === 'choosing' && object && stage && game.progress) {
    popupLabel = '객체 관리'
    pendingLabel = `${object.code} · ${stage.title}`
    pendingTitle = '아직 선택하지 않았다'
    pendingAction = '다시 마주한다'
    popupBody = (
      <ChoosingScreen
        object={object}
        stage={stage}
        stageIndex={game.progress.stageIndex}
        options={options}
        onChoose={(choiceId) => act({ type: 'choose', choiceId })}
      />
    )
  } else if (game.phase === 'interlude' && interlude) {
    popupLabel = '막간'
    pendingLabel = `막간 · ${interlude.title}`
    pendingTitle = '시간이 잠시 멈춰 있다'
    pendingAction = '돌아간다'
    popupBody = <InterludeScreen def={interlude} options={options} onChoose={(choiceId) => act({ type: 'choose', choiceId })} />
  }

  // ── 시간이 흐르는 단계(결과·보고서)는 줄거리를 다 읽은 뒤 저절로 다음으로 넘어간다.
  // 같은 상태에서 두 번 넘어가지 않도록(개발 모드의 이중 실행 포함) 넘긴 상태를 기억한다.
  const advancedFrom = useRef<string | null>(null)
  useEffect(() => {
    if (!FLOWING_PHASES.includes(game.phase) || !stream.idle) {
      return
    }
    const key = `${game.phase}:${game.choiceLog.length}:${game.history.length}:${feed.length}`
    if (advancedFrom.current === key) {
      return
    }
    advancedFrom.current = key
    act({ type: 'continue' })
  }, [game.phase, game.choiceLog.length, game.history.length, feed.length, stream.idle, act])

  // ── 새 줄이 나오면 바닥으로 따라 내려간다. 처음 들어왔을 때는 바로 바닥으로.
  const bottomRef = useRef<HTMLDivElement>(null)
  const followedOnce = useRef(false)
  useEffect(() => {
    const bottom = bottomRef.current
    if (!bottom) {
      return
    }
    const first = !followedOnce.current
    followedOnce.current = true
    const distance = bottom.getBoundingClientRect().bottom - window.innerHeight
    if (first || distance < FOLLOW_DISTANCE_PX) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      bottom.scrollIntoView({ block: 'end', behavior: first || reduced ? 'auto' : 'smooth' })
    }
  }, [stream.revealed, game.phase])

  // ── 시간의 흐름: 줄거리가 한 해씩 재생되는 동안 상태 패널의 나이·스탯·직급이 같이 올라가고, 게이지가 그 해만큼 찬다.
  // 재생이 멈춰 있을 때(모두 읽었을 때)의 상태를 기억해 두었다가, 새로 흐르는 시간이 시작되기 전까지의 기준으로 쓴다.
  const baseRef = useRef<{ snapshot: YearSnapshot; feedLength: number }>({
    snapshot: snapshotOf(game),
    feedLength: 0,
  })
  useEffect(() => {
    if (stream.idle) {
      baseRef.current = { snapshot: snapshotOf(game), feedLength: feed.length }
    }
  }, [stream.idle, game, feed.length])
  const playback = describePlayback(feed, stream.revealed, baseRef.current)

  const confirmRestart = () => {
    if (window.confirm('지금까지의 삶을 버리고 처음부터 다시 시작할까요?')) {
      restart()
    }
  }
  const showEnded = game.phase === 'ended' && stream.idle

  // 마지막 줄을 다 읽으면 끝 화면이 나온다. 그 첫머리부터 읽을 수 있게 맞춘다.
  const endedRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (showEnded) {
      endedRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
  }, [showEnded])

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-20">
        <StatusPanel
          state={game}
          view={playback.view}
          gauge={
            playback.gauge && {
              key: playback.gauge.key,
              full: playback.gauge.full,
              durationMs: playback.gauge.durationMs / stream.speed,
              paused: stream.paused,
            }
          }
          controls={
            <SpeedControl
              speed={stream.speed}
              onChange={stream.setSpeed}
              paused={stream.paused}
              onTogglePause={stream.togglePause}
            />
          }
        />
      </div>

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-8">
        <Stream feed={feed} revealed={stream.revealed} animateFrom={initialRevealed} />

        {showEnded && (
          <div ref={endedRef} className="mt-10 scroll-mt-40">
            <EndedScreen state={game} onRestart={() => restart()} />
          </div>
        )}

        <footer className="mt-12 flex justify-between text-xs text-ash">
          <Link to="/" className="hover:text-fog">
            처음으로
          </Link>
          {game.phase !== 'ended' && (
            <button type="button" onClick={confirmRestart} className="hover:text-fog">
              처음부터 다시
            </button>
          )}
        </footer>
        {/* 아래에 뜨는 "다시 펼치기" 카드에 가리지 않도록 여유를 두고, 새 줄이 나오면 여기까지 스크롤한다 */}
        <div ref={bottomRef} className="h-24" aria-hidden="true" />
      </main>

      {decisionReady && !popupOpen && pendingLabel && <PendingCard title={pendingTitle} label={pendingLabel} action={pendingAction} onOpen={openPopup} />}

      {popupOpen && popupBody && (
        <DecisionPopup label={popupLabel} onClose={closePopup}>
          {popupBody}
        </DecisionPopup>
      )}
    </div>
  )
}
