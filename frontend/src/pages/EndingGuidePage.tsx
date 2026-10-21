// 개발용 안내 페이지 (/dev/endings, 개발 서버에서 스위치(devTools.ts)가 켜졌을 때만 열림).
// 큰 줄거리의 막이 바뀌는 조건, 최종 객체가 열리는 조건, 엔딩마다의 도달 조건, 후일담 조건을 한곳에 정리해 보여 준다.
// 가능한 한 콘텐츠 데이터에서 읽어 와서 데이터를 고치면 이 페이지도 따라 바뀐다 (손으로 쓴 설명은 엔딩 종류 표뿐).
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { afterwords, endings, flows, objects } from '../content'
import { FINALE, MAX_AGE, PROMOTION_REQUIREMENTS, RANK_LABELS } from '../engine/config'
import { ACT_TITLES } from '../engine/flow'
import type { Act, FlowDef } from '../engine/types'
import { describeCondition } from '../game/describeCondition'

const ACTS: readonly Act[] = [1, 2, 3]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 grid gap-3">
      <h2 className="border-b border-edge pb-1.5 font-serif-kr text-xl text-bone">{title}</h2>
      {children}
    </section>
  )
}

/** 조건 문구들을 작은 칩으로 */
function Chips({ items }: { items: string[] }) {
  return (
    <span className="flex flex-wrap gap-1">
      {items.map((item) => (
        <span key={item} className="rounded bg-edge/60 px-1.5 py-0.5 text-xs text-fog">
          {item}
        </span>
      ))}
    </span>
  )
}

function BeatRow({ def }: { def: FlowDef }) {
  const closes = (def.setFlags ?? []).some((flag) => /^act\d-done$/.test(flag))
  return (
    <li className={`grid gap-1 rounded border px-3 py-2 ${closes ? 'border-glow/50 bg-glow/5' : 'border-edge'}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm text-bone">
          {def.id}
          {closes && <span className="ml-2 text-xs text-glow">막을 닫음 → 다음 막</span>}
        </span>
        {def.after && (
          <span className="text-xs text-ash">
            이어짐: {def.after}
            {def.afterYears ? ` + ${def.afterYears}년 이상` : ''}
          </span>
        )}
      </div>
      <Chips items={describeCondition(def.when)} />
      {(def.setFlags ?? []).length > 0 && <p className="text-xs text-ash">켜지는 플래그: {(def.setFlags ?? []).join(', ')}</p>}
    </li>
  )
}

/** 최종 객체의 선택지 중 엔딩으로 이어지는 것들 */
function finaleRoutes() {
  const routes: { endingId: string; objectLabel: string; stageTitle: string; choiceText: string; chance: number; failure: string }[] = []
  for (const object of objects.filter((candidate) => candidate.finale)) {
    for (const stage of object.stages) {
      for (const choice of stage.choices) {
        if (choice.success.endingId) {
          routes.push({
            endingId: choice.success.endingId,
            objectLabel: `${object.code} 「${object.name}」`,
            stageTitle: stage.title,
            choiceText: choice.text,
            chance: choice.baseChance,
            failure: choice.failure.kind,
          })
        }
      }
    }
  }
  return routes
}

const FAILURE_LABELS: Record<string, string> = { setback: '실패 시 단계 손실', demotion: '실패 시 좌천', death: '실패 시 즉사' }

/** 최종 객체가 아닌 종료들. 엔진 규칙(`engine/game.ts`)을 손으로 옮겨 적은 설명이라, 규칙을 고치면 여기도 고친다. */
const OTHER_ENDINGS: { title: string; condition: string }[] = [
  { title: '삼켜짐 (사망 · 즉사)', condition: '실패하면 즉사하는 선택지(`failure.kind: death`)에서 실패했을 때. 아래 목록 참고.' },
  { title: '순직 (사망 · 관리 중 피해)', condition: '선택 결과로 체력이 0 이하가 되었을 때.' },
  { title: '병사 (사망)', condition: '해마다 체력이 0 이하가 되었는데 그 해 병에 걸렸을 때. 체력은 나이가 들수록(45세부터) 해마다 줄고, 병에 걸리면 크게 깎인다.' },
  { title: '노환 (사망)', condition: '해마다 체력이 0 이하가 되었는데 병이 아니었을 때(나이로 인한 체력 소진).' },
  { title: '붕괴 (정신 붕괴)', condition: '정신력이 0 이하가 되었을 때. 선택 결과로도, 해가 흐르며도 일어난다. 매년 자연 회복과 NPC 관계 보너스가 이를 막는다.' },
  { title: '해고', condition: '이미 수습(1급)인데 규정 위반(좌천 실패)으로 한 번 더 좌천되었을 때.' },
  { title: '퇴직', condition: '더 맡길 객체가 없을 때(현재 직급의 새 객체와 재배정할 객체를 모두 소진했거나, 최종 객체를 이미 마친 뒤).' },
  { title: '천수', condition: `나이가 ${MAX_AGE}세에 닿았을 때.` },
]

export function EndingGuidePage() {
  const beatsByAct = ACTS.map((act) => ({ act, beats: flows.filter((def) => def.kind === 'beat' && def.act === act) }))
  const routes = finaleRoutes()
  const deathChoices = objects.flatMap((object) =>
    object.stages.flatMap((stage) =>
      stage.choices.filter((choice) => choice.failure.kind === 'death').map((choice) => `${object.code} · ${stage.title} · ${choice.text}`),
    ),
  )

  return (
    <main className="mx-auto max-w-3xl px-6 py-8 pb-20">
      <Link to="/" className="text-sm text-ash underline hover:text-fog">
        ← 홈
      </Link>
      <h1 className="mt-2 font-serif-kr text-3xl text-bone">엔딩·막 조건 정리</h1>
      <p className="mt-2 text-sm text-ash">
        개발용 페이지다. 가능한 항목은 콘텐츠 데이터에서 읽어 와서 데이터를 고치면 이 페이지도 따라 바뀐다.
      </p>

      <Section title="큰 줄거리의 막이 바뀌는 조건">
        <p className="text-sm leading-relaxed text-fog">
          지금 막은 플래그로 센다: <code>act1-done</code>이 없으면 1막, 있으면 2막, <code>act2-done</code>이 있으면 3막이다(3막은 끝까지 3막).
          각 막의 마지막 비트를 읽으면 그 플래그가 켜지고, 화면의 막 표시는 <b>그 비트를 읽은 다음 해</b>부터 바뀐다. 비트는 한 해에 하나씩, 사슬(이어짐)
          순서대로 나온다.
        </p>
        {beatsByAct.map(({ act, beats }) => (
          <div key={act} className="grid gap-2">
            <h3 className="mt-2 text-lg text-glow">
              {act}막 · {ACT_TITLES[act]}
            </h3>
            <ul className="grid gap-2">
              {beats.map((def) => (
                <BeatRow key={def.id} def={def} />
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section title="최종 객체가 열리는 조건">
        <p className="text-sm leading-relaxed text-fog">
          수석(5급)이 된 지 <b>{FINALE.minYearsAtRank5}년 이상</b> 지났고, <b>3막이 끝났거나({FINALE.storyFlag})</b> 수석으로{' '}
          <b>{FINALE.maxYearsAtRank5}년 이상</b> 지냈을 때 다음 객체로 최종 객체가 배정된다. 수석까지 오르려면 직급마다 승급 점수와 평판이 모두 필요하다:{' '}
          {([1, 2, 3, 4] as const)
            .map((rank) => `${RANK_LABELS[rank]}→${RANK_LABELS[(rank + 1) as 2 | 3 | 4 | 5]} 점수 ${PROMOTION_REQUIREMENTS[rank].points}·평판 ${PROMOTION_REQUIREMENTS[rank].reputation}`)
            .join(', ')}
          .
        </p>
      </Section>

      <Section title="엔딩 조건">
        <h3 className="text-lg text-glow">최종 객체의 엔딩 (모두 최종 객체의 선택이 성공해야 한다)</h3>
        <ul className="grid gap-2">
          {endings.map((ending) => {
            const route = routes.filter((candidate) => candidate.endingId === ending.id)
            return (
              <li key={ending.id} className="grid gap-1 rounded border border-edge px-3 py-2">
                <p className="text-bone">
                  {ending.title} <span className="text-xs text-ash">({ending.id})</span>
                </p>
                {route.map((item) => (
                  <p key={item.choiceText} className="text-sm text-fog">
                    {item.objectLabel} · {item.stageTitle} 단계에서 “{item.choiceText}” 선택이 성공하면 (기본 성공률 {Math.round(item.chance * 100)}%,{' '}
                    {FAILURE_LABELS[item.failure] ?? item.failure})
                  </p>
                ))}
                {route.length === 0 && <p className="text-sm text-loss">이 엔딩으로 이어지는 선택지가 없다</p>}
              </li>
            )
          })}
        </ul>

        <h3 className="mt-3 text-lg text-glow">그 밖의 종료</h3>
        <ul className="grid gap-2">
          {OTHER_ENDINGS.map((ending) => (
            <li key={ending.title} className="grid gap-0.5 rounded border border-edge px-3 py-2">
              <p className="text-bone">{ending.title}</p>
              <p className="text-sm text-fog">{ending.condition}</p>
            </li>
          ))}
        </ul>
        <details className="text-sm text-fog">
          <summary className="cursor-pointer select-none text-ash hover:text-fog">즉사 선택지 {deathChoices.length}개 보기</summary>
          <ul className="mt-2 grid gap-1 text-xs text-ash">
            {deathChoices.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </details>
      </Section>

      <Section title="후일담 조건 (종료 화면에 붙는 짧은 글)">
        <p className="text-sm text-fog">
          그룹마다 한 줄(우선순위가 높은 것)만 나오고, 연애 → 사람들 → 일 → 입사 배경 순서로 최대 3줄. 판이 끝난 시점의 상태로 판정한다.
        </p>
        <ul className="grid gap-2">
          {afterwords.map((afterword) => (
            <li key={afterword.id} className="grid gap-1 rounded border border-edge px-3 py-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm text-bone">
                  {afterword.id} <span className="text-xs text-ash">· {afterword.group}</span>
                </span>
                <span className="text-xs text-ash">우선순위 {afterword.priority ?? 0}</span>
              </div>
              <Chips items={describeCondition(afterword.when)} />
              <p className="text-xs text-ash">{afterword.text}</p>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  )
}
