import type { ContainmentObject } from '../../engine/types'

export default {
  id: 'x-012',
  code: 'X-012',
  name: '번호표',
  tier: 1,
  summary: '민원실의 번호표 발급기. 뽑은 번호가 영이 되면 호출 방송이 나오고, 불린 사람은 이름의 일부를 두고 돌아온다.',
  observation: [
    '본관 1층 민원실의 번호표 발급기. 전원은 연결되어 있지 않다.',
    '뽑은 번호는 대기 인원과 무관하게 줄어든다.',
    '번호가 0이 되면 호출 방송이 나오고, 호출된 사람은 이름의 일부가 비어 돌아온다.',
  ],
  manual: [
    '번호표는 한 번에 한 장만 뽑는다.',
    '호출 방송에 대답하지 않는다.',
    '(이하는 번호표에 가려 읽을 수 없다.)',
  ],
  closing: {
    cleared: '번호표 기계의 불이 꺼졌다. 마지막으로 뽑힌 번호는 영이 아니었다.',
    failed: '호출 방송이 한 번 더 울렸다. 대답한 사람은 아무도 없었는데 이름 하나가 줄어 있었다.',
    demoted: '방송에 대답하지 말라는 규정이 있었다. 대답하는 목소리는 분명 내 것이었다.',
  },
  stages: [
    {
      id: 's1',
      title: '대기 번호',
      years: 1,
      text: '민원실은 비어 있는데 번호표 발급기가 혼자 한 장을 뱉었다. 대기 번호는 7번, 전광판의 현재 번호는 3번이다. 번호가 한 칸씩 줄어든다.',
      choices: [
        {
          id: 'log-numbers',
          text: '번호가 줄어드는 간격만 기록한다',
          story: '민원실 구석 의자에 앉아 전광판과 시계를 번갈아 보았다. 숫자가 바뀔 때마다 시각을 한 줄씩 적었다.',
          risk: 1,
          baseChance: 0.82,
          statWeights: { knowledge: 0.003 },
          success: {
            text: '간격은 일정했다. 일정하다는 것이 오히려 이 기계의 가장 이상한 점이었다.',
            effects: { knowledge: 5, reputation: 3 },
          },
          failure: {
            kind: 'setback',
            text: '기록하는 동안 간격이 두 번 어긋났다. 어긋난 것이 기계인지 시계인지 알 수 없었다.',
            effects: { sanity: -7 },
          },
        },
        {
          id: 'take-ticket',
          text: '직접 번호표를 뽑아 순서를 지켜본다',
          story: '발급기 앞에 서서 버튼을 눌렀다. 뱉어진 번호표를 손끝으로 집어 들고 전광판을 올려다보았다.',
          risk: 2,
          baseChance: 0.6,
          statWeights: { sanity: 0.003, knowledge: 0.003 },
          success: {
            text: '내 번호도 같은 속도로 줄었다. 그러나 이름은 그대로였다. 순서가 되기 전에 표를 찢자 기계가 조용해졌다.',
            effects: { knowledge: 7, reputation: 3, sanity: -3 },
          },
          failure: {
            kind: 'setback',
            text: '번호표에 찍힌 번호가 내 사번과 같았다. 손에서 놓을 수 없을 만큼 따뜻했다.',
            effects: { sanity: -11 },
          },
        },
        {
          id: 'answer-call',
          text: '호출 방송이 나오면 창구로 나가 본다',
          story: '번호표를 쥐고 창구 앞 의자에 앉았다. 전광판의 숫자가 줄어드는 것을 한 칸씩 지켜보았다.',
          risk: 4,
          baseChance: 0.3,
          statWeights: { sanity: 0.005, knowledge: 0.003 },
          success: {
            text: '창구 직원은 얼굴이 없었다. 번호표 대신 서류 한 장을 받았다. 서류에는 지워진 이름들이 가지런히 적혀 있었다.',
            effects: { knowledge: 12, reputation: 10, sanity: -5 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '호출 방송이 끝나자 창구에는 아무도 없었다. 다음 날 전광판에는 내 이름의 첫 글자만 남아 있었다.',
          },
        },
      ],
    },
    {
      id: 's2',
      title: '영 번호',
      years: 1,
      text: '번호는 어느새 1번이 되었다. 이제 다음 호출이 나올 차례다. 방송의 첫마디가 벌써 스피커에서 새어 나온다.',
      choices: [
        {
          id: 'unplug-speaker',
          text: '호출 방송 스피커의 선을 뽑는다',
          story: '스피커의 뒤쪽 패널을 열고 선을 찾았다. 드라이버를 쥔 손으로 단자를 하나씩 풀어 나갔다.',
          risk: 1,
          baseChance: 0.78,
          statWeights: { sanity: 0.003 },
          success: {
            text: '스피커가 조용해졌다. 번호는 1번에서 멈췄다. 멈춘 것을 기록에 적었다.',
            effects: { reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '선을 뽑았는데도 방송이 나왔다. 선은 애초에 어디에도 연결되어 있지 않았다.',
            effects: { sanity: -9 },
          },
        },
        {
          id: 'cover-display',
          text: '전광판을 천으로 덮는다',
          story: '전광판 아래에 의자를 놓고 올라섰다. 검은 천의 끝을 양손으로 펴서 전광판 위에 덮었다.',
          risk: 2,
          baseChance: 0.6,
          statWeights: { knowledge: 0.003, reputation: 0.002 },
          success: {
            text: '덮은 천 아래에서 숫자가 멈췄다. 방송은 나오지 않았다.',
            effects: { knowledge: 6, reputation: 4 },
          },
          failure: {
            kind: 'setback',
            text: '천 아래에서 숫자가 계속 줄어드는 소리가 났다.',
            effects: { sanity: -8, reputation: -1 },
          },
        },
        {
          id: 'call-yourself',
          text: '방송을 내 목소리로 먼저 틀어 버린다',
          story: '방송실의 마이크를 켜고 목을 가다듬었다. 호출 문구를 내 목소리로 한 번 연습해 보았다.',
          risk: 4,
          baseChance: 0.32,
          statWeights: { sanity: 0.005, knowledge: 0.004 },
          success: {
            text: '방송은 내 목소리로 먼저 흘러나갔다. 번호표 기계는 한참 침묵하다 마지막 장을 뱉었다. 장에는 아무 숫자도 없었다.',
            effects: { knowledge: 12, reputation: 12, sanity: -8 },
            finish: true,
          },
          failure: {
            kind: 'demotion',
            text: '무허가 방송이 기록되었다. 시말서를 쓰는 동안 전광판은 내 이름을 한 글자씩 지웠다.',
            effects: { reputation: -10 },
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
