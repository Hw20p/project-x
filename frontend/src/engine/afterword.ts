// 후일담: 종료 화면에서 에필로그 뒤에 붙는 짧은 글. 살아온 이력(연인·관계·직급·입사 배경)과 끝난 방식에 따라 골라진다.
// 같은 `group`에서는 한 줄만 나오고(우선순위가 높은 것, 같으면 시드로 하나), 그룹 순서대로 최대 `MAX_AFTERWORDS`줄까지 보인다.
// 난수는 시드에서 파생해서 같은 삶은 항상 같은 후일담이 나온다.
import { meetsCondition } from './interlude'
import { createRng } from './rng'
import type { EndingKind, GameState } from './state'
import type { InterludeCondition } from './types'

/** 후일담이 나올 조건. 막간 이벤트와 같은 조건(직급·나이·스탯·플래그·관계·입사 배경)에 끝난 방식이 더해진다. 판이 끝난 시점의 상태로 판정한다. */
export interface AfterwordCondition extends InterludeCondition {
  /** 이 중 하나로 끝났을 때 (사망·붕괴·해고·퇴직·천수·최종 객체) */
  endingKinds?: EndingKind[]
  /** 최종 객체의 엔딩 id 중 하나로 끝났을 때 */
  endingIds?: string[]
}

export interface AfterwordDef {
  id: string
  /** 같은 그룹에서는 한 줄만 나온다. 보이는 순서는 `AFTERWORD_GROUPS`를 따른다. */
  group: string
  /** 같은 그룹 안에서의 우선순위. 클수록 먼저. 기본 0. */
  priority?: number
  when?: AfterwordCondition
  text: string
}

/** 그룹이 보이는 순서. 목록에 없는 그룹은 맨 뒤. 연애 → 사람들 → 일(직급) → 입사 배경 순이다. */
export const AFTERWORD_GROUPS = ['love', 'npc', 'career', 'background'] as const
/** 한 번에 보여 주는 후일담의 최대 줄 수 */
export const MAX_AFTERWORDS = 3

function matches(def: AfterwordDef, state: GameState): boolean {
  const ending = state.ending
  if (!ending) {
    return false
  }
  const when = def.when
  if (when?.endingKinds && !when.endingKinds.includes(ending.kind)) {
    return false
  }
  if (when?.endingIds && (ending.endingId === undefined || !when.endingIds.includes(ending.endingId))) {
    return false
  }
  return meetsCondition(when, state)
}

/** 끝난 판에 붙일 후일담을 고른다. 아직 끝나지 않았으면 빈 배열. */
export function pickAfterwords(defs: readonly AfterwordDef[], state: GameState): AfterwordDef[] {
  if (!state.ending) {
    return []
  }
  const rng = createRng((state.seed ^ 0x9e3779b9) >>> 0)

  const byGroup = new Map<string, AfterwordDef[]>()
  for (const def of defs) {
    if (matches(def, state)) {
      byGroup.set(def.group, [...(byGroup.get(def.group) ?? []), def])
    }
  }

  const picked: AfterwordDef[] = []
  for (const group of byGroup.keys()) {
    const candidates = byGroup.get(group) ?? []
    const top = Math.max(...candidates.map((def) => def.priority ?? 0))
    const best = candidates.filter((def) => (def.priority ?? 0) === top)
    picked.push(best[rng.int(0, best.length - 1)])
  }

  const order = (group: string) => {
    const index = (AFTERWORD_GROUPS as readonly string[]).indexOf(group)
    return index === -1 ? AFTERWORD_GROUPS.length : index
  }
  return picked.sort((a, b) => order(a.group) - order(b.group)).slice(0, MAX_AFTERWORDS)
}
