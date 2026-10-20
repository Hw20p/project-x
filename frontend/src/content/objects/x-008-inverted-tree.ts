import type { ContainmentObject } from '../../engine/types'

export default {
  id: 'x-008',
  code: 'X-008',
  name: '거꾸로 자라는 나무',
  tier: 4,
  summary: '뿌리를 하늘에 두고 자라는 나무. 열매는 누군가의 기억이다.',
  observation: [
    '지하 온실 천장에 뿌리를 둔 나무. 가지는 바닥을 향해 자란다.',
    '열매는 사람의 기억이다. 먹은 사람은 그 기억을 자기 것이라고 믿는다.',
    '열매가 열린 해에는 근무자 중 한 명이 사라지고, 가지에 이름표가 걸린다.',
  ],
  manual: [
    '열매를 따지 않는다.',
    '열매가 떨어지면 맨손으로 줍지 않는다.',
    '이름표를 읽을 때는 소리 내지 않는다.',
  ],
  failureTolerance: 1,
  closing: {
    cleared: '나무의 열매를 모두 거두었다. 어느 열매도 내 기억은 아니었다.',
    failed: '열매 하나가 땅에 닿기 전에 사라졌다. 누구의 기억이었는지 아무도 묻지 않았다.',
    demoted: '열매를 맛보지 말라는 규정이 있었다. 입안에 남은 기억은 어릴 적의 내 것이 아니었다.',
  },
  stages: [
    {
      id: 's1',
      title: '첫 열매',
      years: 1,
      text: '올해 처음으로 가지 끝에 열매가 맺혔다. 껍질 안쪽에서 어렴풋이 사람 얼굴이 비친다. 온실 담당자는 “이번엔 빨리 떨어질 것 같다”고 한다.',
      choices: [
        {
          id: 'net-fruit',
          text: '열매 아래에 그물을 쳐서 떨어진 열매를 받는다',
          story: '나무 아래에 가는 그물을 넓게 펼쳤다. 열매가 매달린 가지 밑에서 숨을 죽이고 기다렸다.',
          risk: 1,
          baseChance: 0.74,
          statWeights: { health: 0.003, reputation: 0.003 },
          success: {
            text: '그물에 떨어진 열매는 곧 쪼그라들어 흙이 되었다. 누구의 기억이었는지는 끝내 알 수 없었다.',
            effects: { reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '열매가 그물을 통과했다. 바닥에서 터진 열매의 냄새를 맡은 당신은 한동안 낯선 집의 부엌을 그리워했다.',
            effects: { sanity: -11 },
          },
        },
        {
          id: 'photograph-fruit',
          text: '열매 속 얼굴을 촬영해 신원을 대조한다',
          story: '열매에 카메라를 가까이 대고 초점을 맞췄다. 열매 표면에 비친 얼굴이 렌즈 속에서 조금 움직였다.',
          risk: 2,
          baseChance: 0.58,
          statWeights: { knowledge: 0.006 },
          success: {
            text: '대조 결과 일치하는 직원이 있었다. 이미 퇴사했고, 퇴사 사유는 “기억 상실”이었다.',
            effects: { knowledge: 9, reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '사진 속 얼굴은 당신이었다. 아직 열매가 되지 않은 당신.',
            effects: { sanity: -13 },
          },
        },
        {
          id: 'taste-fruit',
          text: '장갑을 끼고 열매를 한 입 베어 문다',
          story: '장갑을 끼고 열매 하나를 가지에서 조심스럽게 땄다. 입을 가져다 대기 전에 한 번 더 냄새를 맡았다.',
          risk: 4,
          baseChance: 0.3,
          statWeights: { sanity: 0.005, health: 0.003 },
          success: {
            text: '입안에 퍼진 기억은 어느 겨울의 아침이었다. 누군가 문을 열고 들어오며 “다녀왔어”라고 말했다. 그 기억 하나로 열매는 흙이 되었고, 나무는 그해 다시 열매를 맺지 않았다.',
            effects: { knowledge: 13, reputation: 12, sanity: -8 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '당신은 열매의 기억 속으로 걸어 들어갔다. 이튿날 가지에는 새 이름표가 걸려 있었다. 당신의 필체로 적힌.',
          },
        },
      ],
    },
    {
      id: 's2',
      title: '이름표',
      years: 1,
      text: '가지에 이름표가 걸렸다. 읽기 전에는 누구의 것인지 모른다. 모두가 조용히 서로의 얼굴을 확인한다.',
      choices: [
        {
          id: 'read-silently',
          text: '소리 내지 않고 이름표를 읽어 상급자에게만 전달한다',
          story: '가지에 걸린 이름표에 얼굴을 가까이 가져갔다. 입술을 다문 채 눈으로만 글자를 따라 읽었다.',
          risk: 1,
          baseChance: 0.7,
          statWeights: { reputation: 0.004, sanity: 0.003 },
          success: {
            text: '이름표의 주인은 이미 출장 중이었다. 상급자는 그에게 돌아오지 말라는 연락을 보냈다.',
            effects: { reputation: 6 },
          },
          failure: {
            kind: 'setback',
            text: '속으로 읽은 이름이 자꾸 입안에서 맴돌았다. 아무도 듣지 못해서 다행이었다. 아마도.',
            effects: { sanity: -12 },
          },
        },
        {
          id: 'swap-tags',
          text: '다른 가지의 빈 이름표와 바꿔 달아 본다',
          story: '다른 가지의 빈 이름표를 조심스럽게 풀었다. 이름표 두 개를 손에 쥐고 서로 바꿔 달 자리를 가늠했다.',
          risk: 3,
          baseChance: 0.42,
          statWeights: { knowledge: 0.005, sanity: 0.003 },
          success: {
            text: '이름표를 바꿔 달자 나무는 어느 쪽 가지에 열매를 맺을지 한참 망설였다. 그 망설임 덕분에 그해의 희생은 없었다.',
            effects: { knowledge: 11, reputation: 9, sanity: -5 },
          },
          failure: {
            kind: 'demotion',
            text: '바꿔 단 이름표의 주인이 이튿날 사라졌다. 조사위원회는 당신의 개입 기록을 확인했다.',
            effects: { reputation: -13, sanity: -9 },
          },
        },
        {
          id: 'cut-branch',
          text: '이름표가 걸린 가지를 톱으로 잘라낸다',
          story: '톱을 가지 밑동에 대고 숨을 골랐다. 톱날이 나무껍질에 닿는 순간 가지 전체가 잔잔히 떨렸다.',
          risk: 5,
          baseChance: 0.2,
          statWeights: { health: 0.005, sanity: 0.004 },
          success: {
            text: '잘린 가지는 바닥에서 한참 꿈틀대다 멈췄다. 나무는 그해 열매 맺기를 포기했다. 이름표의 주인은 아무 일도 없었다는 듯 출근했다.',
            effects: { knowledge: 14, reputation: 15, health: -6, sanity: -9 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '톱이 가지에 닿는 순간 천장의 뿌리가 일제히 내려왔다. 온실 감시 영상에는 당신이 가지를 향해 걸어가는 장면만 남았다.',
          },
        },
      ],
    },
    {
      id: 's3',
      title: '가을',
      years: 2,
      text: '나무가 이전보다 훨씬 크게 자랐다. 가지 하나하나가 직원의 이름표를 달고 있다. 온실 관리 부서는 둘 중 하나를 결정하라고 한다. 뿌리를 태울 것인가, 나무를 계속 키울 것인가.',
      choices: [
        {
          id: 'keep-monitoring',
          text: '나무를 그대로 두고 관측만 계속한다',
          story: '관측 장비를 나무 둘레에 다시 배치했다. 매일 같은 시각에 같은 자리에서 기록을 이어 가기로 했다.',
          risk: 2,
          baseChance: 0.65,
          statWeights: { knowledge: 0.004, reputation: 0.003 },
          success: {
            text: '나무는 두 해 동안 조용히 자랐다. 열매는 맺히지 않았다. 아무도 이유를 알지 못하지만 우리는 그것을 성과로 기록했다.',
            effects: { knowledge: 6, reputation: 8 },
          },
          failure: {
            kind: 'setback',
            text: '두 번째 해가 끝날 무렵 나무의 가지 하나가 당신의 사무실 창문을 두드렸다.',
            effects: { sanity: -13 },
          },
        },
        {
          id: 'prune-roots',
          text: '천장의 뿌리를 일부 잘라 나무를 약하게 만든다',
          story: '천장에 사다리를 걸치고 가지치기 가위를 쥐었다. 굵은 뿌리 하나를 골라 가위날을 벌렸다.',
          risk: 3,
          baseChance: 0.45,
          statWeights: { health: 0.004, knowledge: 0.004 },
          success: {
            text: '잘린 뿌리에서 맑은 물이 흘렀다. 나무는 잎을 떨구고 겨울잠에 들었다.',
            effects: { knowledge: 10, reputation: 10, health: -4 },
          },
          failure: {
            kind: 'demotion',
            text: '뿌리를 자른 부위에서 비명 같은 소리가 났다. 이후 온실은 폐쇄되었고, 당신은 책임을 졌다.',
            effects: { reputation: -14 },
          },
        },
        {
          id: 'burn-roots',
          text: '뿌리 전체를 태워 나무를 끝낸다',
          story: '천장에 매달린 뿌리 밑으로 약품 통을 하나씩 옮겼다. 마지막 통의 뚜껑을 열기 전에 환기구를 모두 닫았다.',
          risk: 5,
          baseChance: 0.22,
          statWeights: { sanity: 0.005, health: 0.003, knowledge: 0.003 },
          success: {
            text: '불길 속에서 수많은 얼굴이 하나씩 눈을 감았다. 재가 된 나무에서는 열매가 아닌 작은 종이쪽지가 하나씩 떨어졌다. 그 쪽지에는 “고마워”라고만 적혀 있었다.',
            effects: { knowledge: 16, reputation: 18, sanity: -10 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '불은 나무가 아닌 온실을 태웠다. 연기가 가라앉은 뒤, 천장에는 뿌리 하나가 더 늘어 있었고 그 끝에 당신의 이름표가 걸려 있었다.',
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
