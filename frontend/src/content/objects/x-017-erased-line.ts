import type { ContainmentObject } from '../../engine/types'

// 제안되는 최종 객체(기록 이야기). 문하린의 노트를 읽고 지워진 사람의 이름까지 들은 수석에게 최종 객체가 열릴 때 X-011 대신 제안된다.
// 받아들이면 이 객체를, 거절하면 기본 최종 객체 X-011을 맡는다. 마지막 선택은 둘: 지워진 줄을 낭독한다(성공: 낭독 / 실패: 끊긴 줄),
// 지워진 사람의 이름을 부른다(성공: 이름의 응답, 문하린과 깊은 사이면 아는 문 / 실패: 불리지 못한 이름).
// 성공 확률은 문하린과의 관계가 높을수록 오른다(`relationWeights`).
export default {
  id: 'x-017',
  code: 'X-017',
  name: '지워진 줄',
  tier: 5,
  finale: true,
  when: { flags: ['harin-secret', 'harin-erased-name'] },
  priority: 10,
  decline: '지워진 줄 옆의 점 하나가 떠올랐지만, 당신은 노트를 덮었다. 선임의 필체는 책장 사이에서 조용히 닫혔고, 엘리베이터는 이름 없는 층으로 다시 내려갔다.',
  summary: '문하린의 노트 마지막 장에서 지워진 줄. 지우개 자국 아래에는 눌러 쓴 필압이 남아 있고, 그 줄을 읽은 사람은 문 안쪽에서 같은 줄이 읽히는 것을 듣는다.',
  intro: '문하린의 노트에서 지워진 줄과 지워진 사람의 이름이 같은 쪽에 놓였다. 수석의 열쇠가 마지막 층의 문 앞에 닿는 날, 노트의 그 쪽이 먼저 펼쳐져 있었다.',
  observation: [
    '노트의 마지막 장. 줄 하나가 지워져 있고, 지우개 자국 아래에 눌러 쓴 필압이 남아 있다.',
    '지워진 줄의 첫 글자는 지워진 사람의 이름과 같다.',
    '이 줄을 소리 내어 읽은 기록은 세 건. 세 건 모두 마지막 줄에서 낭독이 두 목소리가 되었다.',
  ],
  manual: [
    '줄은 한 번에 읽지 않는다. 한 줄 읽고 문 안쪽의 소리를 기다린다.',
    '지워진 사람의 이름은 마지막 줄에서만 부른다.',
    '(작성자 서명란에는 문하린의 사번이 있고, 그 옆의 한 칸이 지워져 있다.)',
  ],
  // 이 객체의 엔딩 선택은 성공해도 실패해도 엔딩으로 끝난다 (성공: 낭독·이름의 응답·아는 문, 실패: 끊긴 줄·불리지 못한 이름).
  // 그래서 재도전이 없고, 재도전용 해설(`reintro`)·실패 마무리(`closing`)도 쓰지 않는다.
  failureTolerance: 0,
  stages: [
    {
      id: 's1',
      title: '노트의 마지막 장',
      years: 1,
      text: '문 앞에서 노트를 펼치자 마지막 장의 줄 하나가 지워져 있다. 지우개 자국은 선명한데, 그 아래 필압은 아직 읽을 수 있을 만큼 남아 있다. 문 안쪽에서 종이 넘기는 소리가 났다.',
      choices: [
        {
          id: 'trace-lines',
          text: '필압을 손끝으로 더듬어 첫 글자를 확인한다',
          story: '지워진 줄 위에 손끝을 가만히 올렸다. 눌러 쓴 자리를 한 획씩 더듬어 내려갔다.',
          risk: 1,
          baseChance: 0.8,
          statWeights: { knowledge: 0.004 },
          success: {
            text: '손끝에 이름 첫 글자의 획이 걸렸다. 지워진 사람의 이름이 맞았다.',
            effects: { knowledge: 7, sanity: -2 },
          },
          failure: {
            kind: 'setback',
            text: '더듬던 손끝에서 필압이 한 줄씩 사라졌다. 읽은 만큼만 남았다.',
            effects: { knowledge: 2, sanity: -6 },
          },
        },
        {
          id: 'listen-door',
          text: '문에 귀를 대고 안쪽의 종이 소리를 센다',
          story: '문에 귀를 가져다 대고 숨을 멈췄다. 종이 넘기는 소리를 하나씩 속으로 세었다.',
          risk: 2,
          baseChance: 0.65,
          statWeights: { sanity: 0.003 },
          success: {
            text: '종이 넘기는 소리는 일정했다. 넘길 때마다 내가 읽을 줄도 한 줄씩 가까워졌다.',
            effects: { knowledge: 5, sanity: 3 },
          },
          failure: {
            kind: 'setback',
            text: '소리를 세는 동안 내 이름의 글자 수만큼 소리가 끊겼다.',
            effects: { sanity: -10 },
          },
        },
        {
          id: 'copy-trace',
          text: '노트를 보며 지워진 줄을 다른 종이에 옮겨 적는다',
          story: '메모지를 꺼내 노트 옆에 놓았다. 필압이 남은 자리를 따라 글자를 한 자씩 옮겨 적었다.',
          risk: 1,
          baseChance: 0.85,
          success: {
            text: '옮겨 적은 종이는 원본보다 선명했다. 손이 기억하는 필체였다.',
            effects: { knowledge: 6, sanity: -3 },
          },
          failure: {
            kind: 'setback',
            text: '옮겨 적는 중간에 글자가 한 번 다르게 적혔다. 고치려 해도 같은 글자가 나왔다.',
            effects: { sanity: -5 },
          },
        },
      ],
    },
    {
      id: 's2',
      title: '안쪽의 낭독',
      years: 1,
      text: '줄을 절반쯤 읽자 문 안쪽에서 같은 줄이 이어서 읽히기 시작했다. 목소리는 당신의 것이 아니고, 노트의 주인의 것도 아니다. 읽는 속도가 점점 당신을 따라잡는다.',
      lead: '필압을 확인하고 나자 문 앞의 공기가 가라앉았다. 줄의 첫머리를 낮게 읽기 시작했다.',
      leadAfterFailure: '손끝의 감각이 흐린 채로 노트를 고쳐 쥐었다. 줄의 첫머리를 낮게 읽기 시작했다.',
      choices: [
        {
          id: 'keep-reading',
          text: '멈추지 않고 줄 끝까지 읽는다',
          story: '숨을 한 번 들이쉬고 첫 글자부터 읽어 내려갔다. 안쪽의 목소리가 따라와도 속도를 늦추지 않았다.',
          risk: 3,
          baseChance: 0.55,
          statWeights: { sanity: 0.005, knowledge: 0.004 },
          success: {
            text: '목소리는 한 박자 늦게 따라왔다. 마지막 줄에 닿을 때까지 두 목소리의 차이는 줄어들었다.',
            effects: { knowledge: 10, sanity: -6 },
          },
          failure: {
            kind: 'setback',
            text: '읽는 중간에 목소리가 먼저 마지막 줄에 닿았다. 입을 다물자 낭독은 계속되었다.',
            effects: { sanity: -14 },
          },
        },
        {
          id: 'pause-answer',
          text: '한 줄 읽을 때마다 멈추고 안쪽의 소리를 기다린다',
          story: '한 줄을 읽고 입을 다물었다. 안쪽에서 같은 줄이 이어지는 것을 끝까지 듣고 나서 다음 줄로 넘어갔다.',
          risk: 2,
          baseChance: 0.7,
          statWeights: { sanity: 0.004 },
          success: {
            text: '멈출 때마다 같은 줄이 안쪽에서 조용히 이어졌다. 순서를 지키자 낭독이 겹치지 않았다.',
            effects: { knowledge: 6, sanity: 4 },
          },
          failure: {
            kind: 'setback',
            text: '멈춘 틈에 안쪽 목소리가 줄을 두 개 건너뛰었다. 어디까지 읽었는지 알 수 없게 되었다.',
            effects: { sanity: -8 },
          },
        },
        {
          id: 'close-notebook',
          text: '노트를 덮고 목소리가 멈추기를 기다린다',
          story: '노트를 덮고 두 손으로 표지를 눌렀다. 문 안쪽의 목소리가 다 줄어들 때까지 움직이지 않았다.',
          risk: 1,
          baseChance: 0.9,
          success: {
            text: '노트를 덮자 목소리가 천천히 줄어들었다. 문은 닫힌 채로 조용했다.',
            effects: { sanity: 6 },
          },
          failure: {
            kind: 'setback',
            text: '노트를 덮어도 목소리는 같은 줄을 반복했다. 덮은 표지 위에 손바닥이 얹혀 있었다.',
            effects: { sanity: -6 },
          },
        },
      ],
    },
    {
      id: 's3',
      title: '이름',
      years: 1,
      text: '마지막 줄 앞에서 두 목소리가 멈췄다. 지워진 사람의 이름을 부를 차례다. 문 안쪽의 목소리가 기다리고 있다. 이름을 부를지, 줄을 끝까지 낭독할지 정해야 하고, 한 번 정하면 되돌릴 수 없다.',
      lead: '두 목소리가 마지막 줄 직전에서 나란히 멈췄다. 노트에는 이름이 적힌 자리만 비어 있었다.',
      leadAfterFailure: '두 목소리가 어긋난 채로 마지막 줄 앞에서 멈췄다. 이름이 적힌 자리가 가장 선명하게 보였다.',
      choices: [
        {
          id: 'recite-lines',
          text: '지워진 줄을 마지막까지 낭독한다',
          story: '노트의 마지막 장을 펼치고 문 앞에 섰다. 지우개 자국 아래 눌러 쓴 줄을 낮은 목소리로 읽기 시작했다.',
          risk: 3,
          baseChance: 0.6,
          statWeights: { knowledge: 0.005, sanity: 0.004 },
          // 문하린과의 관계를 쌓은 만큼 유리하다
          relationWeights: { harin: 0.002 },
          success: {
            text: '낭독이 마지막 줄에 닿자 문 안쪽에서 같은 박자의 낭독이 겹쳐 왔다. 두 목소리가 맞닿는 순간 문틈의 빛이 꺼졌다.',
            effects: { knowledge: 15, sanity: -6 },
            endingId: 'recited',
          },
          failure: {
            kind: 'setback',
            text: '낭독이 마지막 줄 앞에서 끊겼다. 문 안쪽에서 누군가 끊긴 자리부터 숨죽여 이어 읽는 소리가 들렸다.',
            effects: { sanity: -12 },
            endingId: 'broken-line',
          },
        },
        {
          id: 'answer-name',
          text: '지워진 사람의 이름을 부른다',
          story: '마지막 줄 앞에서 숨을 들이쉬고 이름을 불렀다. 한 음절씩 천천히, 문 안쪽에 닿을 만큼의 소리로.',
          risk: 4,
          baseChance: 0.4,
          statWeights: { sanity: 0.005, knowledge: 0.004 },
          relationWeights: { harin: 0.003 },
          success: {
            text: '문 안쪽에서 같은 박자의 대답이 이름을 불렀다. 지워졌던 사람의 이름이었다.',
            effects: { knowledge: 12, sanity: -10 },
            endingId: 'answered-name',
            // 문하린과 깊은 사이(관계 30 이상)라면, 이름을 부르자 문이 열리고 알아보는 것이 있다
            endingVariants: [{ when: { relations: { harin: { min: 30 } } }, endingId: 'opened-known' }],
          },
          failure: {
            kind: 'setback',
            text: '이름의 마지막 음절이 입 밖으로 나오지 않았다. 문 안쪽에서 누군가 그 음절을 대신 불렀다.',
            effects: { sanity: -14 },
            endingId: 'unspoken-name',
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
