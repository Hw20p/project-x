import type { ContainmentObject } from '../../engine/types'

export default {
  id: 'x-009',
  code: 'X-009',
  name: '눈 뜬 새벽',
  tier: 5,
  summary: '새벽 4시 17분에서 멈춘 구역. 안에서의 하루는 바깥의 한 시간보다 길다.',
  observation: [
    '동관 3구역. 새벽 4시 17분에서 시간이 멈춘 구역.',
    '구역 안에서의 하루는 바깥의 한 시간에 해당하지만, 안에서 보내는 사람은 열흘을 산다.',
    '구역에서 나온 사람은 늙어 있다. 본인은 아무것도 알아채지 못한다.',
  ],
  manual: [
    '구역에는 시계를 가져가지 않는다.',
    '구역 안에서 잠들지 않는다.',
    '나올 때는 입구의 사진과 자신의 얼굴을 비교한다.',
  ],
  failureTolerance: 1,
  closing: {
    cleared: '구역을 나오니 새벽이 아니었다. 시계는 4시 17분을 가리킨 채 한참 뒤에야 움직였다.',
    failed: '구역 안의 하루가 끝나지 않았다. 바깥에서는 겨우 한 시간이 지났다고 했다.',
    demoted: '새벽에 눈을 뜨지 말라는 규정이 있었다. 내가 본 것은 시계가 아니라 시계를 보는 눈이었다.',
  },
  stages: [
    {
      id: 's1',
      title: '입장',
      years: 2,
      text: '동관 3구역의 문이 열렸다. 문틈 너머의 복도에는 새벽빛이 고여 있다. 당신은 이 구역을 확인할 수 있는 직급이 되었고, 그 대가로 시간을 내어주어야 한다.',
      choices: [
        {
          id: 'rope-and-sign',
          text: '허리에 밧줄을 묶고 정해진 시각마다 신호를 보내며 들어간다',
          story: '허리에 밧줄을 두 번 감고 매듭을 확인했다. 정해진 시각마다 신호를 보내기로 약속하고 구역에 들어섰다.',
          risk: 2,
          baseChance: 0.65,
          statWeights: { health: 0.003, knowledge: 0.003, sanity: 0.002 },
          success: {
            text: '신호는 거의 정확히 도착했다. 구역 안의 열흘이 바깥의 한 시간처럼 지나갔다. 이 방식으로 우리는 구역을 지도로 만들었다.',
            effects: { knowledge: 9, reputation: 8, health: -4 },
          },
          failure: {
            kind: 'setback',
            text: '신호가 한 번 끊겼다. 돌아온 당신의 머리카락은 희끗했다. 아무도 처음엔 알아보지 못했다.',
            effects: { health: -14, sanity: -8 },
          },
        },
        {
          id: 'leave-camera',
          text: '자동 촬영 장비만 들여보내고 기록을 회수한다',
          story: '자동 촬영 장비를 구역 입구에 세워 두고 타이머를 맞췄다. 장비가 안으로 굴러 들어가는 것을 문밖에서 지켜보았다.',
          risk: 3,
          baseChance: 0.5,
          statWeights: { knowledge: 0.005 },
          success: {
            text: '장비는 구역에서 열흘을 보냈다. 촬영된 영상에는 복도 끝에서 매일 같은 시각 한 사람이 걸어 나왔다. 영상 속 인물은 우리 직원이었다.',
            effects: { knowledge: 11, reputation: 8 },
          },
          failure: {
            kind: 'setback',
            text: '회수한 장비는 열화되어 있었다. 마지막 화면에는 카메라를 향해 걸어오는 그림자가 담겨 있었다.',
            effects: { sanity: -14 },
          },
        },
        {
          id: 'enter-sleepless',
          text: '각성제를 복용하고 구역 깊숙이 직접 들어간다',
          story: '각성제를 물과 함께 삼키고 손목시계를 풀어 주머니에 넣었다. 구역 안쪽으로 한 걸음씩 시간을 세며 들어갔다.',
          risk: 5,
          baseChance: 0.22,
          statWeights: { health: 0.006, sanity: 0.005 },
          success: {
            text: '당신은 이레를 눈을 뜬 채로 걸었다. 새벽빛의 원천은 천장 한구석에 박힌 눈동자였다. 그것은 당신을 한 번 바라보고, 천천히 감겼다. 구역의 시계가 움직이기 시작했다.',
            effects: { knowledge: 16, reputation: 20, health: -18, sanity: -12 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '당신은 4시 17분에 멈춘 구역의 첫 번째 직원이 되었다. 복도 끝에서 매일 같은 시각 한 사람이 걸어 나온다. 이제는 당신이다.',
          },
        },
      ],
    },
    {
      id: 's2',
      title: '정체',
      years: 2,
      text: '구역 안에서 보낸 시간이 쌓일수록 바깥의 동료들이 하나둘 퇴직하거나 승진한다. 당신은 구역에서의 하루하루를 숫자로만 기억한다. 일지에는 구역 내부 시간이 적혀 있다. 누군가 그 숫자들을 바꿨다.',
      choices: [
        {
          id: 'restore-log',
          text: '구역 외부 시계와 일지를 대조하며 숫자를 복원한다',
          story: '구역 밖 벽시계와 일지를 나란히 펼쳐 놓았다. 어긋난 숫자를 하나씩 짚어 바로잡으며 시간을 맞춰 나갔다.',
          risk: 2,
          baseChance: 0.62,
          statWeights: { knowledge: 0.005, reputation: 0.003 },
          success: {
            text: '복원된 숫자는 일정한 규칙을 따랐다. 구역은 시간을 멈춘 것이 아니라 한 사람씩 번갈아 훔치고 있었다.',
            effects: { knowledge: 10, reputation: 9 },
          },
          failure: {
            kind: 'setback',
            text: '숫자를 복원하자 일지의 마지막 날짜가 당신의 사망 예정일 근처에 닿아 있었다.',
            effects: { sanity: -13, health: -6 },
          },
        },
        {
          id: 'rotate-staff',
          text: '구역 근무자를 교대로 돌려 한 사람이 오래 머물지 않게 한다',
          story: '근무표를 새로 짜서 한 사람이 구역에 머무는 시간을 반으로 줄였다. 교대 시각마다 문 앞에서 이름을 확인했다.',
          risk: 3,
          baseChance: 0.5,
          statWeights: { reputation: 0.006, sanity: 0.003 },
          success: {
            text: '교대 체계가 자리 잡자 구역의 시간 도둑질이 분산되었다. 아무도 한꺼번에 늙지 않았다.',
            effects: { knowledge: 8, reputation: 12 },
          },
          failure: {
            kind: 'demotion',
            text: '교대 인원이 돌아오지 않았다. 구역은 새로운 사람이 들어올 때마다 더 오래 머물렀다. 책임은 당신에게 돌아갔다.',
            effects: { reputation: -15, sanity: -8 },
          },
        },
        {
          id: 'stay-and-count',
          text: '구역에 머물며 직접 시간의 흐름을 끝까지 세어 본다',
          story: '구역 한가운데에 의자를 놓고 앉았다. 초침 소리를 헤아리며 숫자를 입속으로 소리 없이 셌다.',
          risk: 5,
          baseChance: 0.2,
          statWeights: { sanity: 0.006, health: 0.005 },
          success: {
            text: '당신은 만 하루를 센 뒤에야 비로소 새벽이 끝나는 순간을 보았다. 4시 18분이 되자 구역의 모든 문이 열렸고, 모든 시계가 일제히 멈췄다가 다시 흘렀다.',
            effects: { knowledge: 16, reputation: 20, health: -16, sanity: -10 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '당신은 세는 것을 멈추지 못했다. 구역의 문이 닫혔을 때 안에서는 여전히 누군가 숫자를 세고 있었다.',
          },
        },
      ],
    },
    {
      id: 's3',
      title: '출구',
      years: 1,
      text: '출구는 입구와 똑같이 생겼다. 입구 사진과 대조해 보니 사진 속 당신과 거울 속 당신이 다른 사람이다. 어느 쪽이 나간 사람인지 확신할 수 없다.',
      choices: [
        {
          id: 'compare-photo',
          text: '입구 사진과 자신의 얼굴을 비교하고 가족에게 확인을 요청한다',
          story: '입구에 걸린 사진을 떼어 와 거울 옆에 세웠다. 가족에게 전화를 걸어 사진 속 얼굴이 맞는지 물어볼 말을 골랐다.',
          risk: 1,
          baseChance: 0.7,
          statWeights: { reputation: 0.003, sanity: 0.003 },
          success: {
            text: '가족은 당신을 알아보았다. 조금 늦게, 그러나 확실하게. 당신은 구역에서 나온 것이 맞다.',
            effects: { reputation: 8, sanity: 4 },
          },
          failure: {
            kind: 'setback',
            text: '가족은 당신을 보며 한참 머뭇거렸다. “아버지가 아니라 그분의 동생 같아요.”',
            effects: { sanity: -14, health: -4 },
          },
        },
        {
          id: 'seal-exit',
          text: '출구를 봉인해 구역 자체를 격리한다',
          story: '출구에 철문을 내리고 용접 장비를 챙겼다. 불꽃이 틈새를 따라 천천히 이어 붙는 동안 문 너머가 조용했다.',
          risk: 3,
          baseChance: 0.48,
          statWeights: { knowledge: 0.005, reputation: 0.003 },
          success: {
            text: '문은 완전히 닫혔다. 이후 구역 안에서 사람의 흔적은 감지되지 않았다. 새벽은 그 안에서 계속된다.',
            effects: { knowledge: 12, reputation: 12 },
          },
          failure: {
            kind: 'demotion',
            text: '봉인 직후 구역 안에서 두드리는 소리가 들렸다. 상부는 봉인 절차의 부실함을 이유로 당신을 문책했다.',
            effects: { reputation: -14, sanity: -10 },
          },
        },
        {
          id: 'walk-twice',
          text: '출구를 두 번 지나 나온 쪽이 어느 쪽인지 확인한다',
          story: '출구를 한 번 지나 돌아온 뒤 다시 한 번 걸어갔다. 두 번째에 문턱을 넘을 때 발끝으로 바닥의 방향을 확인했다.',
          risk: 5,
          baseChance: 0.2,
          statWeights: { sanity: 0.006, knowledge: 0.005 },
          success: {
            text: '두 번째로 나왔을 때, 입구 쪽에서 당신과 똑같은 사람이 손을 흔들고 있었다. 그는 오래 웃다가 천천히 새벽 속으로 걸어 들어갔다.',
            effects: { knowledge: 16, reputation: 20, sanity: -10 },
            finish: true,
          },
          failure: {
            kind: 'death',
            text: '당신은 두 번 모두 입구로 나왔다. 구역 밖의 사람들은 당신이 처음부터 들어간 적이 없다고 말했다.',
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
