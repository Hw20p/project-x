import type { InterludeDef } from '../../engine/types'

// 회복 이벤트: 주로 정신력을 채워 준다. 정신력이 낮을수록 더 자주 나온다.
export default [
  {
    id: 'rec-vacation',
    kind: 'recovery',
    title: '휴가',
    text: '연차가 쌓이다 못해 인사팀에서 직접 연락이 왔다. 일주일이라도 다녀오라는 것이다.',
    cooldownYears: 8,
    choices: [
      {
        id: 'sea',
        text: '바닷가로 간다',
        story: '기차를 갈아타며 바다 쪽으로 향했다. 사원증은 가방 가장 깊은 곳에 넣어 두었다.',
        risk: 1,
        baseChance: 0.92,
        statWeights: { health: 0.002 },
        success: {
          text: '파도 소리가 규칙적이었다. 어느 것도 이름을 부르지 않았다. 사흘째부터 잠을 푹 잤다.',
          effects: { sanity: 14, health: 4 },
        },
        failure: {
          kind: 'setback',
          text: '바다는 평범했다. 다만 돌아오는 길에 해가 지는 방향이 어제와 달랐던 것 같다.',
          effects: { sanity: 5 },
        },
      },
      {
        id: 'home',
        text: '집에서 아무것도 하지 않는다',
        story: '전화기를 끄고 커튼을 쳤다. 일정표에 적힌 것은 한 줄도 없었다.',
        risk: 1,
        baseChance: 0.95,
        success: {
          text: '이틀은 잤고 하루는 천장을 봤다. 괜찮았다.',
          effects: { sanity: 9 },
        },
        failure: {
          kind: 'setback',
          text: '집이 이상하게 조용해서 오히려 쉬지 못했다.',
          effects: { sanity: 2 },
        },
      },
      {
        id: 'work-trip',
        text: '쉬는 척하며 자료를 챙겨 간다',
        story: '가방 한쪽에 자료철을 슬쩍 밀어 넣었다. 쉬러 가는 것이라고 스스로에게 두 번 말했다.',
        risk: 2,
        baseChance: 0.7,
        statWeights: { knowledge: 0.003 },
        success: {
          text: '숙소에서 읽은 자료가 의외로 머리에 잘 들어왔다.',
          effects: { knowledge: 5, sanity: 4, reputation: 2 },
        },
        failure: {
          kind: 'setback',
          text: '자료의 한 줄이 밤새 머릿속을 맴돌았다.',
          effects: { sanity: -4 },
        },
      },
    ],
  },
  {
    id: 'rec-counseling',
    kind: 'recovery',
    title: '사내 상담',
    text: '정신건강 상담실에서 정기 면담 안내가 왔다. 의무는 아니다. 의무가 아니라는 말이 오히려 의무처럼 들린다.',
    when: { stats: { sanity: { max: 55 } } },
    choices: [
      {
        id: 'open-up',
        text: '있는 그대로 털어놓는다',
        story: '상담실 의자에 앉아 숨을 한 번 고르고 입을 열었다. 어디까지 말해도 되는지는 따지지 않기로 했다.',
        risk: 2,
        baseChance: 0.65,
        statWeights: { sanity: 0.003, reputation: 0.002 },
        success: {
          text: '상담사는 메모를 하지 않고 끝까지 들었다. 나올 때 어깨가 가벼웠다.',
          effects: { sanity: 16 },
        },
        failure: {
          kind: 'setback',
          text: '말을 하다 보니 객체 이야기가 나왔다. 상담사의 표정이 굳었다. 기록에는 “면담 종료”라고만 적혔다.',
          effects: { sanity: -6, reputation: -2 },
        },
      },
      {
        id: 'formal',
        text: '형식적으로 답하고 나온다',
        story: '질문마다 준비해 둔 답을 꺼냈다. 시계를 몇 번 흘끗거리며 시간을 채웠다.',
        risk: 1,
        baseChance: 0.9,
        success: {
          text: '적당히 답하고 나왔다. 그것만으로도 한 시간은 쉬었다.',
          effects: { sanity: 5 },
        },
        failure: {
          kind: 'setback',
          text: '“별일 없으시죠?”라는 질문에 별일 없다고 답하는 것이 이상하게 힘들었다.',
          effects: { sanity: -2 },
        },
      },
    ],
  },
  {
    id: 'rec-walk',
    kind: 'recovery',
    title: '새벽 산책',
    text: '잠이 오지 않는 새벽이다. 사원증을 목에 건 채로 건물 밖으로 나왔다.',
    cooldownYears: 4,
    choices: [
      {
        id: 'around-block',
        text: '건물 주변만 한 바퀴 돈다',
        story: '사원증을 고쳐 매고 건물 담을 따라 걷기 시작했다. 가로등 간격을 마음속으로 세었다.',
        risk: 1,
        baseChance: 0.95,
        success: {
          text: '가로등 아래 같은 자리에 같은 나방이 있었다. 이상하게 안심이 됐다.',
          effects: { sanity: 6, health: 2 },
        },
        failure: {
          kind: 'setback',
          text: '한 바퀴가 생각보다 길었다. 같은 모퉁이를 두 번 돌았다.',
          effects: { sanity: 1 },
        },
      },
      {
        id: 'far',
        text: '멀리까지 걸어간다',
        story: '출입구를 지나 큰길 쪽으로 방향을 틀었다. 돌아갈 시각은 정하지 않았다.',
        risk: 2,
        baseChance: 0.68,
        statWeights: { health: 0.003, sanity: 0.002 },
        success: {
          text: '동이 틀 때까지 걸었다. 돌아왔을 때는 세상이 조금 평범해 보였다.',
          effects: { sanity: 11, health: 3 },
        },
        failure: {
          kind: 'setback',
          text: '돌아오는 길을 한 번 잃었다. 날이 밝아서야 건물이 보였다.',
          effects: { sanity: -5, health: -2 },
        },
      },
    ],
  },
  {
    id: 'rec-family',
    kind: 'recovery',
    title: '고향 집',
    text: '명절이다. 가족들은 당신이 무슨 일을 하는지 묻지 않는다. 그게 서로를 위한 일이라는 걸 모두 알고 있다.',
    when: { minAge: 24 },
    cooldownYears: 8,
    choices: [
      {
        id: 'stay-long',
        text: '오래 머물며 식사를 함께 한다',
        story: '짐을 풀고 소매를 걷어 부엌일을 거들었다. 휴대전화는 서랍 안에 넣어 두었다.',
        risk: 1,
        baseChance: 0.9,
        success: {
          text: '낡은 식탁 위로 오래된 이야기가 오갔다. 아무도 객체에 대해 묻지 않았다.',
          effects: { sanity: 11, health: 2 },
        },
        failure: {
          kind: 'setback',
          text: '식사 도중 걸려 온 전화에 자리를 떠야 했다. 가족들은 이해하는 얼굴을 했다. 그게 더 무거웠다.',
          effects: { sanity: 2, reputation: 2 },
        },
      },
      {
        id: 'short',
        text: '잠깐 얼굴만 비추고 돌아온다',
        story: '현관에서 신발도 다 벗지 않고 안부를 건넸다. 시계를 보는 일은 가족도 모른 척해 주었다.',
        risk: 1,
        baseChance: 0.95,
        success: {
          text: '현관 앞에서 건네받은 반찬통이 따뜻했다.',
          effects: { sanity: 5 },
        },
        failure: {
          kind: 'setback',
          text: '돌아오는 열차에서 오래 창밖을 봤다.',
          effects: { sanity: 1 },
        },
      },
    ],
  },
  {
    id: 'rec-sleep',
    kind: 'recovery',
    title: '수면 클리닉',
    text: '며칠째 같은 꿈을 꾼다. 내용은 기억나지 않는데 깨어나면 입에서 낯선 단어가 맴돈다.',
    when: { stats: { sanity: { max: 45 } } },
    choices: [
      {
        id: 'clinic',
        text: '사내 수면 클리닉에 간다',
        story: '수면 클리닉 접수대에서 이름과 사번을 적었다. 이마에 붙인 전극이 차가웠다.',
        risk: 1,
        baseChance: 0.88,
        success: {
          text: '검사 결과는 정상이었다. 처방받은 약은 꿈 없는 잠을 주었다.',
          effects: { sanity: 13, health: 3 },
        },
        failure: {
          kind: 'setback',
          text: '검사 중 모니터에 이상한 파형이 잠깐 찍혔다. 의사는 장비 문제라고 했다.',
          effects: { sanity: -3 },
        },
      },
      {
        id: 'dream-journal',
        text: '꿈 일지를 쓰며 단어를 기록한다',
        story: '머리맡에 노트와 펜을 놓고 잤다. 깨자마자 입속에 맴도는 단어를 받아 적었다.',
        risk: 3,
        baseChance: 0.5,
        statWeights: { knowledge: 0.004, sanity: 0.004 },
        success: {
          text: '단어들을 모아 보니 어느 객체의 관찰 기록과 일치했다. 이유 없이 안도했다.',
          effects: { sanity: 8, knowledge: 8 },
        },
        failure: {
          kind: 'setback',
          text: '일지의 단어가 하루 사이 늘어 있었다.',
          effects: { sanity: -9 },
        },
      },
    ],
  },
  {
    id: 'rec-roof',
    kind: 'recovery',
    title: '옥상 정원',
    text: '본관 옥상에 아무도 돌보지 않는 화단이 있다. 점심시간에 올라가 보니 흙이 말라 있고, 난간 너머로 지상의 하늘이 보인다.',
    cooldownYears: 6,
    choices: [
      {
        id: 'water-plants',
        text: '화단에 물을 준다',
        story: '주전자를 들고 옥상 수도로 향했다. 마른 흙이 보이는 화단 앞에 쭈그려 앉았다.',
        risk: 1,
        baseChance: 0.92,
        success: {
          text: '흙이 젖는 소리가 났다. 이름 모를 풀이 한 뼘 자라 있었다.',
          effects: { sanity: 12 },
        },
        failure: {
          kind: 'setback',
          text: '주전자가 비어 있었다. 화단은 이미 젖어 있었다.',
          effects: { sanity: 4 },
        },
      },
      {
        id: 'look-sky',
        text: '난간에 기대어 하늘을 본다',
        story: '난간 앞에 서서 팔꿈치를 걸쳤다. 점심시간이 끝나는 종은 못 들은 척했다.',
        risk: 1,
        baseChance: 0.9,
        success: {
          text: '구름이 움직였다. 움직인다는 것이 그렇게 위로가 될 줄 몰랐다.',
          effects: { sanity: 10, health: 2 },
        },
        failure: {
          kind: 'setback',
          text: '하늘이 낮게 느껴져 오래 쳐다보지 못했다.',
          effects: { sanity: 3 },
        },
      },
      {
        id: 'count-windows',
        text: '건물 창문의 수를 세어 본다',
        story: '난간에 기대어 본관의 창을 한 줄씩 세기 시작했다. 손가락을 접으며 숫자를 입속으로 굴렸다.',
        risk: 3,
        baseChance: 0.5,
        statWeights: { knowledge: 0.004, sanity: 0.003 },
        success: {
          text: '지상 창문의 수가 지하 도면의 층 수와 맞았다. 맞는다는 사실이 이렇게 반가울 줄은 몰랐다.',
          effects: { sanity: 8, knowledge: 6 },
        },
        failure: {
          kind: 'setback',
          text: '세는 도중 창 하나가 먼저 꺼졌다.',
          effects: { sanity: -5 },
        },
      },
    ],
  },
  {
    id: 'rec-radio',
    kind: 'recovery',
    title: '낡은 라디오',
    text: '휴게실 선반의 낡은 라디오에서 모르는 노래가 흘러나온다. 전원 표시등은 꺼져 있다.',
    cooldownYears: 7,
    when: { stats: { sanity: { max: 65 } } },
    choices: [
      {
        id: 'listen',
        text: '끝까지 듣는다',
        story: '휴게실 의자를 끌어당겨 라디오 앞에 앉았다. 노래가 끝날 때까지 자리를 뜨지 않기로 했다.',
        risk: 2,
        baseChance: 0.75,
        statWeights: { sanity: 0.003 },
        success: {
          text: '가사는 알 수 없었지만 후렴만은 어릴 적에 들은 것 같았다. 눈을 뜨자 방이 조금 밝아져 있었다.',
          effects: { sanity: 11 },
        },
        failure: {
          kind: 'setback',
          text: '노래가 끝나자 라디오는 꺼져 있었다. 전원 코드는 뽑혀 있었다.',
          effects: { sanity: -3 },
        },
      },
      {
        id: 'tune',
        text: '주파수를 돌려 본다',
        story: '손끝으로 다이얼을 천천히 돌렸다. 잡음이 갈라지는 틈마다 귀를 가까이 댔다.',
        risk: 3,
        baseChance: 0.5,
        statWeights: { knowledge: 0.004 },
        success: {
          text: '잡음 사이에서 숫자를 읽는 목소리가 들렸다. 받아 적은 숫자는 객체 번호와 일치했다.',
          effects: { knowledge: 8, sanity: 3 },
        },
        failure: {
          kind: 'setback',
          text: '주파수를 돌릴 때마다 내 이름이 한 번씩 섞여 들렸다.',
          effects: { sanity: -8 },
        },
      },
      {
        id: 'unplug',
        text: '코드를 뽑는다',
        story: '라디오 뒤로 손을 뻗어 코드를 더듬었다. 전원 표시등은 여전히 꺼져 있었다.',
        risk: 1,
        baseChance: 0.88,
        success: {
          text: '방이 조용해졌다. 조용함이 오늘은 고마웠다.',
          effects: { sanity: 6 },
        },
        failure: {
          kind: 'setback',
          text: '코드는 이미 뽑혀 있었다. 노래는 계속되었다.',
          effects: { sanity: -4 },
        },
      },
    ],
  },
  {
    id: 'rec-meal',
    kind: 'recovery',
    title: '식당 마감 뒤',
    text: '구내식당이 마감한 뒤, 조리사가 남은 밥과 국을 한 상 차려 놓고 앉아 있다. 먹고 가라는 눈짓이다.',
    cooldownYears: 6,
    choices: [
      {
        id: 'eat-together',
        text: '남은 밥을 함께 먹는다',
        story: '조리사 맞은편 의자를 빼 앉았다. 수저를 건네받으며 말없이 고개를 숙였다.',
        risk: 1,
        baseChance: 0.9,
        success: {
          text: '밥이 따뜻했다. 오랜만에 맛이라는 것이 느껴졌다.',
          effects: { sanity: 10, health: 3 },
        },
        failure: {
          kind: 'setback',
          text: '밥은 따뜻한데 맛이 없었다. 먹는 내내 누가 보는 것 같았다.',
          effects: { sanity: 2 },
        },
      },
      {
        id: 'take-away',
        text: '도시락으로 싸서 숙소로 가져간다',
        story: '빈 도시락통에 밥과 국을 나누어 담았다. 조리사가 뚜껑을 닫아 주었다.',
        risk: 1,
        baseChance: 0.85,
        success: {
          text: '숙소에서 조용히 먹었다. 혼자 먹는 밥도 나쁘지 않았다.',
          effects: { sanity: 8 },
        },
        failure: {
          kind: 'setback',
          text: '도시락 뚜껑을 열자 밥이 식어 있었다. 식은 지 오래된 것처럼.',
          effects: { sanity: -2 },
        },
      },
      {
        id: 'ask-cook',
        text: '조리사에게 이 건물에서 일한 이야기를 묻는다',
        story: '숟가락을 내려놓고 이 건물에서 얼마나 일했는지 물었다. 조리사가 행주를 접던 손을 멈췄다.',
        risk: 2,
        baseChance: 0.65,
        statWeights: { reputation: 0.003 },
        success: {
          text: '“나는 이 건물에서 밥만 해요. 그래서 오래 있을 수 있었죠.” 조리사가 웃으며 말했다.',
          effects: { sanity: 7, knowledge: 3, reputation: 2 },
        },
        failure: {
          kind: 'setback',
          text: '조리사는 말없이 설거지를 시작했다.',
          effects: { sanity: -2, reputation: -1 },
        },
      },
    ],
  },
] satisfies InterludeDef[]
