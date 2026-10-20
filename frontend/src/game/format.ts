import { STAT_KEYS } from '../engine/types'
import type { Risk, StatDelta, Stats } from '../engine/types'

/** 시간은 한 해 단위로 흐르므로 나이는 정수다: "29세" */
export function formatAge(age: number): string {
  return `${Math.floor(age)}세`
}

export const RISK_LABELS: Record<Risk, string> = {
  1: '안전',
  2: '쉬움',
  3: '보통',
  4: '어려움',
  5: '치명적',
}

/** 두 스탯의 차이. 0이 아닌 항목만 담고, 소수 첫째 자리까지만 본다. */
export function diffStats(before: Stats, after: Stats): StatDelta {
  const delta: StatDelta = {}
  for (const key of STAT_KEYS) {
    const change = Math.round((after[key] - before[key]) * 10) / 10
    if (change !== 0) {
      delta[key] = change
    }
  }
  return delta
}

export function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : `${value}`
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 0x100000000)
}
