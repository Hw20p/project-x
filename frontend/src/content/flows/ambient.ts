import type { FlowDef } from '../../engine/types'

// 일상 서술: 해가 바뀔 때마다 현재 상태에 맞는 문장이 하나씩 흘러간다 (반복 가능, 최근에 나온 문장은 피함).
// 조건이 많이 맞는 문장일수록 더 자주 나온다 — 정신력이 낮으면 불안한 문장, 친한 NPC가 있으면 그 사람 문장이 많이 보인다.
// 문장 안의 {age}(나이), {rank}(직급명), {object}(관리 중인 객체 이름), {background}(입사 배경 이름)는 자동으로 채워진다.
export default [
  // ── 어느 때나 ──────────────────────────────────────
  { id: 'amb-lift', kind: 'ambient', text: '아침 엘리베이터는 어제와 같은 속도로 내려갔다. 어제와 같다는 것이 이상하게 느껴졌다.' },
  { id: 'amb-coffee', kind: 'ambient', text: '구내 자판기의 커피는 오늘도 한 모금만 따뜻했다.' },
  { id: 'amb-logbook', kind: 'ambient', text: '일지에 “이상 없음”이라고 쓰는 손이 점점 빨라진다.' },
  { id: 'amb-light', kind: 'ambient', text: '복도 형광등 하나가 며칠째 깜빡인다. 교체 요청서는 늘 “확인 중”이다.' },
  { id: 'amb-weather', kind: 'ambient', text: '지상에는 비가 왔다고 한다. 지하에서는 알 수 없었다.' },
  { id: 'amb-badge', kind: 'ambient', text: '사원증을 찍는 소리가 하루에 몇 번인지 세어 보다가 그만두었다.' },
  { id: 'amb-cafeteria', kind: 'ambient', text: '구내식당 메뉴는 매주 같은 순서로 돌아온다. 돌아온다는 사실이 안심이 되는 날과 아닌 날이 있다.' },
  { id: 'amb-calendar', kind: 'ambient', text: '달력을 넘겼다. 넘긴 장이 생각보다 얇았다.' },
  { id: 'amb-night', kind: 'ambient', text: '야근하는 밤의 건물은 낮보다 조금 더 넓다.' },
  { id: 'amb-shoes', kind: 'ambient', text: '구두 밑창이 닳았다. 이 건물은 걷는 사람을 닳게 한다.' },

  // ── 정신력이 낮을 때 ───────────────────────────────
  { id: 'amb-low-sanity-1', kind: 'ambient', when: { stats: { sanity: { max: 35 } } }, text: '복도의 불빛이 한 칸 늘어난 것 같다. 세어 보면 같은 개수인데.' },
  { id: 'amb-low-sanity-2', kind: 'ambient', when: { stats: { sanity: { max: 35 } } }, text: '내 이름을 부르는 소리가 났다. 돌아보니 아무도 없었다. 당신은 그 이름이 맞는지 한참 생각했다.' },
  { id: 'amb-low-sanity-3', kind: 'ambient', when: { stats: { sanity: { max: 35 } } }, text: '잠이 얕다. 꿈에서도 일지를 쓰고 있다.' },
  { id: 'amb-low-sanity-4', kind: 'ambient', when: { stats: { sanity: { max: 35 } } }, text: '거울 속의 얼굴이 하루 늦게 따라 움직이는 듯한 날이 있다.' },
  { id: 'amb-low-sanity-5', kind: 'ambient', when: { stats: { sanity: { max: 35 } } }, text: '점심을 먹었는지 기억나지 않는다. 식권은 사라져 있었다.' },
  { id: 'amb-low-sanity-6', kind: 'ambient', when: { stats: { sanity: { max: 35 } } }, text: '벽에 귀를 대면 먼 데서 숫자를 세는 소리가 났다.' },

  // ── 정신력이 높을 때 ───────────────────────────────
  { id: 'amb-high-sanity-1', kind: 'ambient', when: { stats: { sanity: { min: 70 } } }, text: '오랜만에 잠을 푹 잤다. 꿈이 없었다는 사실이 오히려 낯설었다.' },
  { id: 'amb-high-sanity-2', kind: 'ambient', when: { stats: { sanity: { min: 70 } } }, text: '점심시간에 건물 밖 벤치에 앉았다. 하늘이 생각보다 낮았다.' },
  { id: 'amb-high-sanity-3', kind: 'ambient', when: { stats: { sanity: { min: 70 } } }, text: '복도의 불빛은 어제와 같은 개수였다. 오늘은 그게 당연하게 느껴졌다.' },

  // ── 체력이 낮을 때 ─────────────────────────────────
  { id: 'amb-low-health-1', kind: 'ambient', when: { stats: { health: { max: 35 } } }, text: '계단이 이전보다 길다. 층 수는 그대로인데 숨이 먼저 찬다.' },
  { id: 'amb-low-health-2', kind: 'ambient', when: { stats: { health: { max: 35 } } }, text: '손끝이 자꾸 차갑다. 건강검진 결과표의 노란 표시가 하나 늘었다.' },
  { id: 'amb-low-health-3', kind: 'ambient', when: { stats: { health: { max: 35 } } }, text: '아침마다 몸이 하루치 더 무거워져 있다.' },
  { id: 'amb-low-health-4', kind: 'ambient', when: { stats: { health: { max: 35 } } }, text: '의무실 간호사가 말없이 비타민을 한 통 건넸다.' },

  // ── 나이 ───────────────────────────────────────────
  { id: 'amb-age-30-1', kind: 'ambient', when: { minAge: 30, maxAge: 35 }, text: '서른이 넘었다. 사원증 사진 속 얼굴은 입사 때 그대로인데, 목에 건 사람만 나이를 먹는다.' },
  { id: 'amb-age-30-2', kind: 'ambient', when: { minAge: 30, maxAge: 35 }, text: '동기들의 청첩장이 한 장 도착했다. 휴가를 낼 수 있을지 확인해 보지 않았다.' },
  { id: 'amb-age-40-1', kind: 'ambient', when: { minAge: 40 }, text: '새치가 늘었다. 이 건물에서 나이를 먹는 일은 생각보다 조용하다.' },
  { id: 'amb-age-40-2', kind: 'ambient', when: { minAge: 40 }, text: '건강검진 결과표를 읽는 일이 일상이 되었다.' },
  { id: 'amb-age-50-1', kind: 'ambient', when: { minAge: 50 }, text: '후배들이 이름 대신 직함으로 부른다. 편하다고 생각하려 한다.' },
  { id: 'amb-age-50-2', kind: 'ambient', when: { minAge: 50 }, text: '오래 근무한 사람의 얼굴은 건물을 닮아 간다는 말을 들었다.' },
  { id: 'amb-age-50-3', kind: 'ambient', when: { minAge: 50 }, text: '퇴직 연금 안내문이 도착했다. 퇴직이라는 단어가 낯설게 느껴졌다.' },
  { id: 'amb-age-60-1', kind: 'ambient', when: { minAge: 60 }, text: '계단 대신 엘리베이터만 타게 되었다. 엘리베이터는 한 번도 불평하지 않는다.' },
  { id: 'amb-age-60-2', kind: 'ambient', when: { minAge: 60 }, text: '이제는 오래된 일지를 들춰 보는 날이 많다. 같은 필체가 여러 해에 걸쳐 있다.' },
  { id: 'amb-age-60-3', kind: 'ambient', when: { minAge: 60 }, text: '창이 없는 사무실에서 계절을 가늠하는 법을 잊어 간다.' },

  // ── 직급 ───────────────────────────────────────────
  { id: 'amb-rank1-1', kind: 'ambient', when: { maxRank: 1 }, text: '신입이라서 눈치껏 커피를 돌렸다. 아무도 마시지 않은 잔이 하나 남았다.' },
  { id: 'amb-rank1-2', kind: 'ambient', when: { maxRank: 1 }, text: '선임들은 객체 이야기가 나오면 화제를 돌린다. 서둘러 배워야 할 것은 화제를 돌리는 방법일지도 모른다.' },
  { id: 'amb-rank1-3', kind: 'ambient', when: { maxRank: 1 }, text: '매뉴얼의 지워진 줄을 한 번 더 읽었다. 지운 사람의 손자국이 아직 선명했다.' },
  { id: 'amb-rank1-4', kind: 'ambient', when: { maxRank: 1 }, text: '첫 월급 명세서의 공제 항목에 “관리 보존비”가 있었다. 무엇을 보존하는지는 적혀 있지 않았다.' },
  { id: 'amb-rank1-5', kind: 'ambient', when: { maxRank: 1 }, text: '식당에서 선임이 숟가락을 놓는 순서를 따라 했다. 이유는 아무도 알려 주지 않았고, 아무도 틀렸다고 하지 않았다.' },
  { id: 'amb-rank1-6', kind: 'ambient', when: { maxRank: 1 }, text: '근무복 소매가 조금 길다. 전에 입던 사람의 치수라고 했다. 그 사람의 이름은 아무도 말하지 않았다.' },
  { id: 'amb-rank1-7', kind: 'ambient', when: { maxRank: 1 }, text: '출입 단말기는 출근 시각 옆에 빈칸을 하나 더 남긴다. 무엇을 적는 칸인지 아직 모른다.' },
  { id: 'amb-rank2-3', kind: 'ambient', when: { minRank: 2, maxRank: 2 }, text: '입사 동기 한 명이 보이지 않는다. 휴가 중이라고 했지만 사물함의 이름표는 떼어져 있었다.' },
  { id: 'amb-rank2-4', kind: 'ambient', when: { minRank: 2, maxRank: 2 }, text: '후임이 첫 보고서를 들고 왔다. 내 첫 보고서와 같은 오타가 같은 자리에 있었다.' },
  { id: 'amb-rank2-5', kind: 'ambient', when: { minRank: 2, maxRank: 2 }, text: '야간 순찰 경로가 한 칸 바뀌었다. 바뀐 이유를 적은 공문은 없었다.' },
  { id: 'amb-rank2-6', kind: 'ambient', when: { minRank: 2, maxRank: 2 }, text: '구내 서점에서 산 건물 안내서의 마지막 쪽이 찢겨 있었다. 찢은 사람은 어느 쪽으로 걸어갔을까.' },
  { id: 'amb-rank2-1', kind: 'ambient', when: { minRank: 2, maxRank: 2 }, text: '이제 후임에게 비상구 위치를 설명하는 쪽이 되었다. 세 번 말하는 이유를 알 것 같았다.' },
  { id: 'amb-rank2-2', kind: 'ambient', when: { minRank: 2, maxRank: 2 }, text: '승급 뒤에도 일지의 형식은 그대로다. 달라진 것은 서명란의 위치뿐이다.' },
  { id: 'amb-rank3-1', kind: 'ambient', when: { minRank: 3, maxRank: 3 }, text: '{rank}이 되자 회의에서 먼저 질문하는 사람이 되었다. 대답은 늘 나중에, 다른 사람에게서 왔다.' },
  { id: 'amb-rank3-2', kind: 'ambient', when: { minRank: 3, maxRank: 3 }, text: '객체 번호가 머릿속에서 사람 이름처럼 외워지기 시작했다.' },
  { id: 'amb-rank4-1', kind: 'ambient', when: { minRank: 4, maxRank: 4 }, text: '책임자의 책상은 생각보다 비어 있다. 무엇을 올려도 곧 서류에 묻힌다.' },
  { id: 'amb-rank4-2', kind: 'ambient', when: { minRank: 4, maxRank: 4 }, text: '책임이 되자 신입들이 먼저 길을 비켜 준다. 이유를 알 것 같아 마음이 편치 않았다.' },
  { id: 'amb-rank5-1', kind: 'ambient', when: { minRank: 5 }, text: '수석의 사무실에는 창이 없고 대신 시계가 두 개 걸려 있다. 어느 쪽이 맞는지는 묻지 않았다.' },
  { id: 'amb-rank5-2', kind: 'ambient', when: { minRank: 5 }, text: '수석이 되자 아무도 당신에게 업무를 설명하지 않는다. 설명할 것이 남아 있지 않다는 뜻이길 바란다.' },
  { id: 'amb-rank5-3', kind: 'ambient', when: { minRank: 5 }, text: '이제 당신의 결재 서류를 확인하는 사람이 없다. 그게 가장 무서웠다.' },

  // ── NPC와의 관계 ───────────────────────────────────
  { id: 'amb-jian-close-1', kind: 'ambient', when: { relations: { jian: { min: 10 } } }, text: '서지안이 옆자리에서 컵라면을 먹고 있다. 이쪽 몫도 하나 놓여 있었다.' },
  { id: 'amb-jian-close-2', kind: 'ambient', when: { relations: { jian: { min: 10 } } }, text: '퇴근길에 서지안과 나란히 걸었다. 말은 없었다. 말이 없어도 되는 사이였다.' },
  { id: 'amb-jian-cold-1', kind: 'ambient', when: { relations: { jian: { max: -10 } } }, text: '서지안과는 복도에서 마주쳐도 인사만 한다. 그 인사가 점점 짧아진다.' },
  { id: 'amb-jian-cold-2', kind: 'ambient', when: { relations: { jian: { max: -10 } } }, text: '서지안이 다른 사람과 웃는 소리가 칸막이 너머로 들렸다.' },
  { id: 'amb-taeseong-close-1', kind: 'ambient', when: { relations: { taeseong: { min: 10 } } }, text: '오태성 팀장이 지나가다가 어깨를 한 번 두드렸다. 말은 하지 않았다.' },
  { id: 'amb-taeseong-close-2', kind: 'ambient', when: { relations: { taeseong: { min: 10 } } }, text: '팀장이 회의에서 당신의 보고를 그대로 인용했다.' },
  { id: 'amb-taeseong-cold-1', kind: 'ambient', when: { relations: { taeseong: { max: -10 } } }, text: '팀장의 결재가 이번에도 하루 늦게 내려왔다.' },
  { id: 'amb-taeseong-cold-2', kind: 'ambient', when: { relations: { taeseong: { max: -10 } } }, text: '회의에서 팀장의 시선이 당신을 건너뛰었다.' },
  { id: 'amb-harin-close-1', kind: 'ambient', when: { relations: { harin: { min: 10 } } }, text: '문하린 선임이 지나가며 책상에 서류 한 장을 두고 갔다. 매뉴얼의 빠진 줄을 설명하는 메모였다.' },
  { id: 'amb-harin-close-2', kind: 'ambient', when: { relations: { harin: { min: 10 } } }, text: '선임이 복도 끝에서 눈을 맞추고 고개를 한 번 끄덕였다.' },
  { id: 'amb-harin-cold-1', kind: 'ambient', when: { relations: { harin: { max: -10 } } }, text: '문하린 선임은 이제 매뉴얼 이야기를 꺼내지 않는다.' },

  // ── 입사 배경 ──────────────────────────────────────
  { id: 'amb-bg-researcher-1', kind: 'ambient', when: { backgrounds: ['researcher'] }, text: '연구소 시절의 습관으로 기록부터 확인한다. 이 건물에서는 기록이 늘 한 박자 늦다.' },
  { id: 'amb-bg-researcher-2', kind: 'ambient', when: { backgrounds: ['researcher'] }, text: '논문 대신 일지를 쓴다. 인용할 수 있는 출처가 점점 줄어든다.' },
  { id: 'amb-bg-field-1', kind: 'ambient', when: { backgrounds: ['field'] }, text: '현장에서 몸에 익은 습관으로 출구부터 확인한다. 이 건물의 출구는 날마다 위치가 조금 다르다.' },
  { id: 'amb-bg-field-2', kind: 'ambient', when: { backgrounds: ['field'] }, text: '무거운 문을 밀 때마다 외곽 초소에서 듣던 바람 소리가 생각난다.' },
  { id: 'amb-bg-office-1', kind: 'ambient', when: { backgrounds: ['office'] }, text: '결재 서류를 쓰던 버릇으로 문장을 다듬는다. “이상 없음”은 쓸수록 길어진다.' },
  { id: 'amb-bg-office-2', kind: 'ambient', when: { backgrounds: ['office'] }, text: '본사 동기의 안부 메일이 왔다. 답장은 짧게 썼다. 길게 쓰면 쓰지 말아야 할 말이 섞일 것 같았다.' },

  // ── 지금 관리 중인 객체 ────────────────────────────
  { id: 'amb-object-tier1', kind: 'ambient', when: { objectTiers: [1] }, text: '수습의 일은 대개 기록하고 물러서는 것이다. 물러서는 것이 가장 어렵다.' },
  { id: 'amb-object-tier5', kind: 'ambient', when: { objectTiers: [5] }, text: '5급 객체 앞에서는 선임들도 말수가 줄어든다.' },
  { id: 'amb-object-notes', kind: 'ambient', when: { objectTiers: [1, 2, 3, 4, 5] }, text: '{object}의 관리 기록이 책상 위에 쌓여 있다. 쌓일수록 한 장씩 더 가벼워지는 것 같다.' },
  { id: 'amb-object-dream', kind: 'ambient', when: { objectTiers: [1, 2, 3, 4, 5], stats: { sanity: { max: 60 } } }, text: '{object}를 생각하며 잠들었고, 깨어서도 같은 생각이었다.' },
] satisfies FlowDef[]
