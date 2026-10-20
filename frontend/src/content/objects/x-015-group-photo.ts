import type { ContainmentObject } from '../../engine/types'

export default {
  id: 'x-015',
  code: 'X-015',
  name: '기념사진',
  tier: 4,
  summary: '본관 로비에 걸린 단체 기념사진. 해마다 사진 속 인원이 한 명씩 바뀌고, 어느 날 관리자의 자리가 사진에 생긴다.',
  observation: [
    '본관 1층 로비 정면 벽에 걸린 단체 기념사진.',
    '사진 속 인원은 해마다 한 명씩 바뀌지만 사진을 찍은 기록은 없다.',
    '사진 속에서 시선을 마주치는 사람은 반드시 이 건물의 현직자다.',
  ],
  manual: [
    '사진 앞에서 오래 서 있지 않는다.',
    '사진 속 인원수를 세지 않는다.',
    '(사진의 뒷면은 확인하지 않는 것이 좋다.)',
  ],
  failureTolerance: 1,
  closing: {
    cleared: '로비의 사진을 올려다보았다. 사진 속 한 칸이 나를 위해 비어 있었는지, 이미 채워졌는지는 확인하지 않았다.',
    failed: '사진 속 인원이 한 명 늘어 있었다. 누가 늘었는지는 묻지 않았다.',
    demoted: '사진을 세지 말라는 규정이 있었다. 세는 동안 사진 속의 얼굴 하나가 내 쪽을 보았다.',
  },
  stages: [
    {
      id: 's1',
      title: '로비의 사진',
      years: 1,
      text: '출근길 로비 벽의 사진이 어제와 조금 다르다. 맨 뒷줄에 낯익은 어깨가 하나 더 서 있다.',
      choices: [
        {
          id: 'note-and-pass',
          text: '변화만 기록하고 그대로 지나간다',
          story: '로비에 들어서자 벽의 사진이 눈에 들어왔다. 메모지에 달라진 점만 짧게 적고 걸음을 늦추지 않았다.',
          risk: 1,
          baseChance: 0.76,
          statWeights: { sanity: 0.003 },
          success: {
            text: '기록은 짧았다. 지나치면서 시선을 느꼈지만 돌아보지 않았다.',
            effects: { reputation: 4 },
          },
          failure: {
            kind: 'setback',
            text: '지나친 뒤에도 뒤통수에 시선이 오래 머물렀다. 하루 종일.',
            effects: { sanity: -10 },
          },
        },
        {
          id: 'compare-photo',
          text: '지난달에 촬영해 둔 사진과 대조해 본다',
          story: '지난달에 찍어 둔 사진을 꺼내 액자 옆에 들어 보였다. 줄마다 어깨의 위치를 하나씩 대조했다.',
          risk: 2,
          baseChance: 0.58,
          statWeights: { knowledge: 0.006 },
          success: {
            text: '대조해 보니 늘어난 어깨는 한 달 전에는 비어 있던 자리였다. 그 자리의 그림자만 먼저 있었다.',
            effects: { knowledge: 9, reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '대조하는 동안 두 사진 속 사람들의 위치가 서로 바뀌어 있었다.',
            effects: { sanity: -12 },
          },
        },
        {
          id: 'meet-eyes',
          text: '사진 속 맨 앞줄 인물과 눈을 맞춘다',
          story: '사진 앞줄 가운데에 선 인물의 얼굴에 시선을 맞췄다. 눈을 깜박이지 않으려고 숨을 멈췄다.',
          risk: 4,
          baseChance: 0.3,
          statWeights: { sanity: 0.005, health: 0.003 },
          success: {
            text: '눈이 마주친 인물이 먼저 시선을 피했다. 사진 속 전체가 미세하게 숨을 쉬었다.',
            effects: { knowledge: 14, reputation: 12, sanity: -8 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '다음 날 로비의 사진에는 한 명이 줄어 있었다. 줄어든 것은 사진 속이었다.',
          },
        },
      ],
    },
    {
      id: 's2',
      title: '인원수',
      years: 1,
      text: '로비 직원이 사진의 인원수를 확인해 달라고 요청한다. 정확한 숫자가 필요하다고 한다. 세는 것은 규정에 어긋난다.',
      choices: [
        {
          id: 'ask-someone-else',
          text: '다른 사람에게 세어 보게 하고 숫자만 받는다',
          story: '로비 직원에게 사진의 인원수를 세어 달라고 부탁했다. 나는 사진을 등지고 서서 숫자만 기다렸다.',
          risk: 1,
          baseChance: 0.72,
          statWeights: { reputation: 0.004 },
          success: {
            text: '숫자가 적힌 쪽지가 돌아왔다. 쪽지의 숫자는 내가 기억하는 인원보다 하나 많았다.',
            effects: { reputation: 5, knowledge: 2 },
          },
          failure: {
            kind: 'setback',
            text: '대신 센 사람은 숫자를 말하지 못했다. 입술만 움직였다.',
            effects: { sanity: -9 },
          },
        },
        {
          id: 'count-by-rows',
          text: '줄 단위로 세어 합산한다',
          story: '액자 앞에 서서 줄마다 손가락으로 허공을 짚었다. 앞줄부터 뒷줄까지 숫자를 따로 적어 나갔다.',
          risk: 3,
          baseChance: 0.45,
          statWeights: { knowledge: 0.005, sanity: 0.003 },
          success: {
            text: '합은 맞았다. 합이 맞는다는 사실이 이상하게 불안했다.',
            effects: { knowledge: 10, reputation: 5, sanity: -4 },
          },
          failure: {
            kind: 'setback',
            text: '세는 도중 한 줄이 앞뒤로 바뀌었다. 합은 계속 달랐다.',
            effects: { sanity: -11 },
          },
        },
        {
          id: 'count-faces',
          text: '한 명씩 얼굴을 보며 센다',
          story: '얼굴 하나하나에 눈을 맞추며 숫자를 입으로 되뇌었다. 열 번째 얼굴쯤에서 사진 속 눈이 마주쳤다.',
          risk: 4,
          baseChance: 0.3,
          statWeights: { sanity: 0.005 },
          success: {
            text: '마지막 얼굴을 센 순간 숫자가 몸에 새겨지듯 떠올랐다. 그 숫자는 보고서에 적을 수 있는 숫자가 아니었다.',
            effects: { knowledge: 14, reputation: 12, sanity: -9 },
            finish: true,
          },
          failure: {
            kind: 'demotion',
            text: '규정 위반이 기록되었다. 시말서 맨 위에는 내가 센 숫자가 이미 적혀 있었다.',
            effects: { reputation: -10 },
          },
        },
      ],
    },
    {
      id: 's3',
      title: '빈 자리',
      years: 2,
      text: '사진 앞줄 오른쪽 끝에 한 칸이 비어 있다. 그 칸의 크기가 내 어깨와 정확히 같다는 것을 알아차렸다.',
      choices: [
        {
          id: 'step-away',
          text: '한 걸음 물러나 오래 쳐다보지 않는다',
          story: '사진 앞에서 한 걸음 뒤로 물러섰다. 시선을 바닥에 두고 숨을 천천히 내쉬었다.',
          risk: 1,
          baseChance: 0.7,
          statWeights: { sanity: 0.003 },
          success: {
            text: '물러선 자리에서 사진은 평범한 단체 사진이었다. 평범한 것이 가장 이상했다.',
            effects: { reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '물러선 발 앞에 어느새 의자가 놓여 있었다.',
            effects: { sanity: -9 },
          },
        },
        {
          id: 'cover-frame',
          text: '액자 유리에 천을 씌운다',
          story: '사다리를 액자 아래에 세우고 검은 천을 펼쳤다. 천의 끝을 액자 윗면에 걸어 유리를 덮었다.',
          risk: 2,
          baseChance: 0.55,
          statWeights: { knowledge: 0.004 },
          success: {
            text: '천을 씌우자 사진 속 소란이 멈췄다. 천 밑에서 오래 아무 소리도 나지 않았다.',
            effects: { knowledge: 8, reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '천이 벗겨져 있었고 빈 칸에는 누군가 서 있었다.',
            effects: { sanity: -12 },
          },
        },
        {
          id: 'take-place',
          text: '빈 칸에 서 본다',
          story: '앞줄 오른쪽 끝의 빈 칸 앞에 섰다. 사진 속 사람들과 같은 방향을 바라보며 천천히 발을 옮겼다.',
          risk: 5,
          baseChance: 0.2,
          statWeights: { sanity: 0.006, knowledge: 0.004 },
          success: {
            text: '사진을 찍은 것도 아닌데 셔터 소리가 났다. 사진 속의 빈 칸은 사라졌고, 대신 로비의 빈 벽에 작은 못 자국이 하나 남았다.',
            effects: { knowledge: 16, reputation: 15, sanity: -10 },
          },
          failure: {
            kind: 'death',
            text: '다음 날 사진 속 앞줄 끝에는 낯익은 어깨가 서 있었다. 그 자리는 지금도 따뜻하다.',
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
