import type { ContainmentObject } from '../../engine/types'

export default {
  id: 'x-003',
  code: 'X-003',
  name: '저녁 인형',
  tier: 2,
  summary: '해가 지면 위치가 바뀌는 도자기 인형 열두 개. 누가 보고 있으면 멈춘다.',
  observation: [
    '격리실 선반 위의 도자기 인형 열두 개. 해가 지면 위치가 바뀐다.',
    '누군가 지켜보는 동안에는 움직이지 않는다.',
    '선반에는 열세 번째 자리가 비어 있다. 처음부터 그랬다.',
  ],
  manual: [
    '격리실에는 두 명 이상 입실한다.',
    '인형에게서 눈을 떼지 않는다. 깜빡임은 제외한다.',
    '열세 번째 자리는 세지 않는다.',
  ],
  closing: {
    cleared: '인형 열두 개를 선반에 나란히 세웠다. 해가 져도 한참 동안 아무도 움직이지 않았다.',
    failed: '저녁이 되자 인형이 한 개 모자랐다. 일지에는 열두 개라고 적혀 있었다.',
    demoted: '눈을 떼지 말라는 규정이 있었다. 돌아보았을 때 인형은 한 걸음 가까이 와 있었다.',
  },
  stages: [
    {
      id: 's1',
      title: '열두 개의 인형',
      years: 1,
      text: '격리실에는 도자기 인형 열두 개가 놓여 있다. 해가 지면 위치가 바뀌고, 누군가 보고 있으면 멈춘다. 오늘 밤은 당신이 지킬 차례다.',
      choices: [
        {
          id: 'pair-watch',
          text: '두 명이 교대로 쉬지 않고 지켜본다',
          story: '두 사람이 마주 앉아 인형 선반을 반씩 나누어 맡았다. 눈을 깜박일 때마다 서로의 이름을 불러 확인했다.',
          risk: 1,
          baseChance: 0.78,
          statWeights: { health: 0.003, reputation: 0.002 },
          success: {
            text: '열두 개의 인형은 밤새 움직이지 않았다. 아침이 오자 모든 인형이 조금 안도한 표정이었다.',
            relations: { jian: 5 },
            effects: { reputation: 4, health: -3 },
          },
          failure: {
            kind: 'setback',
            text: '눈을 깜빡인 순간 한 개가 문 앞에 서 있었다. 아무도 그것이 움직이는 소리를 듣지 못했다.',
            relations: { jian: -1 },
            effects: { sanity: -10 },
          },
        },
        {
          id: 'log-positions',
          text: '인형들의 위치를 15분 간격으로 기록한다',
          story: '시계를 책상 위에 올리고 첫 기록란을 펼쳤다. 열다섯 분마다 인형들의 좌표를 하나씩 옮겨 적었다.',
          risk: 2,
          baseChance: 0.6,
          statWeights: { knowledge: 0.005 },
          success: {
            text: '기록에서 규칙이 보였다. 인형들은 항상 같은 순서로, 지켜보는 사람 쪽으로 천천히 다가온다.',
            effects: { knowledge: 8, reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '기록표 마지막 칸에 “열세 번째 인형”이라는 문장이 적혀 있다. 쓴 기억이 없다.',
            effects: { sanity: -12 },
          },
        },
        {
          id: 'sunlight',
          text: '인형 한 개를 햇빛이 드는 복도로 꺼낸다',
          story: '인형 하나를 두 손으로 감싸 안고 복도로 나왔다. 창으로 들어온 저녁 햇빛이 도자기의 얼굴을 따라 천천히 번졌다.',
          risk: 4,
          baseChance: 0.3,
          statWeights: { sanity: 0.004, knowledge: 0.004 },
          success: {
            text: '복도에 놓인 인형은 단단한 도자기였다. 그날 밤 나머지 열한 개는 저녁이 되어도 움직이지 않았다. 하나가 떠나면 모두가 멈추는 구조였다.',
            effects: { knowledge: 12, reputation: 12, sanity: -6 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '인형은 햇빛 아래에서 웃고 있었다. 그날 밤 격리실에는 열세 개의 인형이 있었다. 열세 번째는 당신의 크기였다.',
          },
        },
      ],
    },
    {
      id: 's2',
      title: '열세 번째 자리',
      years: 1,
      text: '한 해가 지나자, 비어 있던 열세 번째 자리가 눈에 띄게 닦여 있다. 누군가 그 자리를 준비하고 있다.',
      choices: [
        {
          id: 'seal-shelf',
          text: '빈 자리를 천으로 덮고 봉인한다',
          story: '비어 있는 자리 앞에 서서 흰 천을 펼쳤다. 천을 덮자 선반의 먼지가 한꺼번에 가라앉는 것 같았다.',
          risk: 1,
          baseChance: 0.75,
          statWeights: { sanity: 0.003 },
          success: {
            text: '천은 아침까지 그대로였다.',
            effects: { reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '천 아래에서 무언가 들썩였다. 당신은 내일 다시 확인하지 않기로 했다.',
            effects: { sanity: -9 },
          },
        },
        {
          id: 'ask-supervisor',
          text: '상급자에게 빈 자리의 역사를 묻는다',
          story: '상급자의 방 문을 두드리고 그 자리에 대해 물었다. 상급자는 대답하기 전에 먼저 문을 닫았다.',
          risk: 2,
          baseChance: 0.62,
          statWeights: { reputation: 0.005 },
          success: {
            text: '상급자는 오래 침묵하다 말했다. “그 자리엔 항상 한 명이 있었어. 이름만 바뀌지.”',
            relations: { harin: 6 },
            effects: { knowledge: 7, reputation: 3, sanity: -4 },
          },
          failure: {
            kind: 'setback',
            text: '“신입이 알 필요 없는 일이다.” 상급자의 눈이 인형과 닮아 있었다.',
            relations: { harin: -3 },
            effects: { reputation: -5, sanity: -6 },
          },
        },
        {
          id: 'sit-in-seat',
          text: '당신이 열세 번째 자리에 앉아 본다',
          story: '비어 있는 열세 번째 자리 앞에 섰다. 선반의 높이가 의자에 앉은 사람의 눈높이와 같다는 것을 그제야 알았다.',
          risk: 4,
          baseChance: 0.32,
          statWeights: { sanity: 0.005 },
          success: {
            text: '자리에 앉은 당신을 인형들이 한참 바라보았다. 그리고 하나씩, 정확히 제자리로 돌아갔다.',
            effects: { knowledge: 10, reputation: 12, sanity: -8 },
            finish: true,
          },
          failure: {
            kind: 'demotion',
            text: '당신은 반나절 동안 자리에서 일어나지 못했다. 사유서에는 “자리의 일부가 됨”이라고 적혔다.',
            effects: { reputation: -12, sanity: -10 },
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
