import { useState } from 'react'
import { Link } from 'react-router-dom'
import { describeEnding } from '../content/epilogues'
import { RANK_LABELS } from '../engine/config'
import { formatAge } from '../game/format'
import { loadGame, loadRecords } from '../game/storage'
import type { GameRecord } from '../game/storage'

function recordTitle(record: GameRecord): string {
  return describeEnding({
    kind: record.endingKind,
    endingId: record.endingId,
    deathCause: record.deathCause,
    age: record.age,
  }).title
}

export function HomePage() {
  // 저장소는 렌더링 때 한 번만 읽는다 (이 화면에서는 저장 내용이 바뀌지 않는다)
  const [hasSave] = useState(() => loadGame() !== null)
  const [records] = useState(() => loadRecords())

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-10 px-6 py-16">
      <div className="reveal grid gap-4">
        <p className="text-xs tracking-[0.3em] text-fog">LIFESIM · 가칭</p>
        <h1 className="text-4xl leading-tight tracking-wide text-bone">
          당신은 오늘 입사했다.
        </h1>
        <p className="leading-loose text-fog">
          관리할 것은 이 세상에 없는 것들이다. 설명은 짧고, 매뉴얼은 불완전하다. 선택마다 성공 확률이 보이지만, 확률은
          결과를 약속하지 않는다.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/play?new=1"
          className="rounded border border-glow/50 px-6 py-2.5 text-glow transition-colors hover:bg-glow/10"
        >
          새 삶을 시작한다
        </Link>
        {hasSave && (
          <Link
            to="/play"
            className="rounded border border-edge px-6 py-2.5 text-bone transition-colors hover:border-fog"
          >
            이어서 한다
          </Link>
        )}
      </div>

      {records.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] text-ash">지난 기록</h2>
          <ul className="grid gap-1 text-sm">
            {records.map((record) => (
              <li key={record.seed} className="flex justify-between gap-4 border-b border-edge/60 py-1.5">
                <span className="text-bone">{recordTitle(record)}</span>
                <span className="tabular-nums text-fog">
                  {formatAge(record.age)} · {RANK_LABELS[record.rank]} · 객체 {record.cleared}/{record.managed}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {import.meta.env.DEV && (
        <Link to="/dev/sim" className="text-xs text-ash underline hover:text-fog">
          [개발] 밸런스 시뮬레이션
        </Link>
      )}
    </main>
  )
}
