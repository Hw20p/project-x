import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { gameContext } from '../content'
import { StatusPanel } from '../components/game/StatusPanel'
import { BriefingScreen } from '../components/game/screens/BriefingScreen'
import { ChoosingScreen } from '../components/game/screens/ChoosingScreen'
import { EndedScreen } from '../components/game/screens/EndedScreen'
import { InterludeOutcomeScreen, InterludeScreen } from '../components/game/screens/InterludeScreens'
import { OutcomeScreen } from '../components/game/screens/OutcomeScreen'
import { ReportScreen } from '../components/game/screens/ReportScreen'
import { getChoiceOptions, getCurrentInterlude, getCurrentObject, getCurrentStage } from '../engine/game'
import { formatAge } from '../game/format'
import { useGame } from '../game/useGame'
import type { StartOptions } from '../game/useGame'

/** 주소의 `?seed=123`(그 시드로 새 판)과 `?new=1`(새 판)을 읽는다. 없으면 저장된 판을 이어 한다. */
function readStartOptions(params: URLSearchParams): StartOptions {
  const seed = Number(params.get('seed'))
  if (params.has('seed') && Number.isInteger(seed) && seed >= 0) {
    return { seed }
  }
  return { fresh: params.has('new') }
}

export function GamePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // 시작 옵션은 처음 한 번만 읽는다. 이후 주소가 바뀌어도 진행 중인 판은 그대로 둔다.
  const [startOptions] = useState(() => readStartOptions(searchParams))
  const { game, delta, act, restart } = useGame(startOptions)

  // 새 판 주소로 들어왔다면 주소를 정리해서, 새로고침했을 때 또 새 판이 시작되지 않게 한다.
  useEffect(() => {
    if (searchParams.size > 0) {
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const object = getCurrentObject(gameContext, game)
  const stage = getCurrentStage(gameContext, game)
  const interlude = getCurrentInterlude(gameContext, game)
  const options = getChoiceOptions(gameContext, game)
  const choose = (choiceId: string) => act({ type: 'choose', choiceId })
  const proceed = () => act({ type: 'continue' })

  let screen: ReactNode = null
  switch (game.phase) {
    case 'briefing':
      if (object && game.progress) {
        screen = (
          <BriefingScreen
            object={object}
            reassigned={game.progress.reassigned}
            knowledgeBonus={game.progress.knowledgeBonus}
            onBegin={() => act({ type: 'begin' })}
          />
        )
      }
      break
    case 'choosing':
      if (object && stage && game.progress) {
        screen = (
          <ChoosingScreen
            object={object}
            stage={stage}
            stageIndex={game.progress.stageIndex}
            options={options}
            onChoose={choose}
          />
        )
      }
      break
    case 'outcome':
      if (game.lastResult) {
        screen = (
          <OutcomeScreen result={game.lastResult} stageYears={stage?.years ?? 0} delta={delta} onContinue={proceed} />
        )
      }
      break
    case 'report': {
      const report = game.history[game.history.length - 1]
      if (report) {
        screen = <ReportScreen report={report} pendingEnding={game.pendingEnding} onContinue={proceed} />
      }
      break
    }
    case 'interlude':
      if (interlude) {
        screen = <InterludeScreen def={interlude} options={options} onChoose={choose} />
      }
      break
    case 'interludeOutcome':
      if (interlude && game.lastInterludeResult) {
        screen = (
          <InterludeOutcomeScreen
            def={interlude}
            result={game.lastInterludeResult}
            delta={delta}
            onContinue={proceed}
          />
        )
      }
      break
    case 'ended':
      screen = <EndedScreen state={game} onRestart={() => restart()} />
      break
  }

  const illness = game.events.find((event) => event.type === 'illness')
  const confirmRestart = () => {
    if (window.confirm('지금까지의 삶을 버리고 처음부터 다시 시작할까요?')) {
      restart()
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StatusPanel state={game} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
        {illness && (
          <p className="mb-6 border-l-2 border-loss/60 pl-3 text-sm text-loss" role="status">
            {formatAge(illness.age)}, 몸에 병이 들었다.
          </p>
        )}
        {/* 단계나 객체가 바뀔 때마다 화면을 새로 그려서 등장 연출이 다시 재생되게 한다 */}
        <div key={`${game.phase}-${game.progress?.objectId ?? ''}-${game.progress?.stageIndex ?? ''}-${game.interlude?.eventId ?? ''}`}>
          {screen}
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-2xl justify-between px-5 pb-6 text-xs text-ash">
        <Link to="/" className="hover:text-fog">
          처음으로
        </Link>
        {game.phase !== 'ended' && (
          <button type="button" onClick={confirmRestart} className="hover:text-fog">
            처음부터 다시
          </button>
        )}
      </footer>
    </div>
  )
}
