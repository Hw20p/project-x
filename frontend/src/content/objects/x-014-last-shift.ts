import type { ContainmentObject } from '../../engine/types'

export default {
  id: 'x-014',
  code: 'X-014',
  name: '마지막 교대',
  tier: 3,
  summary: '야간 경비실의 교대 일지. 교대자의 이름은 기록되지 않고 서명만 남는다. 다음 교대자는 늘 기록한 사람 자신이다.',
  observation: [
    '본관 지하 1층 야간 경비실. 교대 일지가 책상 위에 놓여 있다.',
    '일지에는 교대 시각과 서명만 있고 이름이 없다.',
    '서명의 필체는 기록한 사람의 필체와 늘 같다.',
  ],
  manual: [
    '교대 시각이 되면 자리를 비운다.',
    '다음 교대자의 얼굴을 보지 않는다.',
    '(일지의 마지막 줄은 아무도 쓰지 않는다.)',
  ],
  closing: {
    cleared: '교대 일지의 마지막 칸이 비었다. 비었다는 것이 이렇게 가벼운 일인 줄 몰랐다.',
    failed: '교대 시각이 지나도 아무도 오지 않았다. 의자는 내가 일어나기를 기다리는 것 같았다.',
    demoted: '일지의 마지막 칸은 쓰지 말라는 규정이 있었다. 시말서의 날짜는 내일이었다.',
  },
  stages: [
    {
      id: 's1',
      title: '인수인계',
      years: 1,
      text: '교대 시각 직전이다. 일지에는 방금까지 근무한 사람의 서명이 있다. 내 서명과 같은 필체다.',
      choices: [
        {
          id: 'read-roster',
          text: '일지의 지난 장을 거슬러 읽는다',
          story: '일지를 책상 위에 펴고 한 장씩 뒤로 넘겼다. 페이지마다 같은 필체의 서명이 다른 날짜 아래 반복되었다.',
          risk: 2,
          baseChance: 0.6,
          statWeights: { knowledge: 0.004 },
          success: {
            text: '지난 장마다 서명은 같았다. 날짜만 해마다 한 줄씩 밀려 있었다.',
            effects: { knowledge: 8, sanity: -4 },
            setFlags: ['read-shift-roster'],
          },
          failure: {
            kind: 'setback',
            text: '읽는 동안 지난 장이 한 장씩 비어 갔다. 마지막 장을 넘겼을 때는 아무 글씨도 없었다.',
            effects: { sanity: -8 },
          },
        },
        {
          id: 'sign-and-leave',
          text: '규정대로 서명하고 자리를 비운다',
          story: '펜을 들어 서명란에 이름을 적었다. 서명이 끝나자마자 외투를 걸치고 문 쪽으로 향했다.',
          risk: 1,
          baseChance: 0.8,
          statWeights: { reputation: 0.003 },
          success: {
            text: '서명하고 일어섰다. 복도 끝에서 의자 끄는 소리가 났다.',
            effects: { reputation: 4 },
          },
          failure: {
            kind: 'setback',
            text: '서명을 하는 순간 펜이 멈췄다. 서명란에는 이미 내 서명이 있었다.',
            effects: { sanity: -6 },
          },
        },
        {
          id: 'wait-successor',
          text: '다음 교대자가 올 때까지 자리를 지킨다',
          story: '자리를 지킨 채 시계를 바라보았다. 교대 시각이 지나도 의자에서 일어나지 않았다.',
          risk: 4,
          baseChance: 0.3,
          statWeights: { sanity: 0.005 },
          success: {
            text: '문이 열리고 들어온 사람은 눈을 마주치지 않았다. 일지의 서명이 한 칸 아래로 옮겨졌다.',
            effects: { knowledge: 10, reputation: 8, sanity: -6 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '아침에 경비실을 열었을 때 의자는 비어 있었다. 일지는 계속 쓰여 있었다.',
          },
        },
      ],
    },
    {
      id: 's2',
      title: '야간 순찰',
      years: 1,
      text: '교대를 마치고 순찰에 나섰다. 복도의 불은 내가 지나간 자리만 먼저 꺼진다. 뒤에서 구두 소리가 같은 박자로 따라온다.',
      choices: [
        {
          id: 'keep-walking',
          text: '걸음을 바꾸지 않고 끝까지 돈다',
          story: '순찰 경로를 따라 같은 보폭으로 걸었다. 구두 소리가 뒤에서 같은 박자로 이어졌다.',
          risk: 1,
          baseChance: 0.75,
          statWeights: { health: 0.002, sanity: 0.003 },
          success: {
            text: '구두 소리는 내 걸음과 정확히 겹쳤다. 겹치는 것을 알면서도 끝까지 걸었다.',
            effects: { reputation: 4 },
          },
          failure: {
            kind: 'setback',
            text: '걸음을 한 번 멈추자 구두 소리는 한 걸음 더 갔다.',
            effects: { sanity: -8 },
          },
        },
        {
          id: 'light-behind',
          text: '손전등으로 뒤를 비춘다',
          story: '손전등을 쥐고 한 번 숨을 멈췄다. 몸을 반쯤 돌려 빛을 뒤쪽 복도로 던졌다.',
          risk: 3,
          baseChance: 0.48,
          statWeights: { sanity: 0.004, knowledge: 0.003 },
          success: {
            text: '빛 끝에는 아무도 없었다. 다만 벽에 비친 그림자가 두 개였다.',
            effects: { knowledge: 9, sanity: -5 },
          },
          failure: {
            kind: 'setback',
            text: '손전등이 꺼졌다. 구두 소리가 내 앞으로 지나갔다.',
            effects: { sanity: -11 },
          },
        },
        {
          id: 'follow-steps',
          text: '구두 소리를 따라가 본다',
          story: '구두 소리가 멈추는 곳을 귀로 쫓았다. 소리가 이어지는 방향으로 한 걸음씩 되짚어 갔다.',
          risk: 4,
          baseChance: 0.32,
          statWeights: { sanity: 0.005, knowledge: 0.003 },
          success: {
            text: '소리는 경비실로 이어졌다. 의자에는 아무도 없었고 일지의 마지막 줄이 막 쓰이고 있었다.',
            effects: { knowledge: 12, reputation: 10, sanity: -7 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '소리를 따라간 끝에는 교대 시각이 있었다. 그 시각은 돌아오지 않았다.',
          },
        },
      ],
    },
    {
      id: 's3',
      title: '교대 시각',
      years: 1,
      text: '내가 교대해야 할 시각이 왔다. 일지의 마지막 칸이 비어 있다. 다음 교대자가 누구인지 아는 것은 이 건물에서 나뿐이다.',
      choices: [
        {
          id: 'leave-blank',
          text: '마지막 칸을 비워 둔 채 일어난다',
          story: '마지막 칸을 비워 둔 채 펜을 내려놓았다. 일지를 덮고 의자를 조용히 밀어 넣었다.',
          risk: 1,
          baseChance: 0.72,
          statWeights: { sanity: 0.003 },
          success: {
            text: '일어서자 의자가 조용히 뒤로 밀렸다. 비어 있는 칸이 오히려 온전해 보였다.',
            effects: { reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '일어서는 순간 서명란이 채워졌다. 내 필체였다.',
            effects: { sanity: -9 },
          },
        },
        {
          id: 'write-successor',
          text: '마지막 칸에 다음 교대자의 이름을 적어 본다',
          story: '펜 끝을 마지막 칸 위에 올렸다. 떠오르는 이름이 없어서 한참 종이만 내려다보았다.',
          risk: 3,
          baseChance: 0.45,
          statWeights: { sanity: 0.004, knowledge: 0.004 },
          success: {
            text: '이름을 적자 글씨가 내 것이 아니게 변했다. 일지는 처음으로 모든 칸이 채워졌다.',
            effects: { knowledge: 10, reputation: 6, sanity: -6 },
          },
          failure: {
            kind: 'demotion',
            text: '마지막 칸은 쓰지 말라는 규정이 있었다. 시말서의 서명은 내 필체와 같았고, 날짜는 내일이었다.',
            effects: { reputation: -10 },
          },
        },
        {
          id: 'stay-on-shift',
          text: '교대하지 않고 다음 날까지 남는다',
          story: '교대 시각이 지났는데도 외투를 벗어 의자에 걸었다. 새벽 순찰 때 끓일 물을 한 번 더 올렸다.',
          risk: 5,
          baseChance: 0.2,
          statWeights: { sanity: 0.006, knowledge: 0.004 },
          success: {
            text: '교대자는 끝내 오지 않았다. 일지는 처음으로 아무도 서명하지 않은 채 덮였다. 건물이 오래 조용했다.',
            effects: { knowledge: 14, reputation: 14, sanity: -9 },
          },
          failure: {
            kind: 'death',
            text: '다음 날 아침 경비실은 비어 있었다. 일지에는 내 서명 아래 줄이 하나 더 그어져 있었다.',
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
