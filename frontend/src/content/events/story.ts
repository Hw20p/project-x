import type { InterludeDef } from '../../engine/types'

// 이야기 이벤트: 흐르는 서술의 이야기 비트가 켠 플래그가 열어 주는, 한 판에 한 번뿐인 장면.
// 서술에서 암시만 하던 것을 직접 만져 보고 선택하게 한다.
export default [
  {
    id: 'sto-predecessor-badge',
    kind: 'growth',
    title: '서랍 속의 사원증',
    text: '서랍에서 나온 전임자의 사원증이 책상 위에 놓여 있다. 뒷면에 무언가 적혀 있는 것 같다. 읽을지, 그대로 둘지, 누구에게 물을지 정해야 한다.',
    years: 0.5,
    once: true,
    weight: 8,
    when: { flags: ['story-predecessor'] },
    choices: [
      {
        id: 'read-back',
        text: '사원증 뒷면에 적힌 글을 읽는다',
        risk: 3,
        baseChance: 0.6,
        statWeights: { knowledge: 0.004 },
        success: {
          text: '뒷면에는 사번 대신 같은 문장이 반복되어 있었다. “다음 사람에게: 일지는 의자를 등지고 쓰지 마라.” 첫 객체의 매뉴얼에서 읽은 말과 같았다.',
          effects: { knowledge: 8, sanity: -3 },
        },
        failure: {
          kind: 'setback',
          text: '글씨가 흐려 읽을 수 없었다. 읽으려 할수록 내 필체로 보였다.',
          effects: { sanity: -6, knowledge: 2 },
        },
      },
      {
        id: 'put-back',
        text: '서랍에 도로 넣고 닫는다',
        risk: 1,
        baseChance: 0.9,
        success: {
          text: '서랍은 조용히 닫혔다. 닫히는 소리가 두 번 났다. 한 번은 내가 낸 소리가 아니었다.',
          effects: { sanity: 2 },
        },
        failure: {
          kind: 'setback',
          text: '서랍이 덜 닫힌 채 걸렸다. 밀어 넣을 때마다 안에서 무언가가 밀어냈다.',
          effects: { sanity: -3 },
        },
      },
      {
        id: 'ask-senior',
        text: '선임에게 전임자가 누구였는지 묻는다',
        risk: 2,
        baseChance: 0.7,
        statWeights: { reputation: 0.003 },
        success: {
          text: '선임은 한참 침묵하다 이름을 말했다. 듣자마자 잊어버렸다. 잊었다는 사실만 오래 남았다.',
          effects: { reputation: 2, sanity: -4 },
        },
        failure: {
          kind: 'setback',
          text: '“그런 걸 왜 묻나.” 선임은 그날부터 인사를 짧게 했다.',
          effects: { reputation: -4 },
        },
      },
    ],
  },
] satisfies InterludeDef[]
