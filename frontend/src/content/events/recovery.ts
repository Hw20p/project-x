import type { InterludeDef } from '../../engine/types'

// 회복 이벤트: 주로 정신력을 채워 준다. 정신력이 낮을수록 더 자주 나온다.
export default [
  {
    id: 'rec-vacation',
    kind: 'recovery',
    title: '휴가',
    text: '연차가 쌓이다 못해 인사팀에서 직접 연락이 왔다. 일주일이라도 다녀오라는 것이다.',
    years: 0.5,
    cooldownYears: 8,
    choices: [
      {
        id: 'sea',
        text: '바닷가로 간다',
        risk: 1,
        baseChance: 0.92,
        statWeights: { health: 0.002 },
        success: {
          text: '파도 소리가 규칙적이었다. 어느 것도 이름을 부르지 않았다. 사흘째부터 잠을 푹 잤다.',
          effects: { sanity: 14, health: 4 },
        },
        failure: {
          kind: 'setback',
          text: '바다는 평범했다. 다만 돌아오는 길에 해가 지는 방향이 어제와 달랐던 것 같다.',
          effects: { sanity: 5 },
        },
      },
      {
        id: 'home',
        text: '집에서 아무것도 하지 않는다',
        risk: 1,
        baseChance: 0.95,
        success: {
          text: '이틀은 잤고 하루는 천장을 봤다. 괜찮았다.',
          effects: { sanity: 9 },
        },
        failure: {
          kind: 'setback',
          text: '집이 이상하게 조용해서 오히려 쉬지 못했다.',
          effects: { sanity: 2 },
        },
      },
      {
        id: 'work-trip',
        text: '쉬는 척하며 자료를 챙겨 간다',
        risk: 2,
        baseChance: 0.7,
        statWeights: { knowledge: 0.003 },
        success: {
          text: '숙소에서 읽은 자료가 의외로 머리에 잘 들어왔다.',
          effects: { knowledge: 5, sanity: 4, reputation: 2 },
        },
        failure: {
          kind: 'setback',
          text: '자료의 한 줄이 밤새 머릿속을 맴돌았다.',
          effects: { sanity: -4 },
        },
      },
    ],
  },
  {
    id: 'rec-counseling',
    kind: 'recovery',
    title: '사내 상담',
    text: '정신건강 상담실에서 정기 면담 안내가 왔다. 의무는 아니다. 의무가 아니라는 말이 오히려 의무처럼 들린다.',
    when: { stats: { sanity: { max: 55 } } },
    choices: [
      {
        id: 'open-up',
        text: '있는 그대로 털어놓는다',
        risk: 2,
        baseChance: 0.65,
        statWeights: { sanity: 0.003, reputation: 0.002 },
        success: {
          text: '상담사는 메모를 하지 않고 끝까지 들었다. 나올 때 어깨가 가벼웠다.',
          effects: { sanity: 16 },
        },
        failure: {
          kind: 'setback',
          text: '말을 하다 보니 객체 이야기가 나왔다. 상담사의 표정이 굳었다. 기록에는 “면담 종료”라고만 적혔다.',
          effects: { sanity: -6, reputation: -2 },
        },
      },
      {
        id: 'formal',
        text: '형식적으로 답하고 나온다',
        risk: 1,
        baseChance: 0.9,
        success: {
          text: '적당히 답하고 나왔다. 그것만으로도 한 시간은 쉬었다.',
          effects: { sanity: 5 },
        },
        failure: {
          kind: 'setback',
          text: '“별일 없으시죠?”라는 질문에 별일 없다고 답하는 것이 이상하게 힘들었다.',
          effects: { sanity: -2 },
        },
      },
    ],
  },
  {
    id: 'rec-walk',
    kind: 'recovery',
    title: '새벽 산책',
    text: '잠이 오지 않는 새벽이다. 사원증을 목에 건 채로 건물 밖으로 나왔다.',
    cooldownYears: 4,
    choices: [
      {
        id: 'around-block',
        text: '건물 주변만 한 바퀴 돈다',
        risk: 1,
        baseChance: 0.95,
        success: {
          text: '가로등 아래 같은 자리에 같은 나방이 있었다. 이상하게 안심이 됐다.',
          effects: { sanity: 6, health: 2 },
        },
        failure: {
          kind: 'setback',
          text: '한 바퀴가 생각보다 길었다. 같은 모퉁이를 두 번 돌았다.',
          effects: { sanity: 1 },
        },
      },
      {
        id: 'far',
        text: '멀리까지 걸어간다',
        risk: 2,
        baseChance: 0.68,
        statWeights: { health: 0.003, sanity: 0.002 },
        success: {
          text: '동이 틀 때까지 걸었다. 돌아왔을 때는 세상이 조금 평범해 보였다.',
          effects: { sanity: 11, health: 3 },
        },
        failure: {
          kind: 'setback',
          text: '돌아오는 길을 한 번 잃었다. 날이 밝아서야 건물이 보였다.',
          effects: { sanity: -5, health: -2 },
        },
      },
    ],
  },
  {
    id: 'rec-family',
    kind: 'recovery',
    title: '고향 집',
    text: '명절이다. 가족들은 당신이 무슨 일을 하는지 묻지 않는다. 그게 서로를 위한 일이라는 걸 모두 알고 있다.',
    when: { minAge: 24 },
    cooldownYears: 8,
    choices: [
      {
        id: 'stay-long',
        text: '오래 머물며 식사를 함께 한다',
        risk: 1,
        baseChance: 0.9,
        success: {
          text: '낡은 식탁 위로 오래된 이야기가 오갔다. 아무도 객체에 대해 묻지 않았다.',
          effects: { sanity: 11, health: 2 },
        },
        failure: {
          kind: 'setback',
          text: '식사 도중 걸려 온 전화에 자리를 떠야 했다. 가족들은 이해하는 얼굴을 했다. 그게 더 무거웠다.',
          effects: { sanity: 2, reputation: 2 },
        },
      },
      {
        id: 'short',
        text: '잠깐 얼굴만 비추고 돌아온다',
        risk: 1,
        baseChance: 0.95,
        success: {
          text: '현관 앞에서 건네받은 반찬통이 따뜻했다.',
          effects: { sanity: 5 },
        },
        failure: {
          kind: 'setback',
          text: '돌아오는 열차에서 오래 창밖을 봤다.',
          effects: { sanity: 1 },
        },
      },
    ],
  },
  {
    id: 'rec-sleep',
    kind: 'recovery',
    title: '수면 클리닉',
    text: '며칠째 같은 꿈을 꾼다. 내용은 기억나지 않는데 깨어나면 입에서 낯선 단어가 맴돈다.',
    when: { stats: { sanity: { max: 45 } } },
    choices: [
      {
        id: 'clinic',
        text: '사내 수면 클리닉에 간다',
        risk: 1,
        baseChance: 0.88,
        success: {
          text: '검사 결과는 정상이었다. 처방받은 약은 꿈 없는 잠을 주었다.',
          effects: { sanity: 13, health: 3 },
        },
        failure: {
          kind: 'setback',
          text: '검사 중 모니터에 이상한 파형이 잠깐 찍혔다. 의사는 장비 문제라고 했다.',
          effects: { sanity: -3 },
        },
      },
      {
        id: 'dream-journal',
        text: '꿈 일지를 쓰며 단어를 기록한다',
        risk: 3,
        baseChance: 0.5,
        statWeights: { knowledge: 0.004, sanity: 0.004 },
        success: {
          text: '단어들을 모아 보니 어느 객체의 관찰 기록과 일치했다. 이유 없이 안도했다.',
          effects: { sanity: 8, knowledge: 8 },
        },
        failure: {
          kind: 'setback',
          text: '일지의 단어가 하루 사이 늘어 있었다.',
          effects: { sanity: -9 },
        },
      },
    ],
  },
] satisfies InterludeDef[]
