import type { ReactNode } from 'react'
import { formatAge } from '../../game/format'
import type { FeedItem } from '../../game/feed'
import { RelationChips, StatDeltaChips } from './Effects'

function Notes({ notes, tone }: { notes: string[] | undefined; tone: FeedItem['tone'] }) {
  if (!notes || notes.length === 0) {
    return null
  }
  const [first, ...rest] = notes
  return (
    <p className="text-xs text-ash">
      <span className={tone === 'good' ? 'text-gain' : tone === 'bad' ? 'text-loss' : undefined}>{first}</span>
      {rest.map((note) => (
        <span key={note}> · {note}</span>
      ))}
    </p>
  )
}

/** 항목 종류에 따른 본문. 나이 표시는 바깥(StreamLine)에서 붙인다. */
function LineBody({ item }: { item: FeedItem }): ReactNode {
  switch (item.kind) {
    case 'year':
      return null // 한 해 표시는 StreamLine이 따로 그린다
    case 'opening':
    case 'beat':
    case 'story':
    case 'closing':
      return <p className="narration text-[0.95rem] text-bone">{item.text}</p>
    case 'ambient':
      return <p className="narration text-[0.95rem] text-fog">{item.text}</p>
    case 'choice':
      return <p className="font-serif-kr text-sm italic leading-relaxed text-ash">▸ {item.text}</p>
    case 'result':
      return (
        <div
          className={`grid gap-1.5 border-l-2 pl-3 ${item.tone === 'good' ? 'border-gain/40' : item.tone === 'bad' ? 'border-loss/40' : 'border-edge'}`}
        >
          <p className="narration text-[0.95rem]">{item.text}</p>
          {item.delta && <StatDeltaChips delta={item.delta} />}
          <RelationChips relations={item.relations} />
          <Notes notes={item.notes} tone={item.tone} />
        </div>
      )
    case 'report':
      return (
        <div className="grid gap-1 rounded border border-edge bg-panel/60 px-4 py-3">
          <p className="text-xs tracking-[0.2em] text-ash">보고서</p>
          <p className={`font-serif-kr ${item.tone === 'good' ? 'text-gain' : 'text-loss'}`}>{item.text}</p>
          <Notes notes={item.notes} tone={undefined} />
        </div>
      )
    case 'assign':
      return (
        <div className="mt-3 grid gap-0.5 border-t border-edge/70 pt-3">
          <p className="text-sm tracking-wide text-glow">{item.text}</p>
          <Notes notes={item.notes} tone={undefined} />
        </div>
      )
    case 'system':
      return <p className={`text-sm ${item.tone === 'bad' ? 'text-loss' : 'text-fog'}`}>{item.text}</p>
  }
}

function StreamLine({ item, animate }: { item: FeedItem; animate: boolean }) {
  // 한 해가 흘렀다는 표시: 나이와 가는 선. 이 아래로 그 해의 서술이 이어진다.
  if (item.kind === 'year') {
    return (
      <li className={`flex items-center gap-3 pt-2 ${animate ? 'animate-fade-in-up' : ''}`}>
        <span className="w-[3.6rem] text-xs tabular-nums text-fog">{formatAge(item.age)}</span>
        <span className="h-px flex-1 bg-edge/70" aria-hidden="true" />
      </li>
    )
  }
  return (
    <li className={`grid grid-cols-[3.6rem_1fr] gap-x-3 ${animate ? 'animate-fade-in-up' : ''}`}>
      <span className="pt-[0.45rem] text-xs tabular-nums text-ash">{formatAge(item.age)}</span>
      <LineBody item={item} />
    </li>
  )
}

interface StreamProps {
  feed: readonly FeedItem[]
  /** 지금까지 보여 준 줄 수 */
  revealed: number
  /** 이 줄 수 이후에 나타난 항목만 떠오르는 효과를 준다 (저장본을 이어 할 때 쌓여 있던 줄은 바로 보인다) */
  animateFrom: number
}

/** 줄거리 스트림: 지난 일이 위로 계속 쌓이고, 각 줄에는 그 일이 일어난 나이가 붙는다. */
export function Stream({ feed, revealed, animateFrom }: StreamProps) {
  return (
    <ol className="grid gap-3.5" aria-label="줄거리" aria-live="polite">
      {feed.slice(0, revealed).map((item, index) => (
        <StreamLine key={item.id} item={item} animate={index >= animateFrom} />
      ))}
    </ol>
  )
}
