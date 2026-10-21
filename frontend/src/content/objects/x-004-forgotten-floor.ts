import type { ContainmentObject } from '../../engine/types'

export default {
  id: 'x-004',
  code: 'X-004',
  name: '잊혀진 층',
  tier: 2,
  summary: '엘리베이터 4층과 5층 사이, 버튼이 없는 층. 내린 사람은 기억 한 층을 두고 온다.',
  intro: '야간 근무 배치표가 바뀌며 엘리베이터 점검조에 내 이름이 올랐다. 4층과 5층 사이의 일은 사원이 맡는 것이 관례라고 했다.',
  observation: [
    '본관 엘리베이터 4층과 5층 사이에 버튼이 없는 층이 있다.',
    '그 층에서 내린 직원은 돌아온다. 대신 어떤 기억 하나가 사라져 있다.',
    '돌아온 직원은 지워진 기억이 있다는 사실조차 알지 못한다.',
  ],
  manual: [
    '버튼이 없는 층의 문이 열리면 내리지 않는다.',
    '엘리베이터에는 두 명 이상 탑승한다.',
    '층을 지날 때마다 자신의 사번과 가족의 이름을 소리 내어 확인한다.',
  ],
  closing: {
    cleared: '엘리베이터는 4층과 5층에만 섰다. 그 사이에 층이 있었다는 사실을 일지에 적고도 곧 잊었다.',
    failed: '버튼 없는 층의 문이 한 번 더 열렸다. 내린 사람이 있었는지는 아무도 기억하지 못했다.',
    demoted: '내려서는 안 되는 층에 내렸다. 두고 온 기억이 무엇이었는지는 지금도 떠오르지 않는다.',
  },
  stages: [
    {
      id: 's1',
      title: '열리는 문',
      years: 1,
      text: '퇴근 시간, 엘리베이터가 4층과 5층 사이에서 멈췄다. 문이 열렸다. 복도 끝에서 누군가 당신의 사번을 부른다.',
      choices: [
        {
          id: 'close-door',
          text: '닫힘 버튼을 연타하며 사번을 소리 내어 외운다',
          story: '닫힘 버튼을 손바닥으로 연달아 눌렀다. 입으로는 사번을 한 글자씩 또박또박 되뇌었다.',
          risk: 1,
          baseChance: 0.8,
          statWeights: { sanity: 0.003 },
          success: {
            text: '문은 닫혔다. 엘리베이터는 5층에 도착했고, 시계는 방금 전과 같은 시간이었다.',
            effects: { reputation: 3 },
          },
          failure: {
            kind: 'setback',
            text: '문은 닫혔지만, 사번의 마지막 자리가 기억나지 않는다.',
            effects: { sanity: -8, knowledge: -3 },
          },
        },
        {
          id: 'throw-pen',
          text: '문턱 너머로 펜을 던져 반응을 본다',
          story: '주머니에서 펜을 꺼내 문턱 너머로 가볍게 던졌다. 펜이 바닥에 닿는 소리가 복도 끝까지 이어졌다.',
          risk: 2,
          baseChance: 0.6,
          statWeights: { knowledge: 0.005 },
          success: {
            text: '펜은 바닥에 닿지 않고 사라졌다. 잠시 뒤 다른 필체의 메모가 되돌아왔다. “여기는 아직 오늘이 아니다.”',
            effects: { knowledge: 8, reputation: 4 },
          },
          failure: {
            kind: 'setback',
            text: '되돌아온 펜은 당신의 것이 아니었다.',
            effects: { sanity: -10 },
          },
        },
        {
          id: 'step-out',
          text: '한 걸음만 내려서 복도를 둘러본다',
          story: '문턱 앞에서 한 번 숨을 멈췄다. 한쪽 발을 내밀어 복도의 바닥이 단단한지 확인했다.',
          risk: 4,
          baseChance: 0.3,
          statWeights: { sanity: 0.004, knowledge: 0.004 },
          success: {
            text: '복도 끝에는 당신이 잊고 있던 첫 출근 날의 풍경이 있었다. 돌아왔을 때 당신은 지워진 기억이 무엇인지 알 수 있었다. 놀랍게도, 사소한 것이었다.',
            effects: { knowledge: 12, reputation: 11, sanity: -6 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '문이 닫혔을 때 엘리베이터에는 아무도 없었다. 기록에는 처음부터 “탑승자 없음”이라고 적혀 있다.',
          },
        },
      ],
    },
    {
      id: 's2',
      title: '한 층 분의 기억',
      years: 1,
      text: '한 해가 지나면서 동료들의 기억이 조금씩 비어 간다. 어제 점심에 무엇을 먹었는지, 입사 동기가 누구였는지.',
      lead: '엘리베이터는 그날 이후 제 층에 정확히 섰다. 대신 사람들의 대화가 조금씩 헐거워졌다.',
      leadAfterFailure: '문틈에서 들리던 사번 부르는 소리는 끝내 잊히지 않았다. 사람들의 대화는 그때부터 조금씩 헐거워졌다.',
      choices: [
        {
          id: 'memory-journal',
          text: '매일 기억 일지를 쓰게 하고 서로 대조한다',
          story: '직원들에게 작은 수첩을 한 권씩 나누어 주었다. 저녁마다 그날 있었던 일을 적고 서로 대조하게 했다.',
          risk: 1,
          baseChance: 0.78,
          statWeights: { knowledge: 0.004, reputation: 0.003 },
          success: {
            text: '일지가 쌓일수록 지워지는 기억은 줄었다. 그러나 지워진 쪽의 공백은 여전히 같은 모양이다.',
            relations: { jian: 4 },
            effects: { knowledge: 6, reputation: 6 },
          },
          failure: {
            kind: 'setback',
            text: '일지 속 어제의 기록이 오늘의 필체로 바뀌어 있었다.',
            relations: { jian: -1 },
            effects: { sanity: -9 },
          },
        },
        {
          id: 'ask-erased',
          text: '기억을 잃은 직원에게 무엇을 잃었는지 묻는다',
          story: '기억을 잃은 직원을 휴게실로 불러 앉혔다. 질문을 어떻게 시작해야 할지 몰라 먼저 차를 건넸다.',
          risk: 2,
          baseChance: 0.6,
          statWeights: { sanity: 0.003, knowledge: 0.004 },
          success: {
            text: '답을 하던 직원이 문득 울었다. 무엇 때문인지는 그도 몰랐다. 그래도 질문이 공백의 가장자리를 단단하게 했다.',
            relations: { jian: 5 },
            effects: { knowledge: 8, reputation: 4, sanity: -3 },
          },
          failure: {
            kind: 'setback',
            text: '직원은 대답 대신 당신의 이름을 불렀다. 당신은 그를 처음 보는 사람 같았다.',
            effects: { sanity: -11 },
          },
        },
        {
          id: 'ride-again',
          text: '일부러 다시 탑승해 층의 구조를 기록한다',
          story: '업무가 끝난 뒤 다시 엘리베이터에 올랐다. 4층 버튼과 5층 버튼 사이의 빈 벽을 손가락으로 천천히 짚었다.',
          risk: 4,
          baseChance: 0.32,
          statWeights: { sanity: 0.004, knowledge: 0.004 },
          success: {
            text: '기록을 마쳤을 때 당신은 어떤 기억도 잃지 않았다. 잃은 것은 아직 만들어지지 않은 기억이었다.',
            effects: { knowledge: 12, reputation: 11, sanity: -7 },
            finish: true,
          },
          failure: {
            kind: 'demotion',
            text: '돌아온 당신은 멀쩡해 보였다. 하지만 감사실은 당신의 사번이 한 자리 비어 있다는 것을 확인했다.',
            effects: { reputation: -12, knowledge: -8 },
          },
        },
        {
          // 조건부 선택지: 서지안과의 관계가 20 이상이어야 나타난다.
          id: 'entrust-memory',
          text: '서지안에게 내 이야기를 맡기고 기억해 달라고 부탁한다',
          story: '퇴근길에 서지안을 불러 세워 어제 먹은 점심부터 하나씩 이야기했다. 서지안은 수첩을 꺼내 받아 적었다.',
          requires: {
            when: { relations: { jian: { min: 20 } } },
            note: '서지안과의 관계가 20 이상이어야 나타난다.',
          },
          risk: 2,
          baseChance: 0.78,
          statWeights: { sanity: 0.003 },
          success: {
            text: '수첩에는 내 하루가 서지안의 필체로 남았다. 비어 가는 기억 한쪽에 단단한 모서리가 생겼다.',
            effects: { sanity: 8, knowledge: 4 },
            relations: { jian: 4 },
          },
          failure: {
            kind: 'setback',
            text: '서지안은 받아 적다가 자기 이름이 적힌 줄에서 펜을 멈췄다. 우리는 한동안 서로의 얼굴만 확인했다.',
            effects: { sanity: -5 },
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
