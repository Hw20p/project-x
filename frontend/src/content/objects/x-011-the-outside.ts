import type { ContainmentObject } from '../../engine/types'

// 최종 객체. 5급 일반 객체를 모두 성공한 수석에게 배정되며, 마지막 선택이 성공하면 엔딩(content/endings.ts)으로 판이 끝난다.
export default {
  id: 'x-011',
  code: 'X-011',
  name: '바깥',
  tier: 5,
  finale: true,
  summary: '가장 깊은 층의 문 하나. 시설이 가둬 온 것이 아니라, 시설이 가려 온 것이 그 너머에 있다.',
  intro: '수석의 사원증이 처음으로 마지막 층 버튼에 응답했다. 엘리베이터는 이름 없는 층에서 멈췄고, 복도 끝에는 문 하나뿐이었다.',
  observation: [
    '지하 최하층, 문 하나. 손잡이는 바깥쪽에만 달려 있다.',
    '시설의 모든 객체는 이 문에서 가까운 순서대로 발견되었다.',
    '문 너머를 본 사람의 기록이 있다. 그 기록을 읽은 사람의 기록도 있다. 모두 같은 문장으로 시작한다. “저는 처음부터 알고 있었습니다.”',
  ],
  manual: [
    '문을 열기 전에, 지금까지 관리한 모든 객체의 기록을 다시 읽는다.',
    '문은 안쪽에서 열 수 없다. 바깥쪽 손잡이를 쥘 수 있었던 사람은 지금까지 한 명뿐이다.',
    '(작성자 서명란은 비어 있다. 수석 관리자의 사번만 적혀 있다.)',
  ],
  // 최종 객체는 실패를 허용하지 않는다: 엔딩 선택이 실패하면 "관리 실패"로 끝나고, 나중에 다시 맡아 재도전한다(지식 보너스).
  failureTolerance: 0,
  // 재도전할 때마다 모든 선택지의 성공 확률이 +20%p씩 오른다 (두 번째 진입 +20%p, 세 번째 +40%p). 재배정의 지식 보너스와 별개로 더해진다.
  retryChanceBonus: 0.2,
  // 다시 맡을 때마다(재도전) 계기 해설이 달라진다. 몇 번째 재도전이냐에 따라 순서대로, 배열이 끝나면 마지막 문장을 반복한다.
  reintro: [
    '엘리베이터는 이번에도 이름 없는 층에서 멈췄다. 복도 바닥의 마지막 칸에는 지난번에 남긴 발자국이 아직 마르지 않은 채 찍혀 있었다.',
    '세 번째로 같은 복도를 걸었다. 바닥의 번호가 한 칸씩 더 닳아 있었고, 문은 처음보다 가까워 보였다.',
    '이제 복도는 눈을 감고도 걸을 수 있었다. 문은 기다리는 데 익숙한 사람처럼 같은 자리에 서 있었다.',
  ],
  closing: {
    failed: [
      '문은 이번에도 닫힌 채였다. 엘리베이터는 아무 일 없었다는 듯 지상으로 올라갔다.',
      '결정은 내려지지 않았고, 복도의 번호는 한 칸씩 더 닳았다. 문은 기다리는 데 익숙한 듯 보였다.',
      '문 앞에서 돌아온 사원증에는 새 서명이 하나 늘어 있었다. 다음에 다시 내려갈 때까지 문은 그대로일 것이다.',
    ],
  },
  stages: [
    {
      id: 's1',
      title: '가장 깊은 층',
      years: 1,
      text: '수석의 사원증으로만 내려갈 수 있는 마지막 층. 복도 끝에는 문 하나뿐이다. 바닥에는 당신이 지금까지 관리한 객체의 번호가 순서대로 새겨져 있고, 마지막 칸은 비어 있다.',
      choices: [
        {
          id: 'read-floor',
          text: '바닥의 번호를 하나씩 소리 내어 읽으며 걸어간다',
          story: '복도 바닥에 번호가 하나씩 박혀 있었다. 첫 번호를 소리 내어 읽고, 읽은 숫자만큼 한 걸음씩 걸어 나갔다.',
          risk: 1,
          baseChance: 0.78,
          statWeights: { knowledge: 0.004, sanity: 0.003 },
          success: {
            text: '번호를 모두 읽자 문 앞에 닿았다. 마지막 빈칸은 당신의 사번과 정확히 같은 길이였다.',
            effects: { knowledge: 6, reputation: 6 },
          },
          failure: {
            kind: 'setback',
            text: '번호 하나를 건너뛰자 바닥이 한 칸 낮아졌다. 돌아오는 길이 길어졌다.',
            effects: { sanity: -12 },
          },
        },
        {
          id: 'measure-door',
          text: '문을 측정하고 문틀의 재질을 분석한다',
          story: '줄자로 문의 높이와 너비를 쟀다. 문틀을 두드려 소리를 들으며 재질 표본을 긁어냈다.',
          risk: 2,
          baseChance: 0.6,
          statWeights: { knowledge: 0.005 },
          success: {
            text: '문틀은 뼈도 돌도 아니었다. 그리고 안쪽에서 무언가 세어지고 있었다. 우리가 세는 것과 같은 속도로.',
            effects: { knowledge: 9, reputation: 6, sanity: -4 },
          },
          failure: {
            kind: 'setback',
            text: '측정기는 문 반대편의 값을 돌려주었다. 이쪽이 문의 반대편인 듯했다.',
            effects: { sanity: -13 },
          },
        },
        {
          id: 'knock',
          text: '문을 두드려 안쪽의 응답을 기다린다',
          story: '문 앞에 서서 손등을 들어 올렸다. 숨을 한 번 고르고 세 번 천천히 두드린 뒤 귀를 문에 가져다 댔다.',
          risk: 4,
          baseChance: 0.3,
          statWeights: { sanity: 0.006, knowledge: 0.004 },
          success: {
            text: '세 번째 노크에 응답이 왔다. 문 안쪽에서, 당신과 같은 박자로. 문은 열리지 않았고, 응답은 한 번뿐이었다.',
            effects: { knowledge: 14, reputation: 10, sanity: -10 },
          },
          failure: {
            kind: 'setback',
            text: '응답은 오지 않았다. 대신 문 너머에서 누군가 같은 박자로 두드리는 소리가 한동안 따라왔다.',
            effects: { sanity: -16 },
          },
        },
      ],
    },
    {
      id: 's2',
      title: '기록 보관실',
      years: 1,
      text: '문 옆의 보관실에는 역대 수석 관리자의 기록이 있다. 모든 기록의 첫 줄이 같다. 마지막 장은 비어 있고, 그 위에는 이미 당신의 필체로 날짜가 적혀 있다.',
      lead: '복도 바닥의 번호를 따라 끝까지 걸었다. 문 옆에 작은 보관실의 문이 반쯤 열려 있었다.',
      leadAfterFailure: '문 앞에서 오래 머뭇거린 끝에 방향을 틀었다. 문 옆에 작은 보관실의 문이 반쯤 열려 있었다.',
      choices: [
        {
          id: 'read-all',
          text: '기록을 처음부터 끝까지 읽는다',
          story: '기록 보관함의 첫 권부터 책상에 쌓았다. 한 장씩 넘기며 필체가 같은 곳에서 손가락을 멈췄다.',
          risk: 1,
          baseChance: 0.7,
          statWeights: { sanity: 0.004, knowledge: 0.003 },
          success: {
            text: '모든 수석이 같은 선택지 앞에 섰고, 서로 다른 선택을 했다. 그 선택의 결과를 쓴 사람은 아무도 없었다.',
            effects: { knowledge: 8, reputation: 5, sanity: -6 },
          },
          failure: {
            kind: 'setback',
            text: '읽는 도중 기록 속의 이름이 하나씩 당신의 이름으로 바뀌었다.',
            effects: { sanity: -14 },
          },
        },
        {
          id: 'ask-predecessor',
          text: '전임 수석을 찾아가 직접 묻는다',
          story: '전임 수석의 거처를 수소문해 찾아갔다. 문을 두드리기 전에 물어볼 말을 종이에 적어 두었다.',
          risk: 2,
          baseChance: 0.55,
          statWeights: { reputation: 0.005, knowledge: 0.003 },
          success: {
            text: '전임은 문 쪽을 보지 않고 말했다. “열쇠를 쥔 사람은 문의 바깥에 있어야 해.” 은퇴한 지 오래된 사람이었다.',
            relations: { harin: 8 },
            effects: { knowledge: 8, reputation: 8 },
          },
          failure: {
            kind: 'setback',
            text: '전임은 당신을 알아보지 못했다. 정확히는, 당신이 아닌 누군가를 알아보았다.',
            effects: { sanity: -12, reputation: -4 },
          },
        },
        {
          id: 'burn-records',
          text: '기록을 모두 태우고 처음부터 시작한다',
          story: '기록을 소각로 옆에 쌓았다. 첫 권을 불 속에 던져 넣는 손이 놀랄 만큼 침착했다.',
          risk: 4,
          baseChance: 0.3,
          statWeights: { sanity: 0.005, reputation: 0.003 },
          success: {
            text: '기록이 타는 동안 문 쪽에서 안도하는 소리가 났다. 이해할 수 없었다.',
            effects: { knowledge: 10, reputation: 10, sanity: -8 },
          },
          failure: {
            kind: 'demotion',
            text: '소각 기록은 감사실에 남았다. 당신은 직위를 박탈당했다. 문은 그대로였다.',
            effects: { reputation: -14, sanity: -8 },
          },
        },
      ],
    },
    {
      id: 's3',
      title: '마지막 결정',
      years: 1,
      text: '문 앞에 섰다. 선택지는 어디에도 적혀 있지 않다. 당신이 관리해 온 모든 객체가 이 문 앞에서 조용히 당신을 본다. 지금 이 순간 당신의 사원증이 수석 관리자의 마지막 서명이 된다.',
      lead: '기록을 모두 읽고 보관실을 나섰다. 복도 끝의 문이 아까보다 한 걸음 가까워져 있었다.',
      leadAfterFailure: '기록을 끝까지 읽지 못한 채 보관실을 나섰다. 복도 끝의 문이 아까보다 한 걸음 가까워져 있었다.',
      choices: [
        {
          id: 'walk-away',
          text: '아무것도 하지 않고 문을 등지고 걸어 나간다',
          story: '문을 등지고 서서 한 번도 돌아보지 않기로 마음먹었다. 첫 걸음을 떼자 발소리가 복도 끝까지 이어졌다.',
          risk: 1,
          baseChance: 0.97,
          // 마지막 안전한 길: 항상 성공한다 (확률 100%). 재도전 없이 언제든 퇴직으로 나갈 수 있다.
          certain: true,
          success: {
            text: '엘리베이터는 정확히 한 번 멈췄다. 지상으로 나왔을 때는 아침이었다. 당신은 사원증을 반납했다.',
            effects: { sanity: 10 },
            endingId: 'walkaway',
          },
          failure: {
            kind: 'setback',
            text: '엘리베이터는 올라가지 않았다. 문 쪽에서 천천히 다가오는 발소리만 들렸다.',
            effects: { sanity: -14 },
          },
        },
        {
          id: 'pass-key',
          text: '후임자를 지명하고 열쇠를 넘긴 뒤 떠난다',
          story: '후임자의 이름을 적은 서류에 서명했다. 열쇠를 손바닥에 올려 건넬 순간을 한참 가늠했다.',
          risk: 2,
          baseChance: 0.6,
          statWeights: { reputation: 0.005, knowledge: 0.003 },
          success: {
            text: '후임자는 열쇠를 받고 한참 문을 바라보았다. 그의 뒷모습이 첫 출근 날의 당신과 닮아 있었다.',
            effects: { reputation: 10 },
            endingId: 'succession',
            // 팀장의 부탁을 받아들여 신뢰를 얻었고(taeseong-trust) 관계가 깊다면 팀장이 인수인계의 보증인이 된다
            endingVariants: [
              { when: { flags: ['taeseong-trust'], relations: { taeseong: { min: 20 } } }, endingId: 'succession-taeseong' },
            ],
          },
          failure: {
            kind: 'setback',
            text: '후임자가 열쇠를 돌려주었다. “저는 아직 모르겠습니다.” 당신도 아직 몰랐다.',
            effects: { reputation: -5, sanity: -6 },
          },
        },
        {
          id: 'seal-door',
          text: '문을 영구 봉인하고 그 자리에 남는다',
          story: '문틀 둘레에 봉인용 판을 하나씩 대고 못을 박았다. 망치 소리가 복도의 침묵을 짧게 끊었다.',
          risk: 3,
          baseChance: 0.42,
          statWeights: { sanity: 0.005, knowledge: 0.005 },
          success: {
            text: '봉인은 완성되었고, 문은 처음으로 조용해졌다. 당신은 문 앞의 의자에 앉았다.',
            effects: { knowledge: 12, reputation: 12, sanity: -8 },
            endingId: 'sealed',
          },
          failure: {
            kind: 'demotion',
            text: '봉인이 갈라졌다. 상부는 책임자를 찾았고, 문은 아직 닫혀 있었다. 아직은.',
            effects: { reputation: -14, sanity: -10 },
          },
        },
        {
          id: 'open-door',
          text: '바깥쪽 손잡이를 잡고 문을 연다',
          story: '문 앞에서 바깥쪽 손잡이를 쥐었다. 열쇠 구멍이 없다는 것을 그제야 처음 알아차렸다.',
          risk: 4,
          baseChance: 0.4,
          statWeights: { sanity: 0.006, knowledge: 0.005 },
          success: {
            text: '문이 열렸다. 그 너머를 본 당신은 문장 하나를 떠올렸다. “저는 처음부터 알고 있었습니다.”',
            effects: { knowledge: 20, reputation: 15, sanity: -20 },
            endingId: 'opened',
          },
          failure: {
            kind: 'setback',
            text: '손잡이가 반쯤 돌아가다 멈췄다. 안쪽과 바깥쪽 중 어느 쪽의 힘인지는 기록되지 않았다. 이튿날 엘리베이터는 한 층 더 깊이 내려가 있었다.',
            effects: { sanity: -20 },
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
