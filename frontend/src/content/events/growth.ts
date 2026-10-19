import type { InterludeDef } from '../../engine/types'

// 성장 이벤트: 지식·체력·평판을 키워 준다. 대신 시간이 들거나 위험이 따른다.
export default [
  {
    id: 'gro-training',
    kind: 'growth',
    title: '사내 교육 과정',
    text: '관리 교육 과정 모집 공고가 붙었다. 반년 동안 매주 이틀을 내야 한다.',
    years: 0.5,
    cooldownYears: 5,
    choices: [
      {
        id: 'diligent',
        text: '성실하게 전 과정을 수강한다',
        risk: 1,
        baseChance: 0.9,
        statWeights: { knowledge: 0.002 },
        success: {
          text: '강의 자료의 각주가 본문보다 유익했다. 수료증과 함께 얻은 것이 꽤 있다.',
          effects: { knowledge: 8, reputation: 3 },
        },
        failure: {
          kind: 'setback',
          text: '교육 내용이 이미 아는 것 위주였다. 시간만 갔다.',
          effects: { knowledge: 2 },
        },
      },
      {
        id: 'practical',
        text: '실습 위주로 파고든다',
        risk: 2,
        baseChance: 0.65,
        statWeights: { knowledge: 0.004, health: 0.002 },
        success: {
          text: '실습실에서 만져 본 모형이 실제 객체의 구조와 놀랍도록 닮아 있었다.',
          effects: { knowledge: 14, health: -3 },
        },
        failure: {
          kind: 'setback',
          text: '실습 중 모형이 오작동했다. 큰일은 아니었지만 손끝이 한동안 떨렸다.',
          effects: { knowledge: 4, sanity: -5 },
        },
      },
    ],
  },
  {
    id: 'gro-archive',
    kind: 'growth',
    title: '기밀 자료 열람',
    text: '자료실에서 열람 등급이 올라갔다는 안내가 왔다. 서고의 가장 안쪽 서가가 이제 열린다.',
    years: 0.5,
    when: { minRank: 2 },
    cooldownYears: 6,
    choices: [
      {
        id: 'read-index',
        text: '목차와 색인만 훑어본다',
        risk: 1,
        baseChance: 0.85,
        success: {
          text: '색인만 봐도 어떤 객체가 어떤 순서로 발견되었는지 윤곽이 잡혔다.',
          effects: { knowledge: 7 },
        },
        failure: {
          kind: 'setback',
          text: '색인이 찢겨 있었다. 찢긴 자리가 눈에 밟혔다.',
          effects: { knowledge: 2, sanity: -3 },
        },
      },
      {
        id: 'read-deep',
        text: '가장 안쪽 서가의 기록을 정독한다',
        risk: 3,
        baseChance: 0.45,
        statWeights: { sanity: 0.004, knowledge: 0.003 },
        success: {
          text: '읽는 내내 누군가 어깨너머로 함께 읽고 있는 느낌이 들었다. 얻은 것은 컸다.',
          effects: { knowledge: 16, sanity: -6 },
        },
        failure: {
          kind: 'setback',
          text: '읽은 내용 일부가 기억나지 않는다. 읽었다는 사실만 남았다.',
          effects: { knowledge: 3, sanity: -12 },
        },
      },
    ],
  },
  {
    id: 'gro-body',
    kind: 'growth',
    title: '체력 단련',
    text: '건강검진 결과표의 체력 항목에 노란 표시가 붙었다. 사내 체육관 이용권도 함께 왔다.',
    years: 0.5,
    cooldownYears: 5,
    choices: [
      {
        id: 'routine',
        text: '매일 같은 시간에 가볍게 운동한다',
        risk: 1,
        baseChance: 0.9,
        statWeights: { health: 0.002 },
        success: {
          text: '반년 뒤 계단이 덜 높게 느껴졌다.',
          effects: { health: 9, sanity: 2 },
        },
        failure: {
          kind: 'setback',
          text: '꾸준히 가지 못했다. 그래도 나쁘지는 않았다.',
          effects: { health: 3 },
        },
      },
      {
        id: 'hard',
        text: '한계까지 몰아붙이는 훈련을 받는다',
        risk: 2,
        baseChance: 0.6,
        statWeights: { health: 0.004 },
        success: {
          text: '몸이 달라진 것이 느껴졌다. 객체 앞에서도 다리가 덜 떨렸다.',
          effects: { health: 16, sanity: -3 },
        },
        failure: {
          kind: 'setback',
          text: '무리하다 근육을 다쳤다. 한동안 계단을 오를 때마다 숨을 골라야 했다.',
          effects: { health: -6 },
        },
      },
    ],
  },
  {
    id: 'gro-presentation',
    kind: 'growth',
    title: '보고 발표',
    text: '분기 보고 자리에서 팀 대표 발표를 맡을 사람을 구한다. 모두가 서류를 보는 척한다.',
    when: { minRank: 2 },
    cooldownYears: 6,
    choices: [
      {
        id: 'volunteer',
        text: '자원해서 발표를 맡는다',
        risk: 2,
        baseChance: 0.6,
        statWeights: { reputation: 0.003, knowledge: 0.003 },
        success: {
          text: '발표가 끝나자 질문이 이어졌다. 질문이 있다는 건 들었다는 뜻이다.',
          effects: { reputation: 10, knowledge: 2 },
        },
        failure: {
          kind: 'setback',
          text: '발표 중간에 슬라이드 한 장이 비어 있었다. 아무도 웃지 않았다.',
          effects: { reputation: -6, sanity: -3 },
        },
      },
      {
        id: 'listen',
        text: '청중으로 앉아 필기만 한다',
        risk: 1,
        baseChance: 0.95,
        success: {
          text: '타인의 발표에서 의외의 정보를 얻었다.',
          effects: { knowledge: 3, reputation: 2 },
        },
        failure: {
          kind: 'setback',
          text: '졸음이 왔다. 필기는 한 줄도 남지 않았다.',
          effects: { reputation: -1 },
        },
      },
    ],
  },
] satisfies InterludeDef[]
