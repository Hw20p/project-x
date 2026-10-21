import type { ContainmentObject } from '../../engine/types'

export default {
  id: 'x-013',
  code: 'X-013',
  name: '젖은 계단',
  tier: 2,
  summary: '지하 3층 비상계단은 늘 젖어 있고 올라갈수록 물소리가 커진다. 내려갈 때마다 계단 수가 다르다.',
  intro: '순찰 구역이 개편되며 지하 3층 비상계단이 내 구역으로 넘어왔다. 이전 담당자는 인수인계서에 한 줄만 남겨 두었다. “계단은 세지 말 것.”',
  observation: [
    '지하 3층 동쪽 비상계단. 벽과 난간이 늘 젖어 있다.',
    '올라갈 때는 열네 칸, 내려갈 때는 열일곱 칸이다. 세는 사람에 따라 달라지기도 한다.',
    '계단 끝에서 물소리가 점점 커지지만 물이 고인 곳은 찾을 수 없다.',
  ],
  manual: [
    '계단은 두 번 세지 않는다.',
    '물소리가 크게 들리면 올라가지 않는다.',
    '(난간에 새겨진 문장은 닳아서 읽을 수 없다.)',
  ],
  closing: {
    cleared: '계단 끝의 물소리가 멀어졌다. 젖은 난간은 마르면서 이상하게 따뜻했다.',
    failed: '다음 날에도 계단은 젖어 있었다. 몇 칸인지 세는 일을 그만두는 데 한참 걸렸다.',
    demoted: '두 번 세지 말라는 규정이 있었다. 두 번째에 센 숫자가 기록에 남아 있었다.',
  },
  stages: [
    {
      id: 's1',
      title: '열네 칸',
      years: 1,
      text: '순찰 중 비상계단을 올랐다. 열네 칸을 올라 층계참에 닿았는데, 층계참의 층 표시는 한 층 아래를 가리키고 있다.',
      choices: [
        {
          id: 'count-once',
          text: '한 번만 세고 기록한다',
          story: '순찰등을 비추며 한 칸씩 올랐다. 한 칸마다 마음속으로 숫자를 올리고 다시 세지 않겠다고 다짐했다.',
          risk: 1,
          baseChance: 0.8,
          statWeights: { sanity: 0.002 },
          success: {
            text: '열네 칸이라고 적었다. 다시 세지 않았다. 다시 세지 않는 것이 이 계단의 예절이었다.',
            effects: { reputation: 4 },
          },
          failure: {
            kind: 'setback',
            text: '기록한 숫자 옆에 다른 숫자가 덧쓰여 있었다. 내 필체였다.',
            effects: { sanity: -7 },
          },
        },
        {
          id: 'follow-sound',
          text: '물소리가 나는 쪽으로 몇 칸 더 올라간다',
          story: '물소리가 커지는 쪽으로 귀를 기울였다. 난간을 짚은 손바닥이 점점 축축해졌다.',
          risk: 3,
          baseChance: 0.5,
          statWeights: { sanity: 0.004, health: 0.003 },
          success: {
            text: '물소리는 벽 속에서 났다. 벽에 귀를 대자 물이 아니라 누군가 숨을 고르는 소리였다.',
            effects: { knowledge: 9, sanity: -5 },
          },
          failure: {
            kind: 'setback',
            text: '발밑이 미끄러웠다. 난간을 놓친 팔에서 오래 물이 떨어졌다.',
            effects: { health: -9, sanity: -3 },
          },
        },
        {
          id: 'recount-down',
          text: '내려가며 다시 세어 본다',
          story: '층계참에서 돌아서 내려가기 시작했다. 올라올 때의 숫자를 머리에 새기고 한 칸씩 되짚었다.',
          risk: 4,
          baseChance: 0.32,
          statWeights: { sanity: 0.005, knowledge: 0.004 },
          success: {
            text: '내려오며 센 숫자는 열일곱이었다. 세 칸의 차이를 기록하자 계단이 한 번 흔들렸다. 그 뒤로 세 칸은 어느 쪽에도 없었다.',
            effects: { knowledge: 12, reputation: 8, sanity: -6 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '두 번째로 센 계단은 끝이 없었다. 순찰 일지에는 열네 칸이라는 숫자만 남아 있다.',
          },
        },
      ],
    },
    {
      id: 's2',
      title: '물소리',
      years: 1,
      text: '물소리가 오늘은 계단 아래에서 난다. 난간 위에는 방금 누가 잡았던 것 같은 물자국이 선명하다.',
      lead: '열네 칸을 세고 나서 계단은 한동안 조용했다. 다음 순찰 때 물소리가 아래쪽에서 올라왔다.',
      leadAfterFailure: '층계참의 층 표시가 눈에 박힌 채 순찰을 마쳤다. 다음 순찰 때 물소리가 아래쪽에서 올라왔다.',
      choices: [
        {
          id: 'dry-rail',
          text: '난간을 수건으로 닦아 말린다',
          story: '수건을 접어 난간 위에 대고 천천히 문질렀다. 수건이 한 번에 한 뼘씩 어두워졌다.',
          risk: 1,
          baseChance: 0.75,
          statWeights: { health: 0.002 },
          success: {
            text: '난간이 마르자 물소리도 멀어졌다. 닦은 수건은 한참 젖어 있었다.',
            effects: { reputation: 4 },
          },
          failure: {
            kind: 'setback',
            text: '닦아도 닦아도 젖는다. 닦는 속도와 젖는 속도가 같았다.',
            effects: { sanity: -8 },
          },
        },
        {
          id: 'trace-source',
          text: '젖은 자국을 따라 근원지를 추적한다',
          story: '젖은 자국을 따라 손전등을 낮게 비추며 걸었다. 자국이 갈라지는 곳마다 방향을 표시해 두었다.',
          risk: 3,
          baseChance: 0.48,
          statWeights: { knowledge: 0.005 },
          success: {
            text: '자국은 계단 아래의 작은 배수구에서 시작되어 있었다. 배수구 안쪽은 마르고 따뜻했다.',
            effects: { knowledge: 10, reputation: 5, sanity: -4 },
          },
          failure: {
            kind: 'setback',
            text: '자국은 내 발에서 시작되고 있었다.',
            effects: { sanity: -12 },
          },
        },
        {
          id: 'call-down',
          text: '아래층을 향해 큰 소리로 부른다',
          story: '난간 너머 아래층을 향해 몸을 기울였다. 숨을 크게 들이마신 뒤 아래를 향해 소리쳤다.',
          risk: 5,
          baseChance: 0.2,
          statWeights: { sanity: 0.006, knowledge: 0.004 },
          success: {
            text: '대답은 내 목소리였다. 그러나 대답 뒤에 이어진 말은 내가 하지 않은 말이었다. 이후 물소리는 한 번도 들리지 않았다.',
            effects: { knowledge: 14, reputation: 14, sanity: -10 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '대답은 아래에서도 위에서도 왔다. 계단은 그날 이후 열일곱 칸이 되었다.',
          },
        },
        {
          // 조건부 선택지: 입사 배경이 현장직 출신일 때 나타난다.
          id: 'patrol-signal',
          text: '경비 시절 배운 대로 손전등 신호를 보낸다',
          story: '벽에 등을 대고 손전등을 세 번 길게 깜빡였다. 외곽 초소에서 쓰던 신호를 한 박자씩 천천히 보냈다.',
          requires: {
            when: { backgrounds: ['field'] },
            note: '입사 배경이 현장직 출신일 때 나타난다.',
          },
          risk: 1,
          baseChance: 0.82,
          statWeights: { health: 0.002 },
          success: {
            text: '아래쪽 어둠에서 물소리가 한 박자 멈췄다가 같은 순서로 돌아왔다. 신호가 통하는 곳이라는 것만으로 마음이 가라앉았다.',
            effects: { sanity: 6, reputation: 4 },
          },
          failure: {
            kind: 'setback',
            text: '손전등이 깜빡이는 사이 물소리가 한 칸씩 더 가까이 올라왔다. 신호는 끝내 대답을 얻지 못했다.',
            effects: { sanity: -6 },
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
