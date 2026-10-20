import type { ContainmentObject } from '../../engine/types'
import { SectionLabel } from './Controls'

/** 객체의 관찰 기록과 관리 매뉴얼. 배정 때(BriefingScreen)와 관리 중 다시 볼 때(ChoosingScreen)가 함께 쓴다. */
export function ObjectNotes({ object }: { object: ContainmentObject }) {
  return (
    <div className="grid gap-6">
      <div>
        <SectionLabel>관찰 기록</SectionLabel>
        <ul className="narration grid gap-2 border-l border-edge pl-4">
          {object.observation.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div>
        <SectionLabel>관리 매뉴얼</SectionLabel>
        <ol className="narration grid list-decimal gap-2 pl-8 marker:text-ash">
          {object.manual.map((line) => (
            <li key={line} className={line.startsWith('(') ? 'italic text-ash' : 'text-bone'}>
              {line}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
