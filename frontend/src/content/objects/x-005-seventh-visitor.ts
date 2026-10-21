import type { ContainmentObject } from '../../engine/types'

export default {
  id: 'x-005',
  code: 'X-005',
  name: '일곱 번째 손님',
  tier: 3,
  summary: '매주 상담실을 찾아오는 방문자. 늘 상담자와 같은 얼굴을 하고 있다.',
  intro: '주임으로 승급한 첫 달, 상담실 일정표에 상담자로 내 이름이 적혔다. 이번 주 방문자도 정해진 시각에 정확히 도착했다고 했다.',
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
          story: '교체 요청서를 작성해 인사 담당에게 직접 전했다. 서류를 내려놓는 손이 평소보다 느리게 움직였다.',
          risk: 1,
          baseChance: 0.75,
          statWeights: { reputation: 0.004 },
          success: {
            text: '교체된 상담자가 다음 주 방문자를 맞았다. 방문자는 의자에 앉아 오래 문을 바라보았다. 누군가를 기다리듯이.',
            relations: { taeseong: 4 },
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
          story: '방문자와 마주 앉아 천천히 말을 꺼냈다. 상담실의 시계 초침이 두 사람 사이에서 조금 크게 들렸다.',
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
          story: '일어나 방문자 앞으로 걸어갔다. 의자를 맞바꾸는 동안 두 사람 모두 서로의 얼굴에서 눈을 떼지 않았다.',
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
      lead: '여섯 번째 방문이 끝나고 상담실은 한동안 조용했다. 일곱 번째 방문일이 되어 문 앞에 섰다.',
      leadAfterFailure: '여섯 번째 방문에서 들은 질문이 내내 맴돌았다. 일곱 번째 방문일, 문 앞에서 손잡이를 쥐기까지 시간이 걸렸다.',
      choices: [
        {
          id: 'cover-mirrors',
          text: '상담실의 모든 거울을 덮고 문 앞에서 대기한다',
          story: '상담실에 있는 거울을 하나씩 떼어 내 천을 덮었다. 마지막 거울을 덮을 때 천이 한 번 안쪽에서 부풀었다.',
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
          story: '문틈에 녹음기를 세워 두고 복도 끝에서 기다렸다. 닫힌 문 너머로 낮은 대화가 일정한 간격으로 오갔다.',
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
          story: '문손잡이에 손을 얹고 한참 숨을 골랐다. 안에서 들리던 대화가 문을 돌리기 직전에 뚝 그쳤다.',
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
