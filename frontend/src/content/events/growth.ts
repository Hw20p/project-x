import type { InterludeDef } from '../../engine/types'

// 성장 이벤트: 지식·체력·평판을 키워 준다. 대신 시간이 들거나 위험이 따른다.
export default [
  {
    id: 'gro-training',
    kind: 'growth',
    title: '사내 교육 과정',
    text: '관리 교육 과정 모집 공고가 붙었다. 반년 동안 매주 이틀을 내야 한다.',
    cooldownYears: 5,
    choices: [
      {
        id: 'diligent',
        text: '성실하게 전 과정을 수강한다',
        story: '매주 이틀을 비우고 강의실 맨 앞줄에 앉았다. 필기장은 반년 만에 두 권이 되었다.',
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
        story: '이론 시간은 건너뛰고 실습실 열쇠부터 받았다. 장갑을 낀 채 모형 앞에 오래 서 있었다.',
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
    when: { minRank: 2 },
    cooldownYears: 6,
    choices: [
      {
        id: 'read-index',
        text: '목차와 색인만 훑어본다',
        story: '서고 입구에서 목차 책자만 집어 들었다. 색인 쪽수를 엄지로 넘기며 훑었다.',
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
        story: '가장 안쪽 서가 앞에서 먼지를 털고 첫 권을 꺼냈다. 의자를 끌어와 불을 하나 더 켰다.',
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
    cooldownYears: 5,
    choices: [
      {
        id: 'routine',
        text: '매일 같은 시간에 가볍게 운동한다',
        story: '이용권을 들고 이른 아침 체육관에 갔다. 러닝머신 속도를 가장 낮게 맞추었다.',
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
        story: '트레이너에게 가장 힘든 과정으로 부탁했다. 첫날부터 숨이 목까지 차올랐다.',
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
        story: '손을 들자 회의실이 조용해졌다. 자료를 다시 정리하며 발표 순서를 입속으로 외웠다.',
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
        story: '맨 뒷자리에 앉아 필기장을 펼쳤다. 발표자의 말을 한 줄도 놓치지 않으려 했다.',
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
  {
    id: 'gro-field',
    kind: 'growth',
    title: '외부 시찰 참관',
    text: '다른 시설의 시찰단이 방문한다. 안내를 맡은 선임이 한 명 빠져, 참관 자리가 당신에게 돌아왔다.',
    cooldownYears: 7,
    when: { minRank: 3 },
    choices: [
      {
        id: 'observe',
        text: '옆에서 관찰만 한다',
        story: '시찰단 뒤로 한 걸음 물러나 따라 걸었다. 수첩에 본 것만 짧게 적었다.',
        risk: 1,
        baseChance: 0.85,
        statWeights: { knowledge: 0.003 },
        success: {
          text: '시찰 보고서에 쓸 사실만 골라 담았다. 무엇을 빼야 하는지가 가장 큰 공부였다.',
          effects: { knowledge: 7, reputation: 3 },
        },
        failure: {
          kind: 'setback',
          text: '본 것을 기록하기도 전에 잊어버렸다. 메모만 남았다.',
          effects: { knowledge: 2 },
        },
      },
      {
        id: 'assist',
        text: '보조로 직접 나선다',
        story: '장갑을 끼고 시찰단 옆에 붙어 섰다. 설비를 건넬 때마다 손끝이 먼저 움직였다.',
        risk: 3,
        baseChance: 0.5,
        statWeights: { health: 0.003, sanity: 0.003 },
        success: {
          text: '직접 만져 본 감각이 오래 남았다. 손끝이 기억하는 매뉴얼이 있다.',
          effects: { knowledge: 10, health: -3, reputation: 4 },
        },
        failure: {
          kind: 'setback',
          text: '무리하다 손목을 다쳤다. 시찰단은 못 본 척했다.',
          effects: { health: -8, knowledge: 3 },
        },
      },
      {
        id: 'lead',
        text: '선임이 비운 자리를 대신 맡는다',
        story: '선임의 안내 서류를 건네받아 앞에 섰다. 첫 문장을 입속으로 한 번 더 연습했다.',
        risk: 4,
        baseChance: 0.35,
        statWeights: { reputation: 0.004, sanity: 0.004 },
        success: {
          text: '대신 앞에 섰다. 손은 떨렸지만 말은 끝까지 나왔다.',
          effects: { reputation: 12, knowledge: 6, sanity: -6 },
        },
        failure: {
          kind: 'setback',
          text: '말이 끊겼다. 시찰단이 침묵하는 동안 서류만 내려다보았다.',
          effects: { reputation: -8, sanity: -6 },
        },
      },
    ],
  },
  {
    id: 'gro-mentor',
    kind: 'growth',
    title: '후임 지도',
    text: '새로 들어온 후임이 당신 옆자리에 배정되었다. 첫 객체 관리를 앞두고 무엇이든 물어볼 사람이 필요한 눈빛이다.',
    cooldownYears: 6,
    when: { minRank: 2 },
    choices: [
      {
        id: 'teach-slow',
        text: '하나씩 천천히 가르친다',
        story: '후임 옆자리에 의자를 당겨 앉았다. 매뉴얼의 첫 장부터 한 줄씩 짚어 가며 설명했다.',
        risk: 1,
        baseChance: 0.85,
        success: {
          text: '가르치는 동안 내가 잊고 있던 것이 다시 정리되었다.',
          effects: { knowledge: 6, reputation: 4 },
        },
        failure: {
          kind: 'setback',
          text: '후임은 고개만 끄덕였다. 이해했는지는 알 수 없다.',
          effects: { reputation: 1 },
        },
      },
      {
        id: 'hands-off',
        text: '스스로 해 보라고 맡긴다',
        story: '후임에게 첫 객체 서류를 통째로 넘겼다. 곁에서 한 걸음 떨어져 팔짱을 꼈다.',
        risk: 2,
        baseChance: 0.6,
        statWeights: { reputation: 0.003 },
        success: {
          text: '후임은 실수를 한 번 하고, 다음에는 하지 않았다.',
          effects: { reputation: 7, knowledge: 2 },
        },
        failure: {
          kind: 'setback',
          text: '후임이 규정을 어겼고, 보고서에는 내 서명이 있었다.',
          effects: { reputation: -6 },
        },
      },
      {
        id: 'tell-truth',
        text: '지워진 매뉴얼 줄이 있다는 사실까지 말해 준다',
        story: '사람이 드문 복도로 후임을 불러냈다. 매뉴얼을 펼쳐 지워진 줄을 손가락으로 짚어 주었다.',
        risk: 3,
        baseChance: 0.5,
        statWeights: { sanity: 0.003, knowledge: 0.003 },
        success: {
          text: '후임은 오래 말이 없었다. 그날 이후 내 눈을 똑바로 보았다.',
          effects: { reputation: 6, knowledge: 6, sanity: -4 },
        },
        failure: {
          kind: 'setback',
          text: '후임이 다음 날 부서 이동을 신청했다.',
          effects: { reputation: -5, sanity: -3 },
        },
      },
    ],
  },
] satisfies InterludeDef[]
