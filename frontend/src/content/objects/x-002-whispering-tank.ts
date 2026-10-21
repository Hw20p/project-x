import type { ContainmentObject } from '../../engine/types'

export default {
  id: 'x-002',
  code: 'X-002',
  name: '속삭이는 수조',
  tier: 1,
  summary: '비어 있는데 물소리가 나는 유리 수조. 근무자의 목소리로 근무자의 이름을 부른다.',
  intro: '첫 주 교육이 끝나기도 전에 계측실 열쇠가 책상 위에 놓였다. 비어 있는 수조의 수위를 기록하는 일이 내 몫이 되었다.',
  observation: [
    '지하 1층 계측실의 유리 수조. 물이 없을 때에도 물소리가 난다.',
    '소리는 근무자의 목소리로 근무자의 이름을 부른다.',
    '물이 차오른 날 수조에서 사람이 나온 기록은 없다. 들어간 기록만 있다.',
  ],
  manual: [
    '수조의 부름에 대답하지 않는다.',
    '수위 점검은 두 명이 한다. 한 명은 반드시 수조를 등지고 선다.',
    '수조가 비어 있다고 해서 안전한 것은 아니다.',
  ],
  closing: {
    cleared: '수조는 조용해졌다. 내 이름을 부르던 목소리가 마지막으로 한 번 더 부르고는 그쳤다.',
    failed: '물소리가 그치지 않았다. 일지에는 누가 내 이름을 불렀는지 적지 못했다.',
    demoted: '수조에 대답한 일이 기록에 남았다. 내 목소리였으니 변명할 말이 없었다.',
  },
  stages: [
    {
      id: 's1',
      title: '물소리',
      years: 1,
      text: '계측실에 혼자 남았다. 빈 수조에서 낮은 물소리와 함께 당신의 이름이 들린다. 어제보다 목소리가 가깝다.',
      choices: [
        {
          id: 'cover-ears',
          text: '귀를 막고 점검표만 채운다',
          story: '귀마개를 깊이 눌러 끼우고 점검표를 펼쳤다. 숫자를 하나씩 적는 동안에도 물소리가 뼈를 타고 올라왔다.',
          risk: 1,
          baseChance: 0.8,
          statWeights: { sanity: 0.003 },
          success: {
            text: '점검표를 채우는 동안 이름은 일곱 번 불렸다. 하나도 듣지 않았다.',
            effects: { reputation: 3 },
          },
          failure: {
            kind: 'setback',
            text: '귀를 막은 손 사이로도 목소리가 들어왔다. 평소 당신의 목소리보다 다정했다.',
            effects: { sanity: -10 },
          },
        },
        {
          id: 'transcribe',
          text: '속삭임을 그대로 받아 적는다',
          story: '수조 앞에 의자를 놓고 필기구를 들었다. 들리는 소리를 음절 그대로 종이에 옮기기 시작했다.',
          risk: 2,
          baseChance: 0.6,
          statWeights: { knowledge: 0.005, sanity: 0.003 },
          success: {
            text: '받아 적은 문장은 좌표였다. 아직 존재하지 않는 층의 좌표.',
            effects: { knowledge: 7, reputation: 4 },
          },
          failure: {
            kind: 'setback',
            text: '받아 적은 글씨가 당신의 필체가 아니다.',
            effects: { sanity: -13 },
          },
        },
        {
          id: 'answer',
          text: '소리 내어 대답한다',
          story: '수조를 향해 한 걸음 다가섰다. 목구멍이 말라서 처음에는 소리가 나오지 않았다.',
          risk: 4,
          baseChance: 0.28,
          statWeights: { sanity: 0.005 },
          success: {
            text: '수조는 오래 조용해졌다. 당신의 이름은 더 이상 불리지 않는다. 대신 어딘가에서 당신의 목소리가 누군가를 부르기 시작했다.',
            effects: { knowledge: 10, reputation: 11, sanity: -8 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '다음 날 수조는 가득 차 있었다. 투명한 물속에 근무복 한 벌이 가라앉아 있었다.',
          },
        },
      ],
    },
    {
      id: 's2',
      title: '수위 점검',
      years: 1,
      text: '수위 점검일. 두 명이 해야 하는데 동료가 수조를 등지는 것을 거부한다. “난 이미 한 번 돌아봤어요.”',
      lead: '계측실의 물소리가 한동안 잠잠해졌다. 점검일이 되어 동료와 함께 수조 앞으로 향했다.',
      leadAfterFailure: '이름을 부르던 목소리가 귀에서 떠나지 않았다. 점검일이 되어 굳은 얼굴로 수조 앞으로 향했다.',
      choices: [
        {
          id: 'turn-yourself',
          text: '당신이 수조를 등지고 서서 동료가 점검하게 한다',
          story: '수조를 등지고 서서 동료에게 점검판을 넘겼다. 등 뒤에서 물소리가 한 박자씩 가까워지는 것이 느껴졌다.',
          risk: 1,
          baseChance: 0.78,
          statWeights: { sanity: 0.003, reputation: 0.002 },
          success: {
            text: '등 뒤에서 물소리가 끊겼다 이어지기를 반복했다. 점검은 끝났다. 동료는 끝내 아무 말도 하지 않았다.',
            relations: { jian: 8 },
            effects: { reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '점검이 끝나기 전, 등 뒤에서 누군가 젖은 손을 어깨에 얹은 것 같았다.',
            relations: { jian: -4 },
            effects: { sanity: -11, health: -4 },
          },
        },
        {
          id: 'salt-line',
          text: '수조 주변에 소금으로 선을 긋는다',
          story: '소금 포대를 열어 수조 둘레에 선을 그었다. 소금이 바닥에 닿을 때마다 물소리가 한 겹씩 얇아졌다.',
          risk: 2,
          baseChance: 0.6,
          statWeights: { knowledge: 0.006 },
          success: {
            text: '소금 선 안쪽에서 소리가 한 겹 가라앉았다. 기록해 둘 만한 방법이다.',
            effects: { knowledge: 8, reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '소금이 젖어 있었다. 아무도 물을 엎지르지 않았는데.',
            effects: { sanity: -8 },
          },
        },
        {
          id: 'touch-water',
          text: '수조 바닥에 손을 대어 본다',
          story: '수조의 가장자리를 짚고 바닥으로 손을 뻗었다. 유리는 빈 수조답게 건조한데, 손끝은 이미 젖은 느낌이었다.',
          risk: 3,
          baseChance: 0.4,
          statWeights: { sanity: 0.004, health: 0.003 },
          success: {
            text: '손바닥에 닿은 것은 물이 아니었다. 오래된 책장 같은 감촉이었다. 당신은 기록에 “수조는 도서관”이라고 적었다.',
            effects: { knowledge: 12, reputation: 7, sanity: -5 },
            finish: true,
          },
          failure: {
            kind: 'demotion',
            text: '규정 위반. 손바닥의 물자국은 일주일 동안 지워지지 않았고, 당신은 감사실로 불려 갔다.',
            effects: { reputation: -10, sanity: -5 },
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
