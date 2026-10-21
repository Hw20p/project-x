# Lifesim (가칭)

제단X(임시)에 입사한 첫날부터 격리 객체를 관리하며 직급을 올려 가는 코스믹 호러 내러티브 시뮬레이션. 연도가 지나며 스탯이 쌓이고 선택에 따라 결말이 갈린다. [80억 분의 1](https://1in8b.life/ko/)의 형식과 로보토미·SCP의 분위기에서 영감을 받았다.

게임 규칙은 [DESIGN.md](DESIGN.md), 진행 상황과 결정 사항은 [PROGRESS.md](PROGRESS.md)에 있다.

> 프로젝트 이름은 임시. 확정되면 `frontend/package.json`, `frontend/index.html`의 `<title>`, 이 문서를 같이 바꿀 것.

## 구조

```
frontend/  React 클라이언트 (현재 유일한 모듈)
```

project-01(Watchlog)의 모노레포 구조(`backend/` + `frontend/`)에서 출발했지만, 서버·DB·로그인 없이 **브라우저에서만 동작하는 한 판짜리 게임**으로 가기로 해서 `backend/`는 뺐다. 나중에 AI 연동이나 공유 기능이 필요해지면 그때 `backend/`를 추가한다.

## 기술 스택

- React 19 + TypeScript, Vite, Tailwind CSS 4, React Router
- 린터: oxlint

## 시작하기

```bash
cd frontend
npm install
npm run dev
```

기본 포트는 `5173`.

## 코드 구조

```
frontend/src/
  engine/    시뮬레이션 엔진 — React/DOM 의존 없는 순수 TS
    types.ts     공용 타입 (스탯, 객체, 단계, 선택지, 경력)
    config.ts    밸런스 수치 (승급 조건, 노화, 확률 범위 등)
    rules.ts     확률 계산, 선택 판정, 승급/좌천, 노화 — 순수 함수
    assignment.ts  다음 객체 고르기 (새 객체 우선, 소진 시 하위 등급 재배정)
    interlude.ts   막간 이벤트를 언제·어떤 것으로 끼울지 (조건·쿨다운·가중치)
    flow.ts        흐르는 서술(일상·이야기 비트·오프닝)을 상태에 맞게 고르기 (판정용 난수와 분리)
    state.ts     게임 진행 상태 타입 (직렬화 가능)
    game.ts      상태 머신 — createGame / reduce(begin·choose·continue) / replayGame
    simulate.ts  자동 플레이 봇과 집계 (밸런스 확인용)
    report.ts    시뮬레이션 결과를 마크다운 텍스트로 정리 (복사·저장용)
    rng.ts       시드 기반 난수
    validate.ts  콘텐츠 형식 검증
  content/   게임 콘텐츠
    objects/     격리 객체 데이터 (파일 하나 = 객체 하나, 자동 수집). X-011은 최종 객체(finale)
    events/      막간 이벤트 (회복·성장·관계). 파일 하나에 이벤트 여러 개, 자동 수집
    flows/       흐르는 서술 (일상 서술·이야기 비트). 파일 하나에 여러 개, 자동 수집
    openings.ts  입사 배경별 오프닝 장면
    npcs.ts      직장 내 관계 이벤트의 NPC (서지안·오태성·문하린)
    backgrounds.ts 입사 배경 3종 (시작 스탯, 합계 동일)
    endings.ts   최종 객체의 선택으로 도달하는 엔딩 정의 (제목·본문)
    epilogues.ts 그 밖의 종료(즉사·붕괴·노화·해고 등)의 에필로그와, 종료 종류별 에필로그를 고르는 함수
    index.ts     객체 수집 + 로드 시 검증
  game/      엔진과 React를 잇는 부분 (useGame 훅, 줄거리 스트림 항목 feed.ts, 한 줄씩 보여 주는 useStream 훅, localStorage 저장, 표시용 포맷 함수)
  components/game/   게임 화면 부품 (상태 패널, 줄거리 스트림, 선택 팝업, 속도 버튼·다시 펼치기 카드, 선택지 목록, 효과 표시) 과 screens/ (팝업 안의 객체 브리핑·선택·막간, 배경 선택, 종료 화면)
  pages/     페이지 (HomePage, GamePage, 개발 서버에서만 열리는 SimulationPage /dev/sim)
```

## 배포

백엔드가 없는 정적 사이트라서 빌드 결과만 서버에 올리면 된다.

1. `frontend`에서 `npm run build`를 실행한다. (`package.json`이 `frontend` 안에 있으므로 루트에서 실행하면 안 된다.)
2. `frontend/dist` **안의 파일들**(`index.html`, `favicon.svg`, `assets/`)을 서버의 웹 루트에 올린다. 폴더 구조를 그대로 유지하고, `dist` 폴더째 올리지 않는다.
3. nginx는 서버에 직접 설정해 두었다 (`test.maplespec.kr`, 웹 루트 `/home/deploy/apps/lifesim/current`, HTTPS는 certbot). 이 저장소에는 서버 설정 파일을 두지 않는다. 꼭 필요한 규칙은 `/play` 같은 주소를 새로고침해도 열리게 하는 SPA 폴백이다.

   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

4. 종료 화면의 "이 삶의 주소 복사" 버튼은 HTTPS에서만 동작한다.

다시 배포할 때는 `assets/`를 통째로 새것으로 교체하고 `index.html`도 덮어쓴다 (파일 이름이 빌드마다 바뀐다). 개발용 `/dev/sim`은 빌드에 포함되지 않는다.

### 자동 배포 (GitHub Actions)

`main` 브랜치에 push하면 [.github/workflows/deploy.yml](.github/workflows/deploy.yml)이 `npm ci` → `npm run build`(타입체크 포함) → SSH로 서버의 `/home/deploy/apps/lifesim/current/`에 교체한다. 빌드가 실패하면 배포되지 않는다. `frontend/` 안의 변경이 있을 때만 돌고, Actions 탭에서 수동 실행도 된다.

저장소의 Settings → Secrets and variables → Actions에 아래 세 값을 등록해야 한다.

| 이름 | 값 |
| --- | --- |
| `SSH_HOST` | 서버 주소 |
| `SSH_USER` | 접속 계정 (`deploy`) |
| `SSH_PRIVATE_KEY` | 배포용 SSH 개인 키 (서버 계정의 `authorized_keys`에 짝이 되는 공개 키가 등록되어 있어야 함) |

## 플레이

`npm run dev` 후 `http://localhost:5173`에서 "새 삶을 시작한다"를 누른다. 주소는 이렇게 쓴다.

- `/play` — 저장된 판을 이어 하고, 없으면 새 판을 시작한다
- `/play?new=1` — 저장본을 버리고 새 판
- `/play?seed=123` — 그 시드로 새 판 (입사 배경은 고른다)
- `/play?seed=123&bg=researcher` — 그 시드와 입사 배경으로 바로 시작 (같은 시드 + 같은 배경 + 같은 선택이면 같은 결과)

새 판은 먼저 입사 배경(연구원·현장직·사무직 출신)을 고르는 화면에서 시작한다. 배경 id는 `researcher`, `field`, `office`다.

진행 중인 판은 브라우저(`localStorage`)에 자동 저장되고, 끝난 판은 홈 화면의 "지난 기록"(최근 10개)에 남는다. 선택지는 숫자 키(1, 2, 3...)로도 고를 수 있고, "계속" 버튼은 Enter·Space로 넘긴다.

## 밸런스 확인

**지금은 잠겨 있다** (밸런스를 확정하면서 홈의 링크와 `/dev/sim` 라우트를 모두 막았다). 다시 쓰려면 `frontend/src/devTools.ts`의 `SIMULATION_PAGE_ENABLED`를 `true`로 바꾼다. 같은 파일의 `ENDING_GUIDE_PAGE_ENABLED`는 엔딩·막 조건을 정리해 보여 주는 `/dev/endings` 페이지의 스위치다(개발 서버에서만, 홈의 시뮬레이션 링크 아래에 링크가 나온다).

`npm run dev` 후 `http://localhost:5173/dev/sim`(홈의 "[개발] 밸런스 시뮬레이션" 링크)에서 봇이 수천 판을 자동으로 돌려 승급 속도, 사망 원인, 평균 수명, 객체별 성공률을 보여 준다. 시드가 같으면 결과도 같다. `engine/config.ts`나 `content/objects/`를 고치고 다시 실행해 비교하면 된다.

봇은 기본 4종(안전 우선, 중간 위험, 모험, 무작위)과 **엔딩 선호 봇**이 있다. 엔딩 선호 봇은 최종 객체 전까지는 안전 우선으로 플레이하다가 지정한 엔딩이 걸린 선택지를 고르므로, 결과의 "도달 대비" 비율이 그 엔딩을 노렸을 때의 성공률이다. 봇 선택에서 "엔딩 선호 봇 전체"를 고르면 엔딩별 비교를 한 번에 볼 수 있다.

결과 위쪽의 **결과 복사** 버튼이나 **.md 파일로 저장**으로 설정값(시드, 입사 스탯, 승급 기준 등)과 전략별 집계를 마크다운 텍스트로 내보낼 수 있다. 조건이 함께 기록되므로 수치를 바꾸기 전후 결과를 나란히 비교하기 좋다.

- 엔진은 `Math.random()` 대신 `engine/rng.ts`의 시드 기반 난수만 쓴다. 같은 시드 + 같은 선택 기록이면 항상 같은 결과가 나오게 해서, 나중에 서버 검증(리플레이)이나 시드 URL 공유를 붙일 수 있게 하기 위함이다.
- **객체를 추가하려면** `content/objects/`에 `x-0NN-이름.ts` 파일을 만들고 `export default { ... } satisfies ContainmentObject`로 작성한다. 형식이 틀리면 개발 서버 로드 시 에러로 알려 준다.
