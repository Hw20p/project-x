import type { NpcDef } from '../engine/types'

// 직장 내 관계 이벤트의 주인공들. 관계 값(-100~100)이 bonds 구간에 들어가면 매년 효과가 붙는다.
// 구간은 두 단계다: 10 이상이면 +0.5, 30 이상(깊은 사이)이면 +1, 반대편은 -10 이하 -1, -30 이하 -2.
// 좋은 쪽을 +1/+2에서 절반으로 낮췄다(18차 시뮬레이션): 관계를 쉽게 올리게 하면서(객체 선택·서술이 관계를 줌)
// 매년 보너스가 너무 커져 안전 우선의 정신 붕괴가 19.8%, 최종 엔딩이 64.6%까지 올랐기 때문이다.
// 10은 첫 이벤트를 잘 풀면 닿는 값이고, 30은 위험한 선택을 연달아 성공해야 닿는 값이다.
// 새 NPC는 여기에 추가하고, `content/events/`의 이벤트가 `npcId`와 `relations`로 연결한다.
export const npcs: NpcDef[] = [
  {
    id: 'jian',
    name: '서지안',
    role: '입사 동기',
    ageGap: 0,
    summary: '같은 날 입사한 동기. 말수는 적지만 야근하는 날이면 꼭 옆자리에 있다.',
    bonds: [
      { label: '든든한 동료', minRelation: 10, maxRelation: 29, yearly: { sanity: 0.5 } },
      { label: '둘도 없는 동료', minRelation: 30, yearly: { sanity: 1 } },
      { label: '서먹한 사이', minRelation: -29, maxRelation: -10, yearly: { sanity: -1 } },
      { label: '등을 돌린 동료', maxRelation: -30, yearly: { sanity: -2 } },
    ],
  },
  {
    id: 'taeseong',
    name: '오태성',
    role: '팀장',
    ageGap: 15,
    summary: '관리팀 팀장. 규정을 지키는 사람이고, 규정이 지키지 못하는 것에 대해서는 말을 아낀다.',
    bonds: [
      { label: '신임을 얻음', minRelation: 10, maxRelation: 29, yearly: { reputation: 0.5 } },
      { label: '두터운 신임', minRelation: 30, yearly: { reputation: 1 } },
      { label: '눈 밖에 남', minRelation: -29, maxRelation: -10, yearly: { reputation: -1 } },
      { label: '찍힘', maxRelation: -30, yearly: { reputation: -2 } },
    ],
  },
  {
    id: 'harin',
    name: '문하린',
    role: '선임 연구원',
    ageGap: 8,
    summary: '객체 관찰 기록을 맡은 선임. 매뉴얼의 지워진 줄이 누구 손에서 나왔는지 아는 듯하다.',
    bonds: [
      { label: '가르침을 받음', minRelation: 10, maxRelation: 29, yearly: { knowledge: 0.5 } },
      { label: '진짜 제자', minRelation: 30, yearly: { knowledge: 1 } },
      { label: '경계받음', maxRelation: -10, yearly: { knowledge: -1 } },
    ],
  },
]
