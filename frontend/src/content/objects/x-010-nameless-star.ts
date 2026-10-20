import type { ContainmentObject } from '../../engine/types'

export default {
  id: 'x-010',
  code: 'X-010',
  name: '이름 없는 별',
  tier: 5,
  summary: '본관 지붕 틈으로 보이는 별 하나. 오래 본 사람은 자신이 별에게 관찰되고 있음을 깨닫는다.',
  observation: [
    '본관 최상층 지붕의 틈 사이로 보이는 별 하나. 어떤 별자리에도 속하지 않는다.',
    '별을 오래 본 직원은 어느 날 자신이 별에게 관찰되고 있다는 사실을 깨닫는다.',
    '별은 이름이 없다. 이름을 붙이려는 시도는 모두 기록에서 사라졌다.',
  ],
  manual: [
    '별을 이름으로 부르지 않는다.',
    '관찰은 한 번에 7분을 넘기지 않는다.',
    '(이후의 페이지는 찢겨 있다.)',
  ],
  failureTolerance: 1,
  closing: {
    cleared: '지붕 틈의 별이 시야에서 멀어졌다. 한동안 누구도 나를 보고 있지 않았다.',
    failed: '별은 그대로였고 나는 보고서에 별을 보았다고 적었다. 별도 나를 보았다고 적었을 것이다.',
    demoted: '오래 올려다보지 말라는 규정이 있었다. 그날부터 일지를 쓸 때마다 별에게 읽히는 느낌이 들었다.',
  },
  stages: [
    {
      id: 's1',
      title: '첫 관측',
      years: 2,
      text: '최상층 관측실. 천장의 틈 사이로 이름 없는 별이 보인다. 7분이 지나기 전에 눈을 떼야 한다. 그런데 당신은 7분이 어느 정도의 길이인지 이미 잘 기억나지 않는다.',
      choices: [
        {
          id: 'timer-observe',
          text: '타이머를 걸고 정확히 7분씩 나눠서 관측한다',
          risk: 1,
          baseChance: 0.72,
          statWeights: { sanity: 0.003, knowledge: 0.003 },
          success: {
            text: '타이머가 울릴 때마다 별은 눈을 돌린 것처럼 보였다. 두 해 동안 기록된 데이터는 체계적이었다.',
            effects: { knowledge: 8, reputation: 7 },
          },
          failure: {
            kind: 'setback',
            text: '타이머가 울렸지만 당신은 눈을 떼지 못했다. 정신을 차렸을 때 관측실의 해는 두 번 바뀌어 있었다.',
            effects: { sanity: -14 },
          },
        },
        {
          id: 'mirror-observe',
          text: '거울을 이용해 반사된 별을 간접적으로 관측한다',
          risk: 3,
          baseChance: 0.5,
          statWeights: { knowledge: 0.006 },
          success: {
            text: '거울 속의 별은 하나가 아니라 둘이었다. 하나는 하늘을 향하고, 하나는 이쪽을 향해 있었다.',
            effects: { knowledge: 12, reputation: 8, sanity: -4 },
          },
          failure: {
            kind: 'setback',
            text: '거울 속의 별이 당신의 눈과 마주쳤다. 그 순간부터 당신은 혼자 있는 방에서도 시선을 느꼈다.',
            effects: { sanity: -15 },
          },
        },
        {
          id: 'stare-long',
          text: '시간제한을 무시하고 별을 오래 응시한다',
          risk: 5,
          baseChance: 0.22,
          statWeights: { sanity: 0.006, knowledge: 0.004 },
          success: {
            text: '별은 당신을 읽고 있었다. 당신도 별을 읽었다. 서로의 이름을 알지 못한 채, 서로의 이야기를 끝까지 들었다. 별은 천천히 눈을 감았다.',
            effects: { knowledge: 16, reputation: 20, sanity: -12 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '당신은 관측실 의자에 앉은 채로 발견되었다. 눈은 뜬 채였고, 동공 안쪽에 작은 점 하나가 고요히 빛났다.',
          },
        },
      ],
    },
    {
      id: 's2',
      title: '시선',
      years: 1,
      text: '관측실에 들어오는 직원마다 같은 증상을 호소한다. 누가 자신을 보고 있다는 것. 별을 보지 않아도 그 시선은 따라온다.',
      choices: [
        {
          id: 'rotate-observers',
          text: '관측 인원을 매일 교체하고 한 사람이 별을 두 번 보지 않게 한다',
          risk: 1,
          baseChance: 0.68,
          statWeights: { reputation: 0.004, knowledge: 0.003 },
          success: {
            text: '시선은 교체되는 사람마다 첫 번째에는 약했고 두 번째에는 강했다. 교체 방식은 그럭저럭 효과가 있었다.',
            effects: { reputation: 7, knowledge: 4 },
          },
          failure: {
            kind: 'setback',
            text: '교체된 직원이 첫날 퇴근 후 돌아오지 않았다. 별은 이름을 기억하지 못하는데도 그 사람만은 기억했다.',
            effects: { sanity: -12, reputation: -3 },
          },
        },
        {
          id: 'blindfold-test',
          text: '눈가리개를 한 상태에서도 시선이 느껴지는지 실험한다',
          risk: 3,
          baseChance: 0.48,
          statWeights: { sanity: 0.004, knowledge: 0.005 },
          success: {
            text: '눈을 가려도 시선은 느껴졌다. 그러나 눈가리개를 쓴 사람만이 시선의 방향이 별이 아니라 자신의 안쪽이라는 것을 알아챘다.',
            effects: { knowledge: 12, reputation: 9, sanity: -6 },
          },
          failure: {
            kind: 'demotion',
            text: '실험 참가자 세 명이 눈가리개를 벗지 못했다. 위원회는 실험 승인 절차를 문제 삼았다.',
            effects: { reputation: -14, sanity: -9 },
          },
        },
        {
          id: 'look-back',
          text: '별이 있는 쪽을 향해 시선을 되돌려 보낸다',
          risk: 5,
          baseChance: 0.22,
          statWeights: { sanity: 0.006 },
          success: {
            text: '당신이 시선을 되돌리자 별은 처음으로 흔들렸다. 그 순간 방 안의 모든 사람의 그림자가 일제히 바닥에서 떨어져 나와 위쪽으로 길게 늘어졌다.',
            effects: { knowledge: 15, reputation: 18, sanity: -12 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '당신의 그림자만 남았다. 사람은 사라졌고, 바닥에는 한참 동안 그림자가 서 있었다.',
          },
        },
      ],
    },
    {
      id: 's3',
      title: '이름',
      years: 2,
      text: '선임 연구원이 별에게 이름을 붙이자고 제안한다. “이름을 붙이면 관리가 쉬워질 겁니다.” 지난 이름 붙이기 시도는 모두 기록에서 사라졌다는 사실을 아는 사람은 이제 당신뿐이다.',
      choices: [
        {
          id: 'refuse-naming',
          text: '이름 붙이기를 거부하고 공식 반대 의견서를 제출한다',
          risk: 1,
          baseChance: 0.66,
          statWeights: { reputation: 0.005, knowledge: 0.003 },
          success: {
            text: '의견서는 승인되었다. 선임은 불만스러운 얼굴이었지만 이름 붙이기는 보류되었다. 별은 두 해 동안 조용했다.',
            effects: { reputation: 8, knowledge: 5 },
          },
          failure: {
            kind: 'setback',
            text: '의견서는 반려되었다. 선임은 당신 몰래 별에게 이름을 지어 주었다. 그 이름이 무엇인지는 이튿날 아무도 기억하지 못했다.',
            effects: { reputation: -6, sanity: -13 },
          },
        },
        {
          id: 'false-name',
          text: '가짜 이름을 붙여 별이 어떻게 반응하는지 본다',
          risk: 3,
          baseChance: 0.45,
          statWeights: { knowledge: 0.006, sanity: 0.003 },
          success: {
            text: '별은 가짜 이름에 반응하지 않았다. 대신 그 이름을 지은 사람의 얼굴을 한동안 응시했다. 가짜 이름은 지어진 지 하루 만에 어디에도 남지 않았다.',
            effects: { knowledge: 12, reputation: 10, sanity: -6 },
          },
          failure: {
            kind: 'demotion',
            text: '가짜 이름이 진짜 이름처럼 기록되었다. 별은 그 이름에 대답했다. 상부는 이를 사고로 분류하고 당신을 처분했다.',
            effects: { reputation: -15, sanity: -10 },
          },
        },
        {
          id: 'be-named',
          text: '별에게 자신의 이름을 대신 내어준다',
          risk: 5,
          baseChance: 0.2,
          statWeights: { sanity: 0.007, knowledge: 0.004 },
          success: {
            text: '별은 당신의 이름을 받아 갔다. 당신은 아무것도 잃지 않았다. 다만 그날 밤부터 하늘의 별이 하나 줄어 있었다.',
            effects: { knowledge: 16, reputation: 20, sanity: -14 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '별은 이름을 받자 당신을 더 이상 볼 필요가 없었다. 관측실의 불이 꺼졌고, 이튿날 당신의 책상은 처음부터 비어 있던 것처럼 깨끗했다.',
          },
        },
      ],
    },
    {
      id: 's4',
      title: '마지막 페이지',
      years: 1,
      text: '매뉴얼의 찢겨 나간 페이지가 누군가의 책상 서랍에서 발견되었다. 그 페이지에는 한 줄만 남아 있다. 필체는 당신의 것이다.',
      choices: [
        {
          id: 'burn-page',
          text: '페이지를 읽지 않고 태워 버린다',
          risk: 1,
          baseChance: 0.7,
          statWeights: { sanity: 0.003, reputation: 0.003 },
          success: {
            text: '타는 종이에서 푸른 불꽃이 올랐다. 별은 그 순간 한 번 깜빡였다. 그뿐이었다.',
            effects: { reputation: 9, sanity: 3 },
          },
          failure: {
            kind: 'setback',
            text: '종이는 타지 않았다. 대신 당신이 그것을 읽었다고 별이 알게 된 것 같았다.',
            effects: { sanity: -15 },
          },
        },
        {
          id: 'read-page',
          text: '페이지를 읽고 그 내용을 공식 기록으로 남긴다',
          risk: 3,
          baseChance: 0.45,
          statWeights: { knowledge: 0.006, sanity: 0.004 },
          success: {
            text: '“관측자는 관측되는 자다.” 그 한 줄이 전부였다. 당신은 그것을 기록했고, 기록은 한 번도 사라지지 않았다.',
            effects: { knowledge: 14, reputation: 12, sanity: -7 },
          },
          failure: {
            kind: 'demotion',
            text: '한 줄을 읽는 순간 당신은 자신이 누구였는지 사흘 동안 기억하지 못했다. 위원회는 당신에게 보직 해임을 통보했다.',
            effects: { reputation: -16, sanity: -12 },
          },
        },
        {
          id: 'write-reply',
          text: '그 페이지의 빈 곳에 답장을 적는다',
          risk: 5,
          baseChance: 0.22,
          statWeights: { sanity: 0.007, knowledge: 0.005 },
          success: {
            text: '당신이 적은 문장은 지붕의 틈을 지나 별에게 닿았다. 별은 한참 침묵하다가, 처음으로 조용히 당신의 이름을 불렀다. 그 이름은 당신이 오래전에 잃어버린 이름이었다.',
            effects: { knowledge: 18, reputation: 22, sanity: -12 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '답장은 끝내 쓰이지 않았다. 마지막 페이지에는 두 사람의 필체가 번갈아 적혀 있었고, 마지막 문장만 당신의 것이 아니었다.',
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
