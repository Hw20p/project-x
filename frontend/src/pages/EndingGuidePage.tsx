// 개발용 안내 페이지 (/dev/endings, 개발 서버에서 스위치(devTools.ts)가 켜졌을 때만 열림).
// 큰 줄거리의 막이 바뀌는 조건, 최종 객체가 열리는 조건, 최종 객체마다의 배정 조건과 엔딩, 후일담 조건을 한곳에 정리해 보여 준다.
// 가능한 한 콘텐츠 데이터에서 읽어 와서 데이터를 고치면 이 페이지도 따라 바뀐다 (손으로 쓴 설명은 그 밖의 종료 표뿐).
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { afterwords, endings, endingTitles, flows, interludes, npcs, objects } from '../content'
import { FINALE, MAX_AGE, PROMOTION_REQUIREMENTS, RANK_LABELS } from '../engine/config'
import { ACT_TITLES } from '../engine/flow'
import type { Act, ContainmentObject, FlowDef } from '../engine/types'
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

// 엔딩이 걸린 선택은 마지막 단계에 있으므로, 실패(setback)하면 그 자리에서 다시 고르는 것이 아니라 엔딩 없이 그 객체의 관리가 끝난다.
const FAILURE_LABELS: Record<string, string> = {
  setback: '실패하면 엔딩 없이 이 객체가 끝남',
  demotion: '실패하면 좌천',
  death: '실패하면 즉사',
}

/** 최종 객체의 선택지 하나가 어느 엔딩으로 이어지는지 (기본 엔딩과, 이력에 따라 바뀌는 변주) */
interface FinaleRoute {
  stageTitle: string
  choiceText: string
  chance: number
  failure: string
  ending: string
  endingId: string
  variants: { ending: string; endingId: string; when: string[] }[]
  /** 실패하면 재도전 없이 닿는 엔딩 (실패 엔딩). 없으면 실패는 "관리 실패"로 끝난다. */
  failureEnding?: { ending: string; endingId: string }
  /** 성공 확률에 더해지는 관계 보너스 설명 (예: "문하린 관계 1점당 +0.2%p") */
  relationBonus: string[]
  /** 항상 성공하는(확률 100%) 선택지인지 */
  certain: boolean
}

function routesOf(object: ContainmentObject): FinaleRoute[] {
  return object.stages.flatMap((stage) =>
    stage.choices
      .filter((choice) => choice.success.endingId)
      .map((choice) => {
        const endingId = choice.success.endingId ?? ''
        return {
          stageTitle: stage.title,
          choiceText: choice.text,
          chance: choice.baseChance,
          certain: Boolean(choice.certain),
          failure: choice.failure.kind,
          ending: endingTitles[endingId] ?? endingId,
          endingId,
          failureEnding: choice.failure.endingId
            ? { ending: endingTitles[choice.failure.endingId] ?? choice.failure.endingId, endingId: choice.failure.endingId }
            : undefined,
          relationBonus: Object.entries(choice.relationWeights ?? {}).map(
            ([npcId, weight]) => `${npcs.find((npc) => npc.id === npcId)?.name ?? npcId} 관계 1점당 +${(weight * 100).toFixed(1)}%p`,
          ),
          variants: (choice.success.endingVariants ?? []).map((variant) => ({
            ending: endingTitles[variant.endingId] ?? variant.endingId,
            endingId: variant.endingId,
            when: describeCondition(variant.when),
          })),
        }
      }),
  )
}

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

/** 최종 객체 하나의 영역: 배정 조건과 그 객체에서 닿는 엔딩 */
function FinaleCard({ object }: { object: ContainmentObject }) {
  const routes = routesOf(object)
  const offered = Boolean(object.when)
  return (
    <article className={`grid gap-3 rounded-lg border px-4 py-3 ${offered ? 'border-glow/40 bg-glow/5' : 'border-edge bg-panel/40'}`}>
      <header className="grid gap-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-serif-kr text-lg text-bone">
            {object.code} 「{object.name}」
          </h3>
          <span className={`rounded px-2 py-0.5 text-xs ${offered ? 'bg-glow/15 text-glow' : 'bg-edge/60 text-fog'}`}>
            {offered ? `제안되는 객체 · 우선순위 ${object.priority ?? 0}` : '기본 최종 객체'}
          </span>
        </div>
        <div className="grid gap-1 text-xs text-ash">
          <p>
            <span className="text-fog">언제 맡나</span> —{' '}
            {offered
              ? '최종 객체가 열렸을 때, 아래 이력 조건을 모두 만족하면 제안된다. 받아들이거나 거절할 수 있다.'
              : '최종 객체가 열렸는데 제안되는 객체가 없거나, 제안을 거절했을 때.'}
          </p>
          {object.when && <Chips items={describeCondition(object.when)} />}
          {object.decline && <p>거절 해설: {object.decline}</p>}
          {object.retryChanceBonus ? (
            <p>
              <span className="text-fog">재도전</span> — 다시 맡을 때마다 모든 선택의 성공 확률이 +{Math.round(object.retryChanceBonus * 100)}%p씩 오른다 (두 번째 진입 +
              {Math.round(object.retryChanceBonus * 100)}%p, 세 번째 +{Math.round(object.retryChanceBonus * 200)}%p). 재배정의 지식 보너스와 별개다.
            </p>
          ) : null}
        </div>
      </header>

      <div className="grid gap-2">
        <p className="text-xs tracking-[0.15em] text-fog">
          이 객체에서 닿는 엔딩 (
          {new Set(routes.flatMap((r) => [r.endingId, ...(r.failureEnding ? [r.failureEnding.endingId] : []), ...r.variants.map((v) => v.endingId)])).size}
          종)
        </p>
        <ul className="grid gap-2">
          {routes.map((route) => (
            <li key={`${route.stageTitle}-${route.choiceText}`} className="grid gap-1 rounded border border-edge/70 bg-ink/40 px-3 py-2">
              <p className="text-sm text-bone">
                “{route.choiceText}”{' '}
                <span className="text-xs text-ash">
                  · {route.stageTitle} · {route.certain ? '확정 성공(100%)' : `기본 성공률 ${Math.round(route.chance * 100)}%`}
                  {route.relationBonus.length > 0 ? ` (+ ${route.relationBonus.join(', ')})` : ''}
                </span>
              </p>
              <p className="text-sm text-fog">
                성공하면 → <b className="text-bone">「{route.ending}」</b>
                {route.variants.length > 0 && <span className="text-xs text-ash"> (이력이 맞으면 아래로 바뀜)</span>}
              </p>
              <p className="text-sm text-fog">
                실패하면 →{' '}
                {route.failureEnding ? (
                  <>
                    <b className="text-loss">「{route.failureEnding.ending}」</b>
                    <span className="text-xs text-ash"> (실패 엔딩: 재도전 없이 판이 끝남)</span>
                  </>
                ) : (
                  <span className="text-xs text-ash">{FAILURE_LABELS[route.failure] ?? route.failure}</span>
                )}
              </p>
              {route.variants.map((variant) => (
                <div key={variant.endingId} className="grid gap-1 border-l-2 border-glow/40 pl-3">
                  <p className="text-sm text-fog">
                    → <b className="text-glow">「{variant.ending}」</b> <span className="text-xs text-ash">변주 · 아래 조건을 모두 만족하면</span>
                  </p>
                  <Chips items={variant.when} />
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export function EndingGuidePage() {
  const beatsByAct = ACTS.map((act) => ({ act, beats: flows.filter((def) => def.kind === 'beat' && def.act === act) }))
  // 기본 최종 객체가 먼저, 제안되는 객체는 우선순위가 높은 순
  const finaleObjects = objects
    .filter((object) => object.finale)
    .sort((a, b) => Number(Boolean(a.when)) - Number(Boolean(b.when)) || (b.priority ?? 0) - (a.priority ?? 0))
  // 엔딩 한눈에 보기: 엔딩 → 그 엔딩에 닿는 최종 객체
  const endingSources = endings.map((ending) => ({
    ending,
    sources: finaleObjects
      .filter((object) =>
        routesOf(object).some(
          (route) =>
            route.endingId === ending.id ||
            route.failureEnding?.endingId === ending.id ||
            route.variants.some((variant) => variant.endingId === ending.id),
        ),
      )
      .map((object) => object.code),
  }))
  // 조건부 선택지(숨은 길): 객체 단계와 막간 이벤트 모두
  const hiddenChoices = [
    ...objects.flatMap((object) =>
      object.stages.flatMap((stage) =>
        stage.choices
          .filter((choice) => choice.requires)
          .map((choice) => ({
            where: `${object.code} 「${object.name}」 · ${stage.title}`,
            choiceText: choice.text,
            note: choice.requires?.note ?? '',
            conditions: describeCondition(choice.requires?.when),
          })),
      ),
    ),
    ...interludes.flatMap((def) =>
      def.choices
        .filter((choice) => choice.requires)
        .map((choice) => ({
          where: `막간 · ${def.title}`,
          choiceText: choice.text,
          note: choice.requires?.note ?? '',
          conditions: describeCondition(choice.requires?.when),
        })),
    ),
  ]
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

      <Section title={`최종 객체별 엔딩 (엔딩 ${endings.length}종)`}>
        <p className="text-sm leading-relaxed text-fog">
          최종 객체가 열리면 이력이 조건에 맞는 <b>제안되는 객체</b>가 먼저 제안되고(우선순위가 높은 하나), 배정 팝업에서 <b>받아들이거나 거절</b>할 수 있다.
          거절하면 거절 해설이 줄거리에 흐른 뒤 <b>기본 최종 객체</b>의 팝업이 이어서 열린다. 맞는 객체가 없으면 바로 기본 최종 객체다. 엔딩은 모두 그
          객체의 선택이 <b>성공</b>해야 닿는다. (봇 시뮬레이션은 제안을 항상 받아들인다.)
        </p>

        <div className="overflow-x-auto rounded border border-edge">
          <table className="w-full text-left text-sm">
            <thead className="bg-edge/30 text-xs text-ash">
              <tr>
                <th className="px-3 py-1.5 font-normal">엔딩</th>
                <th className="px-3 py-1.5 font-normal">닿는 객체</th>
              </tr>
            </thead>
            <tbody>
              {endingSources.map(({ ending, sources }) => (
                <tr key={ending.id} className="border-t border-edge/60">
                  <td className="px-3 py-1.5 text-bone">
                    {ending.title} <span className="text-xs text-ash">({ending.id})</span>
                  </td>
                  <td className={`px-3 py-1.5 ${sources.length === 0 ? 'text-loss' : 'text-fog'}`}>
                    {sources.length > 0 ? sources.join(', ') : '닿는 선택지가 없다'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4">
          {finaleObjects.map((object) => (
            <FinaleCard key={object.id} object={object} />
          ))}
        </div>
      </Section>

      <Section title="그 밖의 종료">
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

      <Section title={`조건부 선택지 (숨은 길, ${hiddenChoices.length}개)`}>
        <p className="text-sm text-fog">
          조건을 채워야 선택지 목록에 나타나는 선택지다(못 채우면 아예 안 보인다). 나타나면 번호 아래에 옅은 ◆ 표식이 붙는다. 객체 단계와 막간 이벤트에 있다.
        </p>
        <ul className="grid gap-2">
          {hiddenChoices.map((item) => (
            <li key={`${item.where}-${item.choiceText}`} className="grid gap-1 rounded border border-glow/30 px-3 py-2">
              <p className="text-sm text-bone">
                {item.where} <span className="text-xs text-ash">· “{item.choiceText}”</span>
              </p>
              <p className="text-xs text-ash">{item.note}</p>
              <Chips items={item.conditions} />
            </li>
          ))}
        </ul>
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
