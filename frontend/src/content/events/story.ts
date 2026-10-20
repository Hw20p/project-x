import type { InterludeDef } from '../../engine/types'

// 이야기 이벤트: 흐르는 서술의 이야기 비트가 켠 플래그가 열어 주는, 한 판에 한 번뿐인 장면.
// 서술에서 암시만 하던 것을 직접 만져 보고 선택하게 한다.
export default [
  {
    id: 'sto-predecessor-badge',
    kind: 'growth',
    title: '서랍 속의 사원증',
    text: '서랍에서 나온 전임자의 사원증이 책상 위에 놓여 있다. 뒷면에 무언가 적혀 있는 것 같다. 읽을지, 그대로 둘지, 누구에게 물을지 정해야 한다.',
    once: true,
    weight: 4,
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
  {
    id: 'sto-extra-floor',
    kind: 'growth',
    title: '한 층 더 아래',
    text: '도면에 없는 지하층으로 내려가는 비상계단 문이 열려 있다. 안내 표지는 없고, 계단참의 먼지 위에는 발자국이 한 방향으로만 찍혀 있다.',
    once: true,
    weight: 4,
    when: { flags: ['story-floor'], minRank: 3 },
    choices: [
      {
        id: 'look-down',
        text: '계단참에서 아래만 내려다본다',
        risk: 2,
        baseChance: 0.7,
        statWeights: { sanity: 0.003 },
        success: {
          text: '아래는 어두웠고 바닥은 보이지 않았다. 돌아서는 순간 계단 수를 세어 둔 것이 기억났다. 열네 칸이었다.',
          effects: { knowledge: 6, sanity: -2 },
        },
        failure: {
          kind: 'setback',
          text: '내려다보는 동안 아래에서 누군가 올려다보고 있다는 감각이 사라지지 않았다.',
          effects: { sanity: -6 },
        },
      },
      {
        id: 'descend',
        text: '한 층만 내려가 본다',
        risk: 4,
        baseChance: 0.35,
        statWeights: { sanity: 0.005, knowledge: 0.003 },
        success: {
          text: '내려간 층은 복도 하나뿐이었다. 벽에는 내가 일지에 쓴 문장들이 먼저 적혀 있었다.',
          effects: { knowledge: 12, reputation: 4, sanity: -8 },
        },
        failure: {
          kind: 'setback',
          text: '올라오는 계단이 한 칸 모자랐다. 그 한 칸을 지나는 데 반나절이 걸렸다.',
          effects: { sanity: -10, health: -3 },
        },
      },
      {
        id: 'report-floor',
        text: '층의 존재를 보고서에 적는다',
        risk: 2,
        baseChance: 0.6,
        statWeights: { reputation: 0.004 },
        success: {
          text: '보고서는 승인 도장이 찍혀 돌아왔다. 층에 대한 문장만 지워진 채로.',
          effects: { reputation: 5, knowledge: 2 },
        },
        failure: {
          kind: 'setback',
          text: '보고서가 반려되었다. “도면에 없는 층은 없는 층입니다.”',
          effects: { reputation: -5 },
        },
      },
    ],
  },
  {
    id: 'sto-ledger',
    kind: 'growth',
    title: '일지의 마지막 장',
    text: '전임 책임자의 일지를 다시 펼쳤다. 마지막 장에는 오늘 날짜가 적혀 있고 그 아래 줄이 비어 있다. 펜이 책상 위에 놓여 있다.',
    once: true,
    weight: 4,
    when: { flags: ['story-ledger-read'], minRank: 4 },
    choices: [
      {
        id: 'write-nothing',
        text: '아무것도 적지 않고 덮는다',
        risk: 1,
        baseChance: 0.85,
        success: {
          text: '일지를 덮자 펜이 스스로 굴러 책상 가장자리에서 멈췄다.',
          effects: { sanity: 3 },
        },
        failure: {
          kind: 'setback',
          text: '덮은 일지가 다시 열려 있었다. 펼쳐진 쪽은 같은 쪽이었다.',
          effects: { sanity: -4 },
        },
      },
      {
        id: 'write-name',
        text: '오늘 날짜 아래에 내 이름을 쓴다',
        risk: 3,
        baseChance: 0.5,
        statWeights: { sanity: 0.004, knowledge: 0.003 },
        success: {
          text: '이름 아래로 한 줄이 더 생겼다. 내 필체로 “다음 사람에게”라고 적혀 있었다.',
          effects: { knowledge: 9, reputation: 5, sanity: -7 },
        },
        failure: {
          kind: 'setback',
          text: '이름을 쓰는 동안 펜이 내 이름이 아닌 이름을 썼다. 한참 지워도 지워지지 않았다.',
          effects: { sanity: -12 },
        },
      },
      {
        id: 'copy-pages',
        text: '일지 전체를 복사해 보관한다',
        risk: 2,
        baseChance: 0.6,
        statWeights: { knowledge: 0.004 },
        success: {
          text: '복사본은 원본과 같았다. 다만 복사본의 마지막 장은 비어 있었다.',
          effects: { knowledge: 8, reputation: -1 },
        },
        failure: {
          kind: 'setback',
          text: '복사기 안에서 종이가 밀려 나오다 멈췄다. 멈춘 장이 마지막 장이었다.',
          effects: { sanity: -5 },
        },
      },
    ],
  },
  {
    id: 'sto-door-lamp',
    kind: 'growth',
    title: '센서등',
    text: '지하 깊은 곳 문 앞의 센서등이 내가 다가가기 전에 먼저 켜진다. 불빛 아래 먼지에는 발자국이 한 사람 몫만 찍혀 있다. 문 쪽을 향해서.',
    once: true,
    weight: 4,
    when: { flags: ['story-door-lamp'], minRank: 5 },
    choices: [
      {
        id: 'wait-lamp',
        text: '불이 꺼질 때까지 기다린다',
        risk: 1,
        baseChance: 0.8,
        statWeights: { sanity: 0.003 },
        success: {
          text: '불은 꺼지지 않았다. 대신 마음이 조금 가라앉았다.',
          effects: { sanity: 3, knowledge: 3 },
        },
        failure: {
          kind: 'setback',
          text: '불이 꺼지는 순간 문 안에서 한 번 두드리는 소리가 났다.',
          effects: { sanity: -8 },
        },
      },
      {
        id: 'step-on-print',
        text: '발자국 위에 발을 올려 본다',
        risk: 4,
        baseChance: 0.35,
        statWeights: { sanity: 0.005, knowledge: 0.003 },
        success: {
          text: '발자국은 내 신발과 같은 치수였다. 같다는 사실이 두렵기보다 낯익었다.',
          effects: { knowledge: 12, reputation: 5, sanity: -8 },
        },
        failure: {
          kind: 'setback',
          text: '발이 올려진 순간 센서등이 꺼졌다. 어둠 속에서 누군가 발을 옮기는 소리가 들렸다.',
          effects: { sanity: -12 },
        },
      },
      {
        id: 'cover-lamp',
        text: '센서등을 가린다',
        risk: 2,
        baseChance: 0.65,
        success: {
          text: '가려진 센서등 아래에서 문은 조용했다. 조용함이 처음으로 위로가 되었다.',
          effects: { sanity: 4 },
        },
        failure: {
          kind: 'setback',
          text: '가려 둔 천이 벗겨져 있었다. 누가 벗겼는지는 알 수 없다.',
          effects: { sanity: -5 },
        },
      },
    ],
  },
] satisfies InterludeDef[]
