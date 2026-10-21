import type { ContainmentObject } from '../engine/types'

// 객체를 맡게 된 계기 (객체 배정 안내 바로 앞에 줄거리 스트림에 흐르는 한두 문장).
// 처음 맡는 객체는 객체 자신의 `intro`를 쓰고, 이미 관리해 본 객체를 다시 맡는 재배정은 아래 기본 문구에서 고른다.
// 자리표시자는 {object}(객체 이름).
export const reassignIntros: string[] = [
  '「{object}」의 서류철이 다시 책상 위에 놓였다. 이번에는 처음이 아니라는 점이 달랐다.',
  '인사팀은 「{object}」를 다시 맡아 달라고 했다. 이유는 적혀 있지 않았다.',
  '「{object}」 앞에 다시 서게 되었다. 지난번의 메모가 아직 서랍에 남아 있었다.',
]

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
 * 객체를 맡게 된 계기 문장. 처음이면 객체의 `intro`(없으면 null).
 * 다시 맡는 것(재배정·재도전)이면 객체에 `reintro`가 있을 때 몇 번째 재도전이냐에 맞춰 그 순서의 문장을 쓰고(배열이 끝나면 마지막 문장),
 * 없으면 공통 기본 문구 중 하나를 쓴다.
 * @param order 이번 판에서 몇 번째로 맡는 객체인지 (같은 객체를 다시 맡아도 다른 문장이 나올 수 있게)
 * @param attempts 이 객체를 이미 맡은 횟수 (재도전일 때 1 이상)
 */
export function pickIntro(
  object: ContainmentObject,
  reassigned: boolean,
  seed: number,
  order: number,
  attempts = 0,
): string | null {
  let text: string | undefined
  if (!reassigned) {
    text = object.intro
  } else if (object.reintro && object.reintro.length > 0) {
    text = object.reintro[Math.min(Math.max(attempts, 1) - 1, object.reintro.length - 1)]
  } else {
    text = reassignIntros[hashIndex(reassignIntros.length, seed, order)]
  }
  return text ? text.replace(/\{object\}/g, object.name) : null
}
