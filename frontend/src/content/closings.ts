import type { ClosingOutcome, ContainmentObject } from '../engine/types'

// 객체 관리가 끝났을 때 보고서 앞에 흘러나오는 마무리 서술의 기본 문구.
// 객체가 자기 `closing`을 가지고 있으면 그쪽이 우선이고, 없는 결말만 여기서 고른다. 자리표시자는 {object}(객체 이름).
export const defaultClosings: Record<ClosingOutcome, string[]> = {
  cleared: [
    '관리 기록을 마감했다. 「{object}」에서 더 이상 이상 징후는 보고되지 않았다.',
    '일지의 마지막 줄을 닫고 서명했다. 「{object}」 건은 잠잠해졌다.',
    '팀장은 보고서를 읽고 고개를 끄덕였다. 그 이상은 묻지 않았다.',
  ],
  failed: [
    '「{object}」 건은 미완으로 마감되었다. 객체는 아직 잠들지 않았다.',
    '보고서에 “일부 통제 실패”라고 적었다. 누구도 그 문장에 이의를 달지 않았다.',
    '객체는 그대로 남았다. 다음 담당자의 서랍에 이 일지가 들어갈 것이다.',
  ],
  demoted: [
    '규정 위반 확인서가 책상 위에 놓였다. 서명란은 이미 채워져 있었다.',
    '관리 권한이 회수되었다. 「{object}」 앞은 아무 일도 없었다는 듯 조용했다.',
    '인사팀이 사유서를 요구했다. 쓸 수 있는 말이 많지 않았다.',
  ],
}

/** 시드와 정수 몇 개에서 색인을 정한다 (판정용 난수와는 무관한 해시). 같은 시드·같은 진행이면 같은 문장이 나온다. */
function hashIndex(length: number, seed: number, ...parts: number[]): number {
  let hash = seed >>> 0
  for (const part of parts) {
    hash = Math.imul(hash ^ (part >>> 0), 0x85ebca6b)
    hash ^= hash >>> 13
    hash = Math.imul(hash, 0xc2b2ae35)
    hash ^= hash >>> 16
  }
  return (hash >>> 0) % length
}

/**
 * 객체 관리의 마무리 서술을 고른다.
 * @param order 이번 판에서 몇 번째로 끝난 객체인지 (같은 객체를 다시 만나도 다른 문장이 나올 수 있게)
 */
export function pickClosing(object: ContainmentObject, outcome: ClosingOutcome, seed: number, order: number): string {
  const own = object.closing?.[outcome]
  const variants = own === undefined ? defaultClosings[outcome] : typeof own === 'string' ? [own] : own
  const text = variants[hashIndex(variants.length, seed, order, outcome.length)]
  return text.replace(/\{object\}/g, object.name)
}
