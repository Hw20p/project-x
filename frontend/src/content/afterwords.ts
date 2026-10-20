import type { AfterwordDef } from '../engine/afterword'

// 후일담: 종료 화면에서 에필로그 뒤에 붙는 짧은 글. 살아온 이력과 끝난 방식에 따라 그룹마다 한 줄씩 골라진다.
//   love       : 연인이었거나 친구로 남은 사람 (priority 높음) — 연인 플래그 jian-lover / harin-lover
//   npc        : 깊어졌거나 틀어진 관계 (관계 값 기준)
//   career     : 직급·나이에 따른 일 이야기
//   background : 입사 배경 (위 그룹이 비었을 때만 보인다 — 최대 3줄)
// 끝난 방식: endingKinds(사망·붕괴·해고·퇴직·천수·최종 객체), endingIds(최종 객체의 엔딩: succession·walkaway·sealed·opened·answered).
// 새 후일담을 쓰려면 이 목록에 항목만 더하면 된다.
const SURFACE = ['succession', 'walkaway']
const VANISHED = ['opened', 'answered']

export const afterwords: AfterwordDef[] = [
  // ── 서지안과 연인이었다 ────────────────────────────
  {
    id: 'aw-jian-lover-surface',
    group: 'love',
    priority: 10,
    when: { flags: ['jian-lover'], endingIds: SURFACE },
    text: '서지안은 지상의 정문 앞에서 기다리고 있었다. 우산은 하나였다. 비는 오지 않았다.',
  },
  {
    id: 'aw-jian-lover-sealed',
    group: 'love',
    priority: 10,
    when: { flags: ['jian-lover'], endingIds: ['sealed'] },
    text: '서지안은 매일 도시락을 문 앞 의자 옆에 두고 갔다. 빈 도시락통은 다음 날 아침 가지런히 놓여 있었다.',
  },
  {
    id: 'aw-jian-lover-vanished',
    group: 'love',
    priority: 10,
    when: { flags: ['jian-lover'], endingIds: VANISHED },
    text: '서지안은 한참 당신의 자리를 정리하지 못했다. 사원증 목끈만 서랍에 남았고, 서지안은 그것을 매일 한 번씩 고쳐 맸다.',
  },
  {
    id: 'aw-jian-lover-death',
    group: 'love',
    priority: 10,
    when: { flags: ['jian-lover'], endingKinds: ['death'] },
    text: '서지안은 장례식에 우산을 하나만 들고 왔다. 비는 오지 않았는데도 끝내 접지 않았다.',
  },
  {
    id: 'aw-jian-lover-breakdown',
    group: 'love',
    priority: 10,
    when: { flags: ['jian-lover'], endingKinds: ['breakdown'] },
    text: '서지안은 면회 신청서를 매달 같은 날 냈다. 반려될 것을 알면서도 이름은 또박또박 적었다.',
  },
  {
    id: 'aw-jian-lover-other',
    group: 'love',
    priority: 9,
    when: { flags: ['jian-lover'], endingKinds: ['retired', 'dismissed', 'longevity'] },
    text: '서지안과는 퇴근길이 여전히 같았다. 말은 없어도 되었다.',
  },

  // ── 문하린과 연인이었다 ────────────────────────────
  {
    id: 'aw-harin-lover-surface',
    group: 'love',
    priority: 10,
    when: { flags: ['harin-lover'], endingIds: SURFACE },
    text: '문하린은 지워진 줄 옆에 작은 점을 하나 더 찍었다. 두 개의 점은 같은 높이에 놓였다.',
  },
  {
    id: 'aw-harin-lover-sealed',
    group: 'love',
    priority: 10,
    when: { flags: ['harin-lover'], endingIds: ['sealed'] },
    text: '문하린은 매일 문 앞의 의자 곁을 지나며 일지를 한 줄씩 소리 내어 읽어 주었다.',
  },
  {
    id: 'aw-harin-lover-vanished',
    group: 'love',
    priority: 10,
    when: { flags: ['harin-lover'], endingIds: VANISHED },
    text: '문하린의 노트에서 당신의 이름은 지워지지 않았다. 지울 수 있는 연필로 적었는데도.',
  },
  {
    id: 'aw-harin-lover-death',
    group: 'love',
    priority: 10,
    when: { flags: ['harin-lover'], endingKinds: ['death'] },
    text: '문하린은 관찰 기록의 마지막 장을 비워 두었다. 누가 물으면 아직 쓰는 중이라고 했다.',
  },
  {
    id: 'aw-harin-lover-breakdown',
    group: 'love',
    priority: 10,
    when: { flags: ['harin-lover'], endingKinds: ['breakdown'] },
    text: '문하린은 격리 구역 앞에서 매뉴얼의 지워진 줄을 낮게 읽었다. 안쪽에서 같은 박자의 대답이 돌아왔다.',
  },
  {
    id: 'aw-harin-lover-other',
    group: 'love',
    priority: 9,
    when: { flags: ['harin-lover'], endingKinds: ['retired', 'dismissed', 'longevity'] },
    text: '문하린은 퇴근길에 노트를 한 번 건네고 갔다. 읽으라는 뜻이었다.',
  },

  // ── 고백이 닿지 않았지만 곁에 남은 사람 ────────────
  {
    id: 'aw-jian-friends',
    group: 'love',
    priority: 5,
    when: { flags: ['jian-friends'], notFlags: ['jian-lover', 'harin-lover'] },
    text: '서지안과는 끝까지 좋은 동료로 남았다. 그 마음이 어떤 이름이었는지는 서로 묻지 않았다.',
  },
  {
    id: 'aw-harin-friends',
    group: 'love',
    priority: 5,
    when: { flags: ['harin-friends'], notFlags: ['jian-lover', 'harin-lover'] },
    text: '문하린은 그 뒤로도 가끔 서류 한 장을 책상에 두고 갔다. 같은 높이로, 같은 말 없이.',
  },

  // ── 사람들 ─────────────────────────────────────────
  {
    id: 'aw-jian-letter',
    group: 'npc',
    priority: 7,
    when: { flags: ['jian-left'], relations: { jian: { min: 10 } } },
    text: '서지안의 편지는 해마다 한 통씩 왔다. “창문이 있어요.” 늘 같은 문장이었다.',
  },
  {
    id: 'aw-jian-close',
    group: 'npc',
    priority: 6,
    when: { relations: { jian: { min: 30 } }, notFlags: ['jian-left', 'jian-lover'] },
    text: '서지안은 마지막까지 옆자리를 비워 두지 않았다. 새 사람이 와도 그 자리의 컵은 그대로였다.',
  },
  {
    id: 'aw-taeseong-close',
    group: 'npc',
    priority: 6,
    when: { relations: { taeseong: { min: 30 } } },
    text: '오태성 팀장은 당신의 사원증을 책상 서랍에 오래 보관했다. 서랍을 열 때마다 닫는 소리는 조용했다.',
  },
  {
    id: 'aw-harin-close',
    group: 'npc',
    priority: 6,
    when: { relations: { harin: { min: 30 } }, notFlags: ['harin-lover'] },
    text: '문하린은 매뉴얼의 지워진 줄 옆에 작은 점을 하나 찍었다. 읽으라는 뜻인지 기억하라는 뜻인지는 적지 않았다.',
  },
  {
    id: 'aw-jian-cold',
    group: 'npc',
    priority: 5,
    when: { relations: { jian: { max: -10 } } },
    text: '서지안은 당신의 소식을 끝내 묻지 않았다. 묻지 않는 것이 대답이었다.',
  },
  {
    id: 'aw-taeseong-cold',
    group: 'npc',
    priority: 5,
    when: { relations: { taeseong: { max: -10 } } },
    text: '인사 기록의 당신 이름 옆에는 팀장의 짧은 메모 한 줄만 남았다. “규정대로.”',
  },
  {
    id: 'aw-harin-cold',
    group: 'npc',
    priority: 5,
    when: { relations: { harin: { max: -10 } } },
    text: '문하린의 노트에서 당신에 관한 장은 조용히 찢겨 있었다.',
  },

  // ── 일 ─────────────────────────────────────────────
  {
    id: 'aw-career-young',
    group: 'career',
    priority: 9,
    when: { endingKinds: ['death', 'breakdown'], maxAge: 32 },
    text: '당신은 아직 젊었다. 비어 버린 자리에는 한동안 새 사원증이 놓이지 않았다.',
  },
  {
    id: 'aw-career-top',
    group: 'career',
    priority: 8,
    when: { minRank: 5 },
    text: '당신은 수석으로 기록되었다. 서명란의 맨 위에 이름을 쓰는 사람이 되었다는 뜻이다. 아무도 그 자리가 몇 번째였는지는 세지 않았다.',
  },
  {
    id: 'aw-career-stuck',
    group: 'career',
    priority: 8,
    when: { maxRank: 2, minAge: 40 },
    text: '끝내 사원증의 직급은 크게 바뀌지 않았다. 서랍 속 사원증 사진만 해마다 조금씩 낡았다.',
  },
  {
    id: 'aw-career-old',
    group: 'career',
    priority: 7,
    when: { endingKinds: ['death'], minAge: 80 },
    text: '당신은 끝까지 출근 시각을 지켰다. 지각 기록이 없는 사람은 시설에 몇 명 되지 않았다.',
  },

  // ── 입사 배경 (위 그룹이 비었을 때만 보인다) ─────────
  {
    id: 'aw-bg-researcher',
    group: 'background',
    when: { backgrounds: ['researcher'] },
    text: '연구소 시절의 옛 동료가 어느 논문의 각주에서 당신의 이름을 찾아냈다. 각주는 짧았다.',
  },
  {
    id: 'aw-bg-field',
    group: 'background',
    when: { backgrounds: ['field'] },
    text: '시설 외곽 경비 초소의 의자는 당신이 앉던 높이 그대로였다. 아무도 높이를 바꾸지 않았다.',
  },
  {
    id: 'aw-bg-office',
    group: 'background',
    when: { backgrounds: ['office'] },
    text: '본사 행정팀의 서류함에는 당신이 쓴 마지막 보고서가 분류되지 않은 채 남아 있었다.',
  },
]
