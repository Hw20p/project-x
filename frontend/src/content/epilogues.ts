import type { DeathCause, Ending, EndingKind } from '../engine/state'
import { endings } from './endings'

// 종료 화면에 보여 줄 에필로그. 최종 객체(X-011)의 엔딩은 `endings.ts`에 있고, 여기는 그 밖의 종료들이다.
// 선택이 원인인 종료(즉사·붕괴)는 종료 화면이 그 선택의 결과 서술(`endingScene`)을 먼저 보여 준 뒤 이 글을 잇는다.

export interface Epilogue {
  title: string
  text: string
}

const DEATH_EPILOGUES: Record<DeathCause, Epilogue> = {
  instant: {
    title: '삼켜짐',
    text: '당신의 선택은 기록에 남았다. 정확히는, 선택하는 순간까지만. 이튿날 당신의 자리는 정리되어 있었고, 그 위에는 새 신입 사원의 사원증이 놓여 있었다.',
  },
  injury: {
    title: '순직',
    text: '당신은 관리 중에 입은 상처에서 회복하지 못했다. 보고서에는 “예견된 위험”이라고 적혔고, 장례는 조용히 치러졌다. 아무도 어떤 객체였는지는 말하지 않았다.',
  },
  illness: {
    title: '병사',
    text: '오랜 근무가 몸에 남긴 병이었다. 진단서에는 “원인 불명”이라는 말이 두 번 적혀 있었다. 병실 창밖으로 시설의 불빛이 보였다.',
  },
  aging: {
    title: '노환',
    text: '당신은 오래 일했고, 오래 살았다. 마지막 날에도 일지는 비어 있지 않았다. “이상 없음.” 그 한 줄이 당신이 남긴 마지막 기록이다.',
  },
}

const OTHER_EPILOGUES: Record<Exclude<EndingKind, 'death' | 'finale'>, Epilogue> = {
  breakdown: {
    title: '붕괴',
    text: '어느 날 당신은 객체의 이름을 불렀고, 객체가 대답했다. 그날 이후 당신은 관리하는 쪽이 아니라 관리받는 쪽의 번호를 얻었다. 새 관리 번호 아래에는 당신의 사번이 작게 적혀 있다.',
  },
  dismissed: {
    title: '해고',
    text: '인사팀은 정중했다. 사원증을 반납하고 서약서에 서명했다. 문을 나서며 뒤를 돌아보지 않았다. 돌아보면 무언가 보일 것 같아서였다.',
  },
  retired: {
    title: '퇴직',
    text: '더 맡길 일이 남아 있지 않았다. 시설은 당신에게 감사를 표했고, 당신은 그 말이 진심이기를 바랐다.',
  },
  longevity: {
    title: '천수',
    text: '당신은 백 번째 해를 맞았다. 시설의 누구도 그것이 가능하다고 생각하지 않았다. 당신은 그 이유를 알지만 말하지 않기로 했다.',
  },
}

export function describeEnding(ending: Ending): Epilogue {
  if (ending.kind === 'finale') {
    const found = endings.find((candidate) => candidate.id === ending.endingId)
    return found ? { title: found.title, text: found.text } : { title: '끝', text: '기록은 여기서 끝난다.' }
  }
  if (ending.kind === 'death') {
    return DEATH_EPILOGUES[ending.deathCause ?? 'aging']
  }
  return OTHER_EPILOGUES[ending.kind]
}
