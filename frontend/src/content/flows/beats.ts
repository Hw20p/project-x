import type { FlowDef } from '../../engine/types'

// 이야기 비트: 선택 없이 읽기만 하는 큰 줄거리. 조건이 맞으면 한 번만 나온다.
// 3막 구성 (2026-10-20 확정, 문장 톤은 플레이하며 다듬는다):
//   1막 (수습~사원) 낯선 규칙 — 사원증·매뉴얼·퇴직자 명단에서 "이 자리는 이미 누군가 앉았던 자리"라는 위화감
//   2막 (주임~책임) 규칙의 균열 — 객체들의 발견 위치가 한 방향을 가리키고, 건물의 층 수와 전임자의 일지가 맞지 않음
//   3막 (수석)      문 앞 — 수석만 아는 엘리베이터 버튼, 역대 수석 명단, 문을 두드리는 소리. X-011 「바깥」으로 이어진다
// NPC 이야기(서지안·문하린)의 결과 플래그도 같은 방식으로 비트에 반영한다.
export default [
  // ── 1막 ────────────────────────────────────────────
  {
    id: 'beat-badge-number',
    kind: 'beat',
    when: { maxRank: 1, minAge: 23 },
    setFlags: ['story-badge'],
    text: '사원증의 사번은 입사 서류에 적힌 번호와 달랐다. 인사팀은 “배정 번호”라고만 했다. 이미 한 번 쓰인 번호처럼 손때가 묻은 느낌이 들었다.',
  },
  {
    id: 'beat-locker',
    kind: 'beat',
    when: { maxRank: 3 },
    after: 'beat-badge-number',
    afterYears: 1,
    text: '배정받은 사물함 안쪽에는 테이프 자국이 남아 있었다. 이름표를 떼어 낸 자리였다. 청소 담당은 그 사물함만은 건드리지 않는다고 했다.',
  },
  {
    id: 'beat-handbook-margin',
    kind: 'beat',
    when: { maxRank: 3 },
    after: 'beat-locker',
    afterYears: 1,
    text: '신입 안내서의 여백에 연필 메모가 있었다. “3번 항목은 믿지 마라.” 낯선 필체인데, 획을 긋는 순서가 내 버릇과 같았다.',
  },
  {
    id: 'beat-first-promotion',
    kind: 'beat',
    when: { minRank: 2 },
    text: '첫 승급 날, 인사팀은 사원증을 새로 만들어 주었다. 사진은 입사 때 찍은 그대로인데, 표정이 조금 달라 보였다.',
  },
  {
    id: 'beat-erased-names',
    kind: 'beat',
    when: { minRank: 2, minAge: 26 },
    setFlags: ['story-erased'],
    text: '퇴직자 명단에서 이름 몇 개가 지워져 있었다. 지운 흔적은 없었다. 처음부터 없었던 것처럼 줄이 맞아 있었다.',
  },
  {
    id: 'beat-senior-warning',
    kind: 'beat',
    when: { minRank: 2, maxRank: 4 },
    after: 'beat-erased-names',
    afterYears: 1,
    text: '퇴근길에 선임이 낮은 목소리로 말했다. “이름은 너무 외우지 마. 내년에 없는 사람도 있으니까.” 농담이라고 하기에는 웃음이 없었다.',
  },
  {
    id: 'beat-predecessor-badge',
    kind: 'beat',
    when: { minRank: 2, maxRank: 4 },
    after: 'beat-senior-warning',
    afterYears: 1,
    setFlags: ['story-predecessor'],
    text: '책상 서랍 안쪽에서 사원증이 나왔다. 전임자의 것이다. 사번의 앞자리가 내 것과 같았다. 사진 속 얼굴은 흐릿해서 누구인지 알 수 없었다.',
  },
  {
    id: 'beat-act1-close',
    kind: 'beat',
    when: { minRank: 3 },
    after: 'beat-predecessor-badge',
    afterYears: 1,
    setFlags: ['act1-done'],
    text: '이제는 알 것 같았다. 이 자리는 비어 있었던 것이 아니라 비워지고 있었다는 것을. 그래도 아침이 되면 사원증을 목에 걸었다. 그것 말고는 할 수 있는 일이 없었다.',
  },

  // ── 2막 ────────────────────────────────────────────
  {
    id: 'beat-map-pattern',
    kind: 'beat',
    when: { minRank: 3 },
    text: '객체들이 발견된 위치를 도면에 표시해 보았다. 모두 같은 방향, 지하 최하층 쪽으로 늘어서 있었다. 누군가 이미 그어 둔 선 위에 점을 찍고 있는 기분이었다.',
  },
  {
    id: 'beat-extra-floor',
    kind: 'beat',
    when: { minRank: 3, minAge: 33 },
    text: '본관 도면보다 지하층이 한 층 더 많다는 걸 알게 되었다. 아무도 그 층에 대해 묻지 않는다. 묻지 않는 것이 규칙처럼 보였다.',
  },
  {
    id: 'beat-predecessor-ledger',
    kind: 'beat',
    when: { minRank: 4 },
    priority: 1,
    text: '전임 책임자의 서랍에서 일지가 나왔다. 마지막 장은 비어 있고, 날짜만 적혀 있었다. 오늘 날짜였다.',
  },

  // ── 3막 ────────────────────────────────────────────
  {
    id: 'beat-elevator-button',
    kind: 'beat',
    when: { minRank: 5 },
    priority: 2,
    text: '수석 사원증으로만 눌리는 엘리베이터 버튼이 하나 생겼다. 층 표시는 없다. 눌러 보지는 않았다. 아직은.',
  },
  {
    id: 'beat-successor-list',
    kind: 'beat',
    when: { minRank: 5, minAge: 48 },
    text: '역대 수석 관리자들의 이름이 한 줄에 적힌 명단을 보았다. 이름은 모두 달랐고 필체는 모두 같았다. 마지막 칸은 비어 있었다.',
  },
  {
    id: 'beat-door-knocking',
    kind: 'beat',
    when: { minRank: 5, minAge: 55 },
    text: '밤이 되면 지하 어딘가에서 문을 두드리는 소리가 난다. 안쪽에서인지 바깥쪽에서인지 이제는 구분되지 않는다.',
  },

  // ── NPC 이야기의 여운 (선택으로 켜진 플래그에 따라) ──────────
  {
    id: 'beat-harin-secret',
    kind: 'beat',
    when: { flags: ['harin-secret'], minRank: 3 },
    priority: 2,
    text: '문하린 선임이 보여 준 노트의 마지막 줄이 자꾸 떠오른다. 이해했다고 생각하는 순간, 이해하지 못하는 편이 나았다는 것도 함께 이해했다.',
  },
  {
    id: 'beat-jian-left',
    kind: 'beat',
    when: { flags: ['jian-left'] },
    priority: 1,
    text: '서지안의 책상은 이제 비어 있다. 아무도 그 자리에 새 사람을 앉히지 않았다. 청소 담당만 매일 아침 그 의자를 조금 밀어 놓는다.',
  },
  {
    id: 'beat-jian-stays',
    kind: 'beat',
    when: { flags: ['jian-stays'] },
    priority: 1,
    text: '서지안은 아직 옆자리에 있다. 사직서를 쓴 일은 둘 다 꺼내지 않는다. 대신 컵라면을 하나씩 더 사 두는 사이가 되었다.',
  },
] satisfies FlowDef[]
