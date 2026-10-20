import type { ContainmentObject } from '../../engine/types'

export default {
  id: 'x-001',
  code: 'X-001',
  name: '빈 의자',
  tier: 1,
  summary: '휴게실 구석의 낡은 나무 의자. 앉은 사람의 기억이 조금 따라온다.',
  observation: [
    '3층 휴게실 구석, 등받이가 낮은 나무 의자.',
    '비어 있을 때에도 앉은 자국이 남아 있고, 그 자리는 늘 따뜻하다.',
    '앉았던 사람은 한동안 자기 것이 아닌 기억을 갖게 된다.',
  ],
  manual: [
    '의자에는 앉지 않는다.',
    '근무일지는 의자를 등지고 쓰지 않는다.',
    '(이하 내용은 누군가 지워 놓았다.)',
  ],
  closing: {
    cleared: [
      '의자는 제자리에 놓였다. 앉은 자국은 이제 식어 있었다.',
      '의자의 자국이 식었다. 근무일지는 의자를 등지지 않고 마지막 줄까지 썼다.',
    ],
    failed: '의자는 여전히 따뜻했다. 일지에 적은 기억 몇 줄이 내 것이 아닌 것 같았다.',
    demoted: '앉지 말라는 규정이 있었다. 의자는 내가 앉은 자리를 아직 기억하고 있었다.',
  },
  stages: [
    {
      id: 's1',
      title: '새벽의 휴게실',
      years: 1,
      text: '야간 근무 중 휴게실 불이 저절로 켜졌다. 의자가 조금 뒤로 밀려 나와 있고, 앉은 자국에서 김이 오른다. 일지를 쓰려면 의자 쪽 책상을 써야 한다.',
      choices: [
        {
          id: 'turn-away',
          text: '의자를 벽 쪽으로 돌려놓고, 다른 방에서 일지를 쓴다',
          story: '의자 다리가 바닥에 끌리며 휴게실에 낮은 소리가 길게 울렸다. 의자를 벽 쪽으로 밀어붙이고, 반대편 방의 책상에 일지를 펼쳤다.',
          risk: 1,
          baseChance: 0.82,
          statWeights: { sanity: 0.002 },
          success: {
            text: '의자는 얌전했다. 일지는 무사히 끝났고, 등 뒤의 온기도 서서히 식었다.',
            effects: { reputation: 3 },
          },
          failure: {
            kind: 'setback',
            text: '일지를 쓰는 내내 등 뒤에서 의자 끌리는 소리가 났다. 끝내 돌아보지 못했다.',
            effects: { sanity: -8 },
          },
        },
        {
          id: 'record-warmth',
          text: '의자 옆에 서서 앉은 자국의 온기를 기록한다',
          story: '의자 옆에 서서 온도계를 앉은 자국에 가져다 댔다. 눈금이 천천히 오르는 동안 등받이의 낡은 나뭇결이 눈에 들어왔다.',
          risk: 2,
          baseChance: 0.62,
          statWeights: { knowledge: 0.005, sanity: 0.002 },
          success: {
            text: '온도는 36.4도. 방금 일어난 사람의 체온이다. 기록을 남기자 의자가 천천히 식었다.',
            effects: { knowledge: 5, reputation: 4 },
          },
          failure: {
            kind: 'setback',
            text: '온기가 손끝을 타고 올라왔다. 한동안 모르는 사람의 이름이 입가에 맴돌았다.',
            effects: { sanity: -12 },
          },
        },
        {
          id: 'sit',
          text: '의자에 앉아 “그 사람”이 누구인지 확인한다',
          story: '의자 앞에 한참 서 있었다. 숨을 한 번 고르고, 앉은 자국이 남은 자리에 조심스럽게 몸을 내렸다.',
          risk: 4,
          baseChance: 0.3,
          statWeights: { sanity: 0.005, knowledge: 0.003 },
          success: {
            text: '눈을 떴을 때 당신은 이미 일어나 있었다. 손에는 모르는 사람의 사원증이 들려 있었다. 사진 속 얼굴은 당신이었다.',
            effects: { knowledge: 12, reputation: 10, sanity: -5 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '의자는 당신을 기억했다. 다음 날 아침, 휴게실의 의자는 비어 있었고 아직 따뜻했다.',
          },
        },
      ],
    },
    {
      id: 's2',
      title: '지워진 문장',
      years: 1,
      text: '매뉴얼의 마지막 줄은 누군가 지워 놓았다. 지우개 자국은 아직 선명하다.',
      choices: [
        {
          id: 'report',
          text: '지워진 줄이 있다는 사실만 상급자에게 보고한다',
          story: '매뉴얼을 들고 상급자의 사무실 앞에 섰다. 지워진 줄에 대해 어떻게 말할지 몇 번이나 고쳐 말해 보았다.',
          risk: 1,
          baseChance: 0.85,
          statWeights: { reputation: 0.002 },
          success: {
            text: '상급자는 말없이 고개를 끄덕였다. “그 줄은 지워진 채로 두는 게 맞아.”',
            effects: { reputation: 4 },
          },
          failure: {
            kind: 'setback',
            text: '보고서가 반려되었다. “이미 알고 있는 것을 왜 적었나.”',
            effects: { reputation: -4 },
          },
        },
        {
          id: 'restore',
          text: '연필로 문질러 지워진 문장을 복원한다',
          story: '연필을 눕혀 지워진 줄 위를 가볍게 문질렀다. 흑연 가루가 쌓이는 자리에서 희미한 글자의 윤곽이 올라오기 시작했다.',
          risk: 2,
          baseChance: 0.6,
          statWeights: { knowledge: 0.005 },
          success: {
            text: '“의자가 비어 있다고 믿지 말 것.” 복원된 문장을 읽은 순간, 휴게실의 의자들이 조금 가까워진 느낌이 들었다.',
            effects: { knowledge: 8, sanity: -3 },
          },
          failure: {
            kind: 'setback',
            text: '문질러 낸 문장은 읽히지 않았다. 대신 종이가 따뜻해졌다.',
            effects: { sanity: -9 },
          },
        },
        {
          id: 'look-under',
          text: '허가 없이 의자 밑을 들여다본다',
          story: '복도에 아무도 없는 것을 확인하고 의자 앞에 무릎을 꿇었다. 손전등 불빛이 의자 다리 사이의 어둠으로 천천히 들어갔다.',
          risk: 3,
          baseChance: 0.42,
          statWeights: { sanity: 0.004, knowledge: 0.003 },
          success: {
            text: '의자 밑에는 아무것도 없었다. 그것이 오히려 가장 오래 쳐다본 이유였다. 기록에는 “이상 없음”이라고 적었다.',
            effects: { knowledge: 12, reputation: 8 },
            finish: true,
          },
          failure: {
            kind: 'demotion',
            text: '무단 접근이 감지되었다. 당신은 시말서를 썼고, 의자는 그동안에도 따뜻했다.',
            effects: { reputation: -10 },
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
