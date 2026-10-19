// 시뮬레이션 엔진은 React/DOM에 의존하지 않는 순수 TS로 유지한다.
// 같은 시드 + 같은 선택 기록이면 항상 같은 결과가 나와야 하므로 Math.random()은 쓰지 않는다.

export interface Rng {
  /** [0, 1) 범위의 난수 */
  next(): number
  /** [min, max] 범위의 정수 */
  int(min: number, max: number): number
  /** 확률 p(0~1)로 true */
  chance(p: number): boolean
  /** 가중치에 비례해 하나를 고름 */
  pickWeighted<T>(items: readonly T[], weight: (item: T) => number): T
  /** 현재 내부 상태. 이 값을 `createRng`에 다시 넘기면 그 지점부터 똑같은 난수열이 이어진다. */
  getState(): number
}

/**
 * mulberry32 — 작고 빠른 시드 기반 PRNG. 암호학적 용도가 아님.
 * 내부 상태가 곧 32비트 정수라서, 시드로 시작하든 저장해 둔 상태로 이어가든 같은 함수를 쓴다.
 */
export function createRng(seed: number): Rng {
  let state = seed >>> 0

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    next,
    getState: () => state,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    chance: (p) => next() < p,
    pickWeighted: (items, weight) => {
      const total = items.reduce((sum, item) => sum + weight(item), 0)
      let roll = next() * total
      for (const item of items) {
        roll -= weight(item)
        if (roll < 0) {
          return item
        }
      }
      return items[items.length - 1]
    },
  }
}
