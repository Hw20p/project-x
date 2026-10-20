import type { ContainmentObject } from '../../engine/types'

export default {
  id: 'x-006',
  code: 'X-006',
  name: '굶주린 지도',
  tier: 3,
  summary: '지도에 없는 장소를 그려 넣으면 현실에 생기고, 한 계절 뒤 지도가 그곳을 먹어 버린다.',
  observation: [
    '작전실 벽면의 대형 지도. 지도에 없는 장소를 그려 넣으면 현실에 생겨난다.',
    '새로 생긴 장소는 정확히 한 계절 뒤 지도 속으로 먹혀 사라진다. 그곳에 있던 사람과 함께.',
    '지도의 가장자리는 해마다 안쪽으로 줄어든다.',
  ],
  manual: [
    '지도에 펜으로 그리지 않는다.',
    '누군가 그리고 싶다고 말하면 그 이유를 기록한다.',
    '지도 가장자리의 치수를 매달 측정한다.',
  ],
  // 같은 3급인 X-005(2단계, 허용치 0)보다 훨씬 쉬워지는 것을 막으려고 3단계지만 허용치를 두지 않는다. (시뮬레이션: 안전 우선 성공률 85%)
  closing: {
    cleared: '지도를 접어 서랍에 넣었다. 마지막으로 그려 넣은 장소는 아직 남아 있다.',
    failed: '지도가 한 계절 만에 한 군데를 더 먹었다. 도면에는 그곳이 처음부터 공백이었다고 적혀 있었다.',
    demoted: '그려 넣어서는 안 되는 곳에 선을 그었다. 지도는 그 자리를 먹고도 접히지 않았다.',
  },
  stages: [
    {
      id: 's1',
      title: '줄어드는 가장자리',
      years: 1,
      text: '이번 달 측정일이다. 지도의 가장자리가 지난달보다 안쪽으로 들어와 있다. 줄어든 부분에 있던 지명은 이제 아무도 기억하지 못한다.',
      choices: [
        {
          id: 'measure',
          text: '줄자로 가장자리를 재어 매달 기록한다',
          story: '지도를 평평한 책상에 펴고 가장자리마다 줄자를 댔다. 눈금을 읽어 날짜와 함께 기록부에 옮겼다.',
          risk: 1,
          baseChance: 0.78,
          statWeights: { knowledge: 0.003, reputation: 0.003 },
          success: {
            text: '지도는 한 달에 0.4센티미터씩 줄고 있었다. 숫자는 정직했다.',
            effects: { knowledge: 4, reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '줄자의 눈금이 어젯밤보다 한 칸 줄어 있었다.',
            effects: { sanity: -8 },
          },
        },
        {
          id: 'compare-old-maps',
          text: '과거 지도 사본과 대조해 사라진 지명을 찾는다',
          story: '서고에서 과거 지도 사본을 한 아름 꺼내 왔다. 지명을 하나씩 손가락으로 짚어 가며 지금의 지도와 겹쳐 보았다.',
          risk: 2,
          baseChance: 0.6,
          statWeights: { knowledge: 0.006 },
          success: {
            text: '사라진 지명은 열두 곳. 모두 누군가 소원을 말한 장소였다.',
            effects: { knowledge: 8, reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '대조하던 사본에도 같은 곳이 이미 지워져 있다. 사본은 어제 인쇄된 것이다.',
            effects: { sanity: -11 },
          },
        },
        {
          id: 'draw-dot',
          text: '지도 한쪽에 점 하나를 찍어 반응을 본다',
          story: '펜을 들고 지도의 빈 모서리에 한참 머물렀다. 숨을 멈추고 점 하나를 찍은 뒤 천천히 펜을 뗐다.',
          risk: 4,
          baseChance: 0.32,
          statWeights: { sanity: 0.004, knowledge: 0.004 },
          success: {
            text: '점은 지도 위에서 한 번 깜빡이고 사라졌다. 지도가 맛을 본 듯했다. 그 뒤로 지도의 줄어듦이 멈췄다.',
            effects: { knowledge: 12, reputation: 12, sanity: -6 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '점이 있던 자리에는 작은 구멍이 났다. 사무실 한쪽 칸막이가 그 크기만큼 비어 있었다. 그곳은 당신의 자리였다.',
          },
        },
      ],
    },
    {
      id: 's2',
      title: '소원',
      years: 1,
      text: '동료가 지도를 보며 말했다. “여기에 바다를 그리면 휴가지가 되겠죠?” 반쯤 농담이지만 눈빛은 그렇지 않다.',
      choices: [
        {
          id: 'record-reason',
          text: '동료의 이유를 기록하고 상급자 면담을 요청한다',
          story: '동료가 털어놓는 이유를 하나도 놓치지 않고 받아 적었다. 기록을 정리한 뒤 상급자 면담을 요청하는 서류를 썼다.',
          risk: 1,
          baseChance: 0.8,
          statWeights: { reputation: 0.004 },
          success: {
            text: '면담 뒤 동료는 펜에서 손을 뗐다. 기록은 규정대로 작성되었다.',
            relations: { jian: 6 },
            effects: { reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '동료는 면담을 거부했다. 그날 밤 지도의 한구석이 조금 푸르러졌다.',
            relations: { jian: -3 },
            effects: { reputation: -4, sanity: -6 },
          },
        },
        {
          id: 'offer-substitute',
          text: '대신 종이에 지도 사본을 그리게 한다',
          story: '동료에게 백지와 연필을 건넸다. 지도를 보지 않고 기억나는 대로 사본을 그려 보라고 했다.',
          risk: 2,
          baseChance: 0.58,
          statWeights: { knowledge: 0.004, reputation: 0.003 },
          success: {
            text: '사본 위에 바다가 그려졌다. 지도는 그것을 잠시 지켜보다 흥미를 잃었다.',
            relations: { jian: 5 },
            effects: { knowledge: 7, reputation: 6 },
          },
          failure: {
            kind: 'setback',
            text: '사본의 바다가 마르자 지도의 바다가 젖었다.',
            effects: { sanity: -10 },
          },
        },
        {
          id: 'let-draw-small',
          text: '통제된 환경에서 작은 섬 하나를 그리게 한다',
          story: '격리 책상 위에 작은 종이를 따로 펼쳤다. 동료가 펜을 쥐고 섬의 윤곽을 천천히 그리기 시작했다.',
          risk: 4,
          baseChance: 0.3,
          statWeights: { knowledge: 0.005, sanity: 0.003 },
          success: {
            text: '섬은 한 계절 동안 존재했다. 우리는 그곳에서 지도의 식사 시간을 알아냈다.',
            effects: { knowledge: 13, reputation: 12, sanity: -7 },
            finish: true,
          },
          failure: {
            kind: 'demotion',
            text: '섬은 사라졌고, 그곳에 있던 관측 장비와 함께 당신의 승인 기록도 사라졌다.',
            effects: { reputation: -12 },
          },
        },
      ],
    },
    {
      id: 's3',
      title: '먹이',
      years: 1,
      text: '지도의 가장자리가 눈에 띄게 줄었다. 상부는 지도에 “먹이”를 줄 것인지 결정하라고 한다. 지도가 가장 좋아하는 것은 누군가 간절히 바란 장소다.',
      choices: [
        {
          id: 'seal-map',
          text: '지도 전체를 납 케이스로 봉인한다',
          story: '지도를 접어 납으로 안을 댄 케이스에 넣었다. 뚜껑을 닫는 순간 안에서 종이가 펼쳐지는 소리가 났다.',
          risk: 2,
          baseChance: 0.65,
          statWeights: { knowledge: 0.003, reputation: 0.003 },
          success: {
            text: '봉인된 지도는 조용했다. 줄어드는 속도도 늦어졌다.',
            effects: { reputation: 6, knowledge: 4 },
          },
          failure: {
            kind: 'setback',
            text: '봉인 직전 지도의 가장자리가 손가락 끝을 훑었다. 손끝의 지문이 한 줄 사라졌다.',
            effects: { health: -6, sanity: -8 },
          },
        },
        {
          id: 'feed-fake',
          text: '허구의 장소를 그려 넣어 지도를 속인다',
          story: '존재하지 않는 지명 하나를 정성스럽게 지어냈다. 지도의 빈 곳에 그 이름을 또박또박 써 넣었다.',
          risk: 3,
          baseChance: 0.45,
          statWeights: { knowledge: 0.006 },
          success: {
            text: '지도는 없는 장소를 한참 씹더니 입맛을 다셨다. 그 뒤로 얌전해졌다.',
            effects: { knowledge: 9, reputation: 8 },
          },
          failure: {
            kind: 'demotion',
            text: '지도는 속지 않았다. 그날 이후 지도에는 당신이 상상한 허구의 장소가 정확한 좌표로 남았다. 상부는 당신을 문책했다.',
            effects: { reputation: -10, sanity: -8 },
          },
        },
        {
          id: 'write-own-name',
          text: '자기 이름을 지도의 한 지점에 적어 시험한다',
          story: '지도의 한 지점을 골라 펜 끝을 가져다 댔다. 자기 이름의 첫 획을 긋는 손이 눈에 띄게 떨렸다.',
          risk: 5,
          baseChance: 0.2,
          statWeights: { sanity: 0.006, knowledge: 0.004 },
          success: {
            text: '지도는 이름을 삼키지 못하고 뱉어냈다. 그 한 줄이, 우리가 아는 한 지도가 거부한 유일한 문장이다.',
            effects: { knowledge: 15, reputation: 15, sanity: -12 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '당신의 이름은 지도 위에서 아주 작은 마을이 되었다. 한 계절이 지나면 그곳은 먹힌다.',
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
