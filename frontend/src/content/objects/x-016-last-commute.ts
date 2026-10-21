import type { ContainmentObject } from '../../engine/types'

// 제안되는 최종 객체(사람 이야기). 서지안이나 문하린과 연인이 된 수석에게 최종 객체가 열릴 때 X-011 대신 제안된다.
// 받아들이면 이 객체를, 거절하면 기본 최종 객체 X-011을 맡는다. 마지막 선택은 둘: 손을 잡고 올라간다(성공: 동행·두 개의 점 / 실패: 놓친 손),
// 함께 문을 봉인한다(성공: 두 사람의 문지기 / 실패: 두 개의 의자). 성공 확률은 연인과의 관계가 높을수록 오른다(`relationWeights`).
export default {
  id: 'x-016',
  code: 'X-016',
  name: '마지막 퇴근',
  tier: 5,
  finale: true,
  when: { anyFlags: ['jian-lover', 'harin-lover'] },
  priority: 20,
  decline: '“함께 가요.”라는 말을 들었지만, 당신은 고개를 저었다. 곁의 손이 천천히 놓였다. 엘리베이터는 한 사람 몫의 무게로 다시 내려갔고, 복도 끝에는 문 하나뿐이었다.',
  summary: '마지막 층으로 내려가는 엘리베이터. 정원은 두 명이고, 올라오는 칸에는 사람 수만큼의 발소리가 기록된다.',
  intro: '수석의 사원증이 마지막 층 버튼에 응답하던 날, 곁에 있던 사람의 사원증도 같은 소리를 냈다. 엘리베이터는 두 사람을 태우고 이름 없는 층에서 멈췄다.',
  observation: [
    '지하 최하층으로 가는 엘리베이터. 정원은 두 명이다.',
    '수석의 사원증과 다른 사원증이 동시에 찍히면 층 버튼이 하나 더 생긴다.',
    '올라오는 칸에는 사람 수만큼의 발소리가 기록된다. 내려갈 때와 올라올 때의 수가 달랐던 기록은 아직 없다.',
  ],
  manual: [
    '엘리베이터에 탄 사람의 이름은 일지에 적지 않는다.',
    '문 앞에서는 곁에 선 사람의 손을 놓지 않는다.',
    '(작성자 서명란에는 두 개의 사번이 나란히 적혀 있다.)',
  ],
  // 이 객체의 엔딩 선택은 성공해도 실패해도 엔딩으로 끝난다 (성공: 동행·두 개의 점·두 사람의 문지기, 실패: 놓친 손·두 개의 의자).
  // 그래서 재도전이 없고, 재도전용 해설(`reintro`)·실패 마무리(`closing`)도 쓰지 않는다.
  failureTolerance: 0,
  stages: [
    {
      id: 's1',
      title: '정원 두 명',
      years: 1,
      text: '엘리베이터 안에는 곁에 선 사람과 당신뿐이다. 층 버튼 위에 사원증 두 장을 나란히 대야 문이 닫힌다. 표시창은 층 대신 두 사람의 사번을 번갈아 보여 준다.',
      choices: [
        {
          id: 'tap-together',
          text: '두 사람의 사원증을 함께 대고 버튼을 누른다',
          story: '곁에 선 사람과 사원증을 나란히 들었다. 하나, 둘, 셋을 속으로 세고 버튼 위에 동시에 올렸다.',
          risk: 1,
          baseChance: 0.85,
          success: {
            text: '버튼이 한 번에 눌렸다. 표시창의 두 사번이 같은 속도로 깜박였다.',
            effects: { sanity: 6, reputation: 4 },
          },
          failure: {
            kind: 'setback',
            text: '사원증이 겹치지 않아 버튼이 응답하지 않았다. 다시 대는 사이 곁의 손이 조금 차가워졌다.',
            effects: { sanity: -6 },
          },
        },
        {
          id: 'count-footsteps',
          text: '올라오는 발소리가 몇 사람 몫인지 세어 본다',
          story: '엘리베이터 벽에 귀를 대고 위층에서 내려오는 발소리를 하나씩 세었다. 곁의 숨소리도 함께 세어졌다.',
          risk: 2,
          baseChance: 0.65,
          statWeights: { knowledge: 0.004 },
          success: {
            text: '발소리는 둘이었다. 둘이라는 숫자를 확인하자 이상하게 마음이 놓였다.',
            effects: { knowledge: 7, sanity: 3 },
          },
          failure: {
            kind: 'setback',
            text: '세는 동안 발소리가 하나 늘었다. 늘어난 발소리는 곁에 선 사람의 것과 박자가 같았다.',
            effects: { sanity: -10 },
          },
        },
        {
          id: 'read-manual',
          text: '매뉴얼의 “손을 놓지 않는다”는 줄을 소리 내어 읽는다',
          story: '매뉴얼의 둘째 줄을 손가락으로 짚었다. 곁에 선 사람이 들을 수 있을 만큼 낮게 한 글자씩 읽었다.',
          risk: 1,
          baseChance: 0.8,
          success: {
            text: '줄을 읽자 곁의 손이 마주 잡아 왔다. 읽은 목소리가 엘리베이터 벽에서 한 번 더 들렸다.',
            effects: { sanity: 5, knowledge: 4 },
          },
          failure: {
            kind: 'setback',
            text: '줄의 끝 글자가 번져 읽을 수 없었다. 손을 쥔 채로 한참 번진 글자만 바라보았다.',
            effects: { sanity: -5 },
          },
        },
      ],
    },
    {
      id: 's2',
      title: '이름 없는 층의 복도',
      years: 1,
      text: '엘리베이터는 이름 없는 층에서 멈췄다. 복도 끝에는 문 하나, 문 앞에는 의자가 두 개 놓여 있다. 바닥에는 발자국이 두 줄 나 있고, 한 줄은 문 쪽으로만 향한다.',
      lead: '표시창의 사번이 꺼지고 문이 열렸다. 곁의 손을 쥔 채 복도로 한 걸음 나섰다.',
      leadAfterFailure: '엘리베이터는 서두르는 사람처럼 문을 열었다. 흔들리는 손을 쥔 채 복도로 나섰다.',
      choices: [
        {
          id: 'follow-footprints',
          text: '문 쪽으로만 향한 발자국을 따라가 본다',
          story: '바닥의 발자국 한 줄을 따라 천천히 걸었다. 곁의 사람이 잡은 손으로 나를 한 번 당겨 세웠다.',
          risk: 3,
          baseChance: 0.5,
          statWeights: { sanity: 0.004 },
          success: {
            text: '발자국은 문 앞에서 끝났다. 끝난 자리에 신발이 한 켤레 놓여 있었다. 같은 치수가 두 켤레였다.',
            effects: { knowledge: 8, sanity: -4 },
          },
          failure: {
            kind: 'setback',
            text: '발자국을 따라 걷는 동안 곁의 걸음 소리가 하나씩 줄었다. 돌아보니 손은 그대로였다.',
            effects: { sanity: -12 },
          },
        },
        {
          id: 'sit-chairs',
          text: '의자 두 개에 나란히 앉아 숨을 고른다',
          story: '문 앞의 의자에 나란히 앉았다. 서로의 어깨가 닿는 거리에서 한동안 아무 말도 하지 않았다.',
          risk: 1,
          baseChance: 0.85,
          success: {
            text: '의자는 두 사람의 몸무게에 맞춰져 있었다. 한참 말없이 앉아 있자 문 쪽의 기척이 조금 물러났다.',
            effects: { sanity: 10 },
          },
          failure: {
            kind: 'setback',
            text: '앉은 지 얼마 되지 않아 의자 하나가 비어 있는 것처럼 느껴졌다. 손을 다시 찾아 쥐었다.',
            effects: { sanity: -4 },
          },
        },
        {
          id: 'ask-partner',
          text: '곁에 있는 사람에게 문 너머로 가고 싶은지 묻는다',
          story: '문 쪽을 바라본 채 곁의 사람에게 낮게 물었다. 대답을 기다리는 동안 잡은 손에 힘을 주지 않으려 애썼다.',
          risk: 2,
          baseChance: 0.7,
          statWeights: { sanity: 0.003 },
          success: {
            text: '대답은 짧았다. “같이 가면요.” 목소리는 떨렸고, 손은 떨리지 않았다.',
            effects: { sanity: 8, reputation: 4 },
          },
          failure: {
            kind: 'setback',
            text: '대답을 기다리는 사이 복도의 불이 하나 꺼졌다. 침묵이 길어지는 만큼 문은 가까워졌다.',
            effects: { sanity: -9 },
          },
        },
      ],
    },
    {
      id: 's3',
      title: '마지막 퇴근',
      years: 1,
      text: '문 앞에서 두 사람의 사원증이 동시에 울렸다. 문을 등지고 올라갈 수도, 함께 봉인할 수도 있다. 어느 쪽이든 두 사람이 함께 정해야 하고, 한 번 정하면 되돌릴 수 없다.',
      lead: '의자에서 일어나자 곁의 사람도 함께 일어났다. 발자국이 끝난 자리에 두 사람이 나란히 섰다.',
      leadAfterFailure: '흔들리는 숨을 고르며 일어섰다. 곁의 손은 여전히 놓여 있지 않았다.',
      choices: [
        {
          id: 'hold-hands',
          text: '곁에 있는 사람의 손을 잡고 문을 등지고 올라간다',
          story: '문 앞에서 숨을 고르고 오른손을 내밀었다. 그 손을 잡아 줄 사람을 돌아보지 않아도 알 수 있었다.',
          risk: 2,
          baseChance: 0.78,
          statWeights: { sanity: 0.004 },
          // 관계를 쌓은 만큼 유리하다 (서지안이든 문하린이든, 연인과의 관계가 높을수록)
          relationWeights: { jian: 0.002, harin: 0.002 },
          success: {
            text: '엘리베이터는 정확히 한 번 멈췄다. 올라오는 내내 잡은 손은 놓이지 않았다.',
            effects: { sanity: 12 },
            endingId: 'together-jian',
            // 연인이 문하린이라면 엔딩이 달라진다 (서지안이면 기본)
            endingVariants: [{ when: { flags: ['harin-lover'] }, endingId: 'together-harin' }],
          },
          failure: {
            kind: 'setback',
            text: '엘리베이터 문이 닫히는 순간 잡았던 손이 미끄러졌다. 문 쪽에서 천천히 다가오는 발소리가 들렸고, 닫힌 문 너머로 곁의 사람이 당신의 이름을 부르는 소리가 멀어졌다.',
            effects: { sanity: -10 },
            endingId: 'lost-hand',
          },
        },
        {
          id: 'seal-together',
          text: '곁에 있는 사람과 함께 문을 봉인하고 그 자리에 남는다',
          story: '문틀 양쪽에 봉인판을 한 장씩 대고 나란히 못을 박았다. 망치 소리가 두 사람의 박자로 번갈아 울렸다.',
          risk: 3,
          baseChance: 0.55,
          statWeights: { sanity: 0.005, knowledge: 0.004 },
          relationWeights: { jian: 0.002, harin: 0.002 },
          success: {
            text: '봉인은 완성되었고, 문은 처음으로 조용해졌다. 문 앞의 의자 두 개는 더 이상 비어 있지 않게 되었다.',
            effects: { knowledge: 10, reputation: 10, sanity: -4 },
            endingId: 'sealed-pair',
          },
          failure: {
            kind: 'setback',
            text: '봉인판이 한 장 어긋났다. 두 사람은 말없이 못을 박았고, 문은 닫혔지만 조용해지지 않았다.',
            effects: { sanity: -8, reputation: -6 },
            endingId: 'two-chairs',
          },
        },
      ],
    },
  ],
} satisfies ContainmentObject
