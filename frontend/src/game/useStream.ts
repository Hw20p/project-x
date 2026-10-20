import { useCallback, useEffect, useState } from 'react'
import type { FeedItem } from './feed'

export const SPEEDS = [1, 2, 4] as const
export type Speed = (typeof SPEEDS)[number]

const SPEED_KEY = 'lifesim:speed'
/** 첫 줄이 나오기까지의 짧은 숨 고르기 (프롤로그의 시간 게이지 길이를 잴 때도 쓴다) */
export const FIRST_LINE_DELAY_MS = 350
const BASE_DELAY_MS = 700
const PER_CHAR_MS = 28
const MAX_READ_CHARS = 70
/** 한 해가 흘렀다는 표시(게이지가 한 칸 차는 순간) 뒤의 짧은 간격 */
const YEAR_TICK_DELAY_MS = 450

function loadSpeed(): Speed {
  try {
    const stored = Number(localStorage.getItem(SPEED_KEY))
    return SPEEDS.find((speed) => speed === stored) ?? 1
  } catch {
    return 1
  }
}

function saveSpeed(speed: Speed): void {
  try {
    localStorage.setItem(SPEED_KEY, String(speed))
  } catch {
    // 속도는 편의 설정이라 저장에 실패해도 무시한다.
  }
}

/** 내가 고른 선택지 줄 다음에 결과가 나오기까지의 짧은 간격 (내가 고른 문장이라 읽을 시간이 필요 없다) */
const CHOICE_ECHO_DELAY_MS = 450
/** 선택지를 누른 뒤 내가 고른 문장이 기록에 붙기까지의 짧은 텀 (바로 붙으면 오히려 정신없다) */
const CHOICE_APPEAR_DELAY_MS = 300

/** 한 줄을 읽는 데 주는 시간(속도 1배 기준 ms). 긴 문장일수록 오래 머문다. 시간의 흐름 게이지가 한 해의 길이를 잴 때도 쓴다. */
export function readingDelay(item: FeedItem): number {
  if (item.kind === 'year') {
    return YEAR_TICK_DELAY_MS
  }
  if (item.kind === 'choice') {
    return CHOICE_ECHO_DELAY_MS
  }
  const chars = Math.min(item.text.length, MAX_READ_CHARS)
  return BASE_DELAY_MS + chars * PER_CHAR_MS + (item.kind === 'report' ? 500 : 0)
}

/**
 * 줄거리 스트림을 한 줄씩 보여 주는 타이머.
 * 건너뛰기는 없고, 속도만 1·2·4배로 바꾸거나 일시정지할 수 있다 (80억분의 1과 같은 방식).
 * @param initialRevealed 처음부터 보여 줄 줄 수 (저장본을 이어 할 때 쌓인 줄거리를 바로 보여 주기 위함)
 */
export function useStream(feed: readonly FeedItem[], initialRevealed: number) {
  const [revealed, setRevealed] = useState(initialRevealed)
  // 마지막 줄을 읽을 시간까지 지나 "다 읽었다"고 본 줄 수
  const [settled, setSettled] = useState(initialRevealed)
  const [speed, setSpeedState] = useState<Speed>(loadSpeed)
  const [paused, setPaused] = useState(false)

  const setSpeed = useCallback((next: Speed) => {
    setSpeedState(next)
    saveSpeed(next)
  }, [])
  const togglePause = useCallback(() => setPaused((value) => !value), [])

  useEffect(() => {
    if (paused || revealed >= feed.length) {
      return
    }
    // 선택지를 고른 직후의 줄(내가 고른 문장)은 앞 줄을 읽던 시간을 기다리지 않고 짧은 텀만 두고 보여 준다.
    // 클릭에 곧 반응해야 선택이 됐는지 헷갈리지 않는다.
    const delay =
      revealed === 0
        ? FIRST_LINE_DELAY_MS
        : feed[revealed].kind === 'choice'
          ? CHOICE_APPEAR_DELAY_MS
          : readingDelay(feed[revealed - 1])
    const timer = window.setTimeout(() => setRevealed((count) => count + 1), delay / speed)
    return () => window.clearTimeout(timer)
  }, [revealed, feed, speed, paused])

  useEffect(() => {
    if (paused || revealed < feed.length || settled >= feed.length) {
      return
    }
    const timer = window.setTimeout(() => setSettled(feed.length), readingDelay(feed[feed.length - 1]) / speed)
    return () => window.clearTimeout(timer)
  }, [revealed, settled, feed, speed, paused])

  // idle: 모든 줄이 나왔고 마지막 줄을 읽을 시간도 지났다. 팝업을 열거나 다음 단계로 넘어가도 되는 때.
  return { revealed, idle: revealed >= feed.length && settled >= feed.length, speed, setSpeed, paused, togglePause }
}
