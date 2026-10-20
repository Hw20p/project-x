import type { BackgroundDef } from '../engine/types'

// 입사 배경 3종. 스탯 합계는 모두 170으로 같다 (정신력+체력+평판+지식).
// 평판은 첫 승급 요건(20)보다 낮게 시작하는 배경도 있어서, 그 경우 승급 전에 평판을 조금 올려야 한다.
export const backgrounds: BackgroundDef[] = [
  {
    id: 'researcher',
    name: '연구원 출신',
    summary: '연구소에서 객체의 기록을 분석하던 사람. 읽는 법은 알지만, 몸은 책상에 맞춰져 있다.',
    stats: { sanity: 45, health: 45, reputation: 15, knowledge: 65 },
  },
  {
    id: 'field',
    name: '현장직 출신',
    summary: '시설 외곽에서 경비와 설비를 맡던 사람. 위험은 몸으로 알지만, 기록을 읽는 데는 서툴다.',
    stats: { sanity: 50, health: 65, reputation: 15, knowledge: 40 },
  },
  {
    id: 'office',
    name: '사무직 출신',
    summary: '본사 행정에서 보고서를 쓰던 사람. 윗사람이 이름을 기억하지만, 현장은 처음이다.',
    stats: { sanity: 50, health: 45, reputation: 35, knowledge: 40 },
  },
]
