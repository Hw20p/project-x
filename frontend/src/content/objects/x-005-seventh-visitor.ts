import type { ContainmentObject } from '../../engine/types'

export default {
  id: 'x-005',
  code: 'X-005',
  name: '일곱 번째 손님',
  tier: 3,
  summary: '매주 상담실을 찾아오는 방문자. 늘 상담자와 같은 얼굴을 하고 있다.',
  observation: [
    '지상 2층 상담실. 매주 같은 요일 오후 세 시에 방문자가 온다.',
    '방문자는 상담자와 같은 얼굴을 하고 있다.',
    '여섯 번째 방문까지는 평범한 고민 상담이다. 일곱 번째 방문의 기록은 없다.',
  ],
  manual: [
    '방문자의 이름을 묻지 않는다.',
    '일곱 번째 방문 전에 상담자를 교체한다.',
    '상담실의 거울은 모두 천으로 덮는다.',
  ],
  closing: {
    cleared: '상담실 의자가 비었다. 다음 주에도 올 것 같던 방문자는 이번에는 오지 않았다.',
    failed: '손님은 약속 시간에 맞춰 왔다. 나와 똑같은 표정으로 보고서를 대신 읽었다.',
    demoted: '상담 내용을 그에게 말하지 말라는 규정이 있었다. 그는 내가 아직 하지 않은 말까지 이미 알고 있었다.',
  },
  stages: [
    {
      id: 's1',
      title: '여섯 번째 방문',
      years: 1,
      text: '방문자가 여섯 번째로 자리에 앉았다. 오늘은 “요즘 잠은 잘 자요?”라고 당신에게 먼저 물었다. 목소리는 당신과 같다.',
      choices: [
        {
          id: 'switch-counselor',
          text: '다음 방문 전에 상담자를 교체해 달라고 요청한다',
          risk: 1,
          baseChance: 0.75,
          statWeights: { reputation: 0.004 },
          success: {
            text: '교체된 상담자가 다음 주 방문자를 맞았다. 방문자는 의자에 앉아 오래 문을 바라보았다. 누군가를 기다리듯이.',
            effects: { reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '교체 요청서는 승인되지 않았다. “규정상 일곱 번째 전에는 교체하지 않는다.”',
            effects: { reputation: -4, sanity: -6 },
          },
        },
        {
          id: 'ask-about-self',
          text: '방문자에게 “나에 대해 말해 보라”고 요청한다',
          risk: 3,
          baseChance: 0.45,
          statWeights: { sanity: 0.004, knowledge: 0.004 },
          success: {
            text: '방문자는 당신이 아직 하지 않은 선택을 이야기했다. 당신은 그것을 하지 않기로 했다.',
            effects: { knowledge: 9, reputation: 5, sanity: -6 },
          },
          failure: {
            kind: 'setback',
            text: '방문자가 이야기한 것은 당신의 가장 오래된 비밀이었다. 누구에게도 말한 적 없는.',
            effects: { sanity: -15 },
          },
        },
        {
          id: 'swap-seats',
          text: '자리를 바꿔 앉아 상담을 이어 간다',
          risk: 4,
          baseChance: 0.3,
          statWeights: { sanity: 0.005, knowledge: 0.003 },
          success: {
            text: '방문자는 상담자 자리에서 한참 침묵했다. 이윽고 조용히 일어나 나갔다. 일곱 번째 방문은 오지 않았다.',
            effects: { knowledge: 12, reputation: 13, sanity: -8 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '상담이 끝나고 문이 열렸을 때, 나온 사람은 한 명이었다. 상담 기록에는 두 사람의 서명이 같은 필체로 남아 있다.',
          },
        },
      ],
    },
    {
      id: 's2',
      title: '일곱 번째 방문',
      years: 1,
      text: '일곱 번째 방문일이 왔다. 상담실 문 앞에 서자 안에서 이미 대화 소리가 들린다.',
      choices: [
        {
          id: 'cover-mirrors',
          text: '상담실의 모든 거울을 덮고 문 앞에서 대기한다',
          risk: 1,
          baseChance: 0.7,
          statWeights: { knowledge: 0.003, sanity: 0.003 },
          success: {
            text: '문 안의 대화가 점점 느려지더니 끊겼다. 방문자는 오지 않은 것으로 기록되었다.',
            effects: { reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '덮어 둔 천이 하나 벗겨져 있었다. 거울 속에는 이미 당신이 서 있었다.',
            effects: { sanity: -12 },
          },
        },
        {
          id: 'record-conversation',
          text: '문밖에서 대화를 녹음한다',
          risk: 3,
          baseChance: 0.45,
          statWeights: { knowledge: 0.005 },
          success: {
            text: '녹음에는 한 사람의 목소리만 있었다. 질문과 대답을 모두 같은 사람이 했다.',
            effects: { knowledge: 10, reputation: 6, sanity: -5 },
          },
          failure: {
            kind: 'setback',
            text: '녹음은 공백이었다. 다만 재생 속도를 올리자 당신의 이름이 반복해서 들렸다.',
            effects: { sanity: -13 },
          },
        },
        {
          id: 'enter',
          text: '문을 열고 들어가 일곱 번째 손님을 직접 맞이한다',
          risk: 5,
          baseChance: 0.2,
          statWeights: { sanity: 0.006, knowledge: 0.004 },
          success: {
            text: '손님은 당신에게 미소를 지었다. “이번에는 당신이 먼저 왔네요.” 그것으로 대화는 끝났고, 방문은 다시 오지 않았다.',
            effects: { knowledge: 14, reputation: 15, sanity: -10 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '문 안에는 거울 한 장만 서 있었다. 다음 주 상담 기록에는 당신의 이름 위에 줄이 그어져 있었다.',
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
