import type { ContainmentObject } from '../../engine/types'

export default {
  id: 'x-007',
  code: 'X-007',
  name: '심연의 합창단',
  tier: 4,
  summary: '지하 공동에서 들려오는 가사 없는 합창. 음이 이어질수록 듣는 이의 이름이 비어 간다.',
  observation: [
    '지하 7층 공동에서 합창이 들린다. 가사는 없다.',
    '음이 이어질수록 듣는 사람의 이름이 한 글자씩 비어 간다.',
    '합창단의 모습을 본 기록은 없다. 악보를 본 기록은 있다. 악보는 읽는 사람마다 다른 곡이다.',
  ],
  manual: [
    '귀마개는 두 겹 이상 착용한다.',
    '합창을 따라 흥얼거리지 않는다.',
    '악보를 처음부터 끝까지 읽지 않는다.',
  ],
  failureTolerance: 1,
  closing: {
    cleared: '합창이 끝났다. 마지막 음이 사라진 뒤에도 내 이름이 제자리에 있는지 한참 확인했다.',
    failed: '합창은 그치지 않았다. 일지에서 이름이 적힌 칸이 몇 개 비어 있었다.',
    demoted: '따라 부르지 말라는 규정이 있었다. 기록에는 내 목소리가 한 소절 남아 있었다.',
  },
  stages: [
    {
      id: 's1',
      title: '공동의 입구',
      years: 1,
      text: '지하 7층 공동 입구. 두 겹의 귀마개를 뚫고도 낮은 화음이 뼈로 전해진다. 오늘의 임무는 입구 경계 점검이다.',
      choices: [
        {
          id: 'earplugs',
          text: '귀마개를 한 겹 더 끼고 입구에서만 점검한다',
          story: '귀마개를 한 겹 더 끼우고 입구 난간을 짚었다. 점검표를 한 줄씩 채우는 동안 화음이 발바닥을 타고 올라왔다.',
          risk: 1,
          baseChance: 0.75,
          statWeights: { sanity: 0.003, health: 0.002 },
          success: {
            text: '합창은 멀리서 들렸다. 점검을 마치고 올라오는 계단에서 비로소 자기 이름이 온전한지 확인했다.',
            effects: { reputation: 4 },
          },
          failure: {
            kind: 'setback',
            text: '점검 후 서명란에 이름을 쓰는데, 두 번째 글자가 떠오르지 않았다. 한참 뒤에야 돌아왔다.',
            effects: { sanity: -11 },
          },
        },
        {
          id: 'cancel-wave',
          text: '역위상 소음을 틀어 합창을 상쇄해 본다',
          story: '입구에 스피커를 세우고 반대 위상의 소음을 틀었다. 두 소리가 겹치는 지점에서 공기가 얇게 떨렸다.',
          risk: 2,
          baseChance: 0.58,
          statWeights: { knowledge: 0.006 },
          success: {
            text: '소음 속에서 합창의 음정이 흐트러졌다. 합창단은 방해받는 것을 알아차리지 못했다. 혹은 신경 쓰지 않았다.',
            effects: { knowledge: 9, reputation: 5 },
          },
          failure: {
            kind: 'setback',
            text: '상쇄음이 합창과 겹치자 새로운 화음이 만들어졌다. 그 화음은 당신이 아는 노래였다.',
            effects: { sanity: -12 },
          },
        },
        {
          id: 'descend',
          text: '공동 안쪽으로 한 층 더 내려간다',
          story: '철제 계단의 첫 단에 발을 올렸다. 아래로 내려갈수록 합창이 귀가 아니라 가슴뼈 안쪽에서 울렸다.',
          risk: 4,
          baseChance: 0.3,
          statWeights: { sanity: 0.005, health: 0.003 },
          success: {
            text: '합창단은 거기 없었다. 있는 것은 거대한 공동의 벽, 그리고 벽에 새겨진 수많은 입이었다. 모든 입이 같은 박자로 열렸다 닫혔다.',
            effects: { knowledge: 14, reputation: 12, sanity: -8 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '일곱 번째 계단을 내려서는 순간 합창이 멈췄다. 다음 날 점검 일지에는 당신의 이름이 한 글자도 남아 있지 않았다.',
          },
        },
      ],
    },
    {
      id: 's2',
      title: '악보',
      years: 1,
      text: '입구에서 악보 한 장이 발견되었다. 첫 줄을 읽은 선임은 지금 의자에 앉아 조용히 허밍을 하고 있다. 아무도 그를 말리지 못한다.',
      choices: [
        {
          id: 'blindfold-reader',
          text: '악보는 읽지 말고 선임의 허밍을 녹음해 분석한다',
          story: '선임에게 악보를 맡기고 녹음기만 쥐고 곁에 앉았다. 선임이 허밍을 시작하자 방이 한 음 낮아졌다.',
          risk: 1,
          baseChance: 0.72,
          statWeights: { knowledge: 0.003, reputation: 0.003 },
          success: {
            text: '녹음에는 합창의 한 파트가 깨끗이 담겼다. 선임은 분석이 끝나자 허밍을 멈췄다.',
            effects: { knowledge: 6, reputation: 6 },
          },
          failure: {
            kind: 'setback',
            text: '녹음을 재생하자 허밍이 한 명 늘어 있었다. 당신의 목소리였다.',
            effects: { sanity: -12 },
          },
        },
        {
          id: 'read-last-bar',
          text: '악보의 마지막 마디만 읽는다',
          story: '악보를 맨 뒤로 넘겨 마지막 마디에 손가락을 올렸다. 눈으로 한 음씩 짚으며 소리 내지 않고 입술만 움직였다.',
          risk: 3,
          baseChance: 0.42,
          statWeights: { sanity: 0.004, knowledge: 0.004 },
          success: {
            text: '마지막 마디는 쉼표였다. 합창은 그 쉼표를 위해 존재한다. 쉼표를 지키는 순간 선임이 눈을 떴다.',
            effects: { knowledge: 11, reputation: 8, sanity: -5 },
          },
          failure: {
            kind: 'demotion',
            text: '악보를 읽은 당신은 사흘 동안 말을 하지 못했다. 징계위원회는 이를 “무단 열람”으로 처리했다.',
            effects: { reputation: -12, sanity: -10 },
          },
        },
        {
          id: 'conduct',
          text: '악보를 들고 공동으로 내려가 직접 지휘해 본다',
          story: '악보를 가슴에 안고 공동 한가운데로 걸어 내려갔다. 지휘봉 대신 오른손을 천천히 들어 올렸다.',
          risk: 5,
          baseChance: 0.2,
          statWeights: { sanity: 0.006, knowledge: 0.004 },
          success: {
            text: '당신이 손을 들자 합창이 멈췄다. 정적 속에서 수천 개의 입이 당신을 향해 열렸다. 그들은 노래하려는 것이 아니라 당신에게 이름을 묻고 있었다.',
            effects: { knowledge: 15, reputation: 15, sanity: -12 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '공동으로 내려간 당신의 발소리는 일곱 걸음 만에 사라졌다. 합창에는 새로운 파트가 하나 더해졌다.',
          },
        },
      ],
    },
    {
      id: 's3',
      title: '이름이 빈 사람',
      years: 1,
      text: '당신의 팀원 한 명이 자기 이름을 완전히 잃었다. 사원증을 보여 줘도 읽지 못한다. 합창이 그에게 가까워지고 있다.',
      choices: [
        {
          id: 'give-nickname',
          text: '임시 별명을 붙여 부르며 사무실에 격리한다',
          story: '이름을 잃어 가는 팀원에게 새 별명을 지어 불렀다. 사무실의 불을 끄고 팀원 곁에 의자를 끌어다 앉았다.',
          risk: 1,
          baseChance: 0.7,
          statWeights: { reputation: 0.004, sanity: 0.002 },
          success: {
            text: '팀원은 새 이름에 대답했다. 합창은 그 이름을 알지 못해 멀어졌다.',
            effects: { reputation: 6, knowledge: 3 },
          },
          failure: {
            kind: 'setback',
            text: '별명을 부르자 팀원이 문득 합창의 한 구절을 따라 불렀다. 별명이 그 구절과 같았다.',
            effects: { sanity: -12 },
          },
        },
        {
          id: 'return-name',
          text: '팀원의 이름을 대신 외쳐 합창에 돌려보낸다',
          story: '합창이 들리는 입구까지 팀원을 부축해 갔다. 팀원의 이름을 소리 내어 부를 숨을 크게 들이마셨다.',
          risk: 3,
          baseChance: 0.42,
          statWeights: { sanity: 0.005, knowledge: 0.003 },
          success: {
            text: '이름이 공동으로 흘러들었다. 합창은 한 박자 쉬고 이어졌다. 팀원은 눈을 깜빡이며 자기 이름을 되찾았다. 대신 당신의 이름 한 글자가 흐려졌다.',
            effects: { knowledge: 10, reputation: 9, sanity: -9 },
          },
          failure: {
            kind: 'demotion',
            text: '이름은 돌아가지 않았다. 팀원은 사라졌고, 상부는 “보호 의무 위반”을 당신에게 물었다.',
            effects: { reputation: -14, sanity: -8 },
          },
        },
        {
          id: 'trade-places',
          text: '합창에 당신 이름을 대신 내어주고 팀원을 살린다',
          story: '팀원을 뒤로 물리고 합창 앞에 섰다. 내 이름의 글자 하나하나를 입안에서 굴려 보았다.',
          risk: 5,
          baseChance: 0.22,
          statWeights: { sanity: 0.006 },
          success: {
            text: '합창은 당신의 이름을 가져가고 팀원을 놓았다. 이튿날 모두가 당신을 처음 보는 사람처럼 대했다. 그러나 당신은 아직 자리에 앉아 일하고 있다.',
            effects: { knowledge: 14, reputation: 16, sanity: -14 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '합창은 두 이름을 모두 가져갔다. 사무실에는 사원증 두 장과 아직 따뜻한 의자 두 개가 남았다.',
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
