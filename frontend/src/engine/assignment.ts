// 다음에 관리할 객체를 고르는 규칙.
//   1) 현재 직급의 아직 관리하지 않은 일반 객체가 있으면 그중 하나 (새 객체)
//   2) 수석(5급)이면: 성공하지 못한 5급 일반 객체를 다시 맡고, 5급 일반 객체를 모두 성공했으면 최종 객체(finale)
//   3) 그 밖에는 이미 관리한 하위 등급 객체를 재배정 (수습은 하위 등급이 없으므로 수습 객체를 재배정)
import type { Rng } from './rng'
import { calcReassignKnowledgeBonus } from './rules'
import type { ContainmentObject, Rank } from './types'

export interface Assignment {
  object: ContainmentObject
  reassigned: boolean
  /** 이 객체를 관리하는 동안만 적용되는 지식 보너스. 새 객체면 0. */
  knowledgeBonus: number
}

/** 재배정 후보 가중치 — 현재 직급 바로 아래 등급일수록 자주 나온다 (1단계 아래 3, 2단계 아래 2, 그 이하 1). */
function reassignWeight(tier: Rank, rank: Rank): number {
  return Math.max(1, 4 - (rank - tier))
}

function reassignment(rng: Rng, candidates: readonly ContainmentObject[], managedCounts: Readonly<Record<string, number>>, weight: (object: ContainmentObject) => number): Assignment {
  const object = rng.pickWeighted(candidates, weight)
  return {
    object,
    reassigned: true,
    knowledgeBonus: calcReassignKnowledgeBonus(managedCounts[object.id]),
  }
}

/**
 * @param managedCounts 객체 id → 이번 판에서 그 객체를 이미 관리한 횟수 (관리한 적 없으면 키가 없거나 0)
 * @param clearedIds 이번 판에서 한 번이라도 관리에 성공한 객체 id
 * @returns 배정할 수 있는 객체가 전혀 없으면 null
 */
export function pickNextObject(
  rng: Rng,
  objects: readonly ContainmentObject[],
  rank: Rank,
  managedCounts: Readonly<Record<string, number>>,
  clearedIds: ReadonlySet<string>,
): Assignment | null {
  // 최종 객체는 아래 수석 규칙으로만 배정되므로 일반 배정 후보에서 뺀다.
  const regular = objects.filter((object) => !object.finale)

  const fresh = regular.filter((object) => object.tier === rank && !managedCounts[object.id])
  if (fresh.length > 0) {
    return { object: rng.pickWeighted(fresh, () => 1), reassigned: false, knowledgeBonus: 0 }
  }

  if (rank === 5) {
    // 새 객체가 없으니 5급 일반 객체는 모두 한 번 이상 맡았다. 성공하지 못한 것이 있으면 다시 맡는다.
    const retry = regular.filter((object) => object.tier === 5 && !clearedIds.has(object.id))
    if (retry.length > 0) {
      return reassignment(rng, retry, managedCounts, () => 1)
    }
    // 5급 일반 객체를 모두 성공했다 → 최종 객체. 이전에 실패했다면 재도전(지식 보너스 적용).
    const finales = objects.filter((object) => object.finale && !clearedIds.has(object.id))
    if (finales.length > 0) {
      const object = rng.pickWeighted(finales, () => 1)
      const times = managedCounts[object.id] ?? 0
      return {
        object,
        reassigned: times > 0,
        knowledgeBonus: times > 0 ? calcReassignKnowledgeBonus(times) : 0,
      }
    }
  }

  const candidates = regular.filter(
    (object) => (rank === 1 ? object.tier === 1 : object.tier < rank) && (managedCounts[object.id] ?? 0) > 0,
  )
  if (candidates.length === 0) {
    return null
  }
  return reassignment(rng, candidates, managedCounts, (candidate) => reassignWeight(candidate.tier, rank))
}
