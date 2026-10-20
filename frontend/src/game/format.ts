import { STAT_KEYS } from '../engine/types'
import type { Risk, StatDelta, Stats } from '../engine/types'

/** 0.5년 단위로 흐르는 나이를 "29세", "29.5세"로 */
export function formatAge(age: number): string {
  const whole = Math.floor(age)
  return age - whole >= 0.5 ? `${whole}.5세` : `${whole}세`
}

/** "반년", "1년", "2년 반" */
export function formatYears(years: number): string {
  const whole = Math.floor(years)
  const half = years - whole >= 0.5
  if (whole === 0) {
    return half ? '반년' : '없음'
  }
  return half ? `${whole}년 반` : `${whole}년`
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
