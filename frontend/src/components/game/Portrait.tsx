import { useMemo } from 'react'

// 플레이어 얼굴 프로필: 16×16 도트를 코드로 그린다 (이미지 파일 없음).
// 기본 얼굴 위에 머리·배경별 옷과 소품·나이 든 흔적을 겹쳐 쌓는 방식이라, 나이에 따라 머리가 세고 주름이 늘어난다.
// 글자 하나가 한 칸이고 '.'은 비어 있음. 겹치는 칸은 나중에 얹은 층이 이긴다.

type Layer = Record<number, string>

const SIZE = 16

/** 머리·몸통 기본 (옷은 c/C로 칠하고 배경마다 색을 바꾼다) */
const BASE: Layer = {
  2: '....oooooooo....',
  3: '...osssssssso...',
  4: '...osssssssso...',
  5: '...osssssssso...',
  6: '...osssssssso...',
  7: '...osssssssso...',
  8: '...osssssssso...',
  9: '....osssssso....',
  10: '.....oooooo.....',
  11: '......osso......',
  12: '..CccccccccccC..',
  13: '.CccccccccccccC.',
  14: '.CccccccccccccC.',
  15: '.CccccccccccccC.',
}

/** 눈썹·눈·코·입 */
const FACE: Layer = {
  5: '.....bb..bb.....',
  6: '......e..e......',
  7: '........S.......',
  8: '.......mm.......',
}

/** 머리카락: 숱이 많은 모양(젊을 때)과 이마가 넓어진 모양(많이 늙었을 때) */
const HAIR_FULL: Layer = {
  1: '.....hhhhhh.....',
  2: '...hhhhhhhhhh...',
  3: '...hhhhhhhhhh...',
  4: '...hhsssssshh...',
  5: '...hssssssssh...',
}
const HAIR_THIN: Layer = {
  2: '....hhhhhhhh....',
  3: '...hhsssssshh...',
  4: '...hssssssssh...',
}

/** 배경별 소품과 옷 */
const RESEARCHER: Layer = {
  // 옆머리가 긴 머리, 안경, 흰 가운과 안에 입은 셔츠
  6: '...h.geggeg.h...',
  7: '...h........h...',
  12: '.......kk.......',
  13: '.......kk.......',
  14: '.......kk.......',
  15: '.......kk.......',
}
const FIELD: Layer = {
  // 안전모와 반사띠가 있는 작업복
  1: '.....yyyyyy.....',
  2: '...yyyyyyyyyy...',
  3: '..yyyyyyyyyyyy..',
  4: '...h........h...',
  5: '...h........h...',
  13: '....r......r....',
  14: '....r......r....',
  15: '....r......r....',
}
const OFFICE: Layer = {
  // 흰 셔츠 깃과 넥타이가 있는 정장
  12: '......WttW......',
  13: '......WttW......',
  14: '.......tt.......',
  15: '.......tt.......',
}

/** NPC: 서지안(긴 머리에 연한 블라우스) */
const LONG_HAIR: Layer = {
  6: '...h........h...',
  7: '...h........h...',
  8: '...h........h...',
  9: '...hh......hh...',
  10: '...hh......hh...',
  11: '..hhh......hhh..',
  12: '..hh........hh..',
}
const JIAN: Layer = {
  12: '......WWWW......',
  13: '.......WW.......',
}
/** NPC: 오태성(짙은 눈썹과 구레나룻, 회색 정장은 사무직 옷 층을 함께 쓴다) */
const TAESEONG: Layer = {
  5: '....bbb..bbb....',
  6: '...h........h...',
  7: '...h........h...',
}
/** NPC: 문하린(뒤로 묶어 올린 머리, 안경, 가운) */
const HARIN: Layer = {
  0: '......hhhh......',
  1: '.....hhhhhh.....',
  6: '.....geggeg.....',
  12: '.......kk.......',
  13: '.......kk.......',
  14: '.......kk.......',
  15: '.......kk.......',
}

/** 나이 든 흔적: 눈 밑 주름 → 이마 주름 → 볼 주름 */
const WRINKLES_BAGS: Layer = { 7: '.....w....w.....' }
const WRINKLES_FOREHEAD: Layer = { 4: '......wwww......' }
const WRINKLES_CHEEK: Layer = { 8: '....w......w....' }
/** 흰머리가 섞이기 시작함 */
const GRAY_STRANDS: Layer = { 2: '......G..G......', 3: '.....G......G...' }
/** 정신력이 낮을 때의 다크서클 */
const TIRED: Layer = { 7: '.....dd..dd.....' }

interface Look {
  skin: string
  skinShade: string
  wrinkle: string
  hair: string
  gray: string
}

/** 나이대별 모습. 머리 색과 피부색이 조금씩 변한다. */
const LOOKS: Look[] = [
  { skin: '#e9c6a1', skinShade: '#cfa682', wrinkle: '#e9c6a1', hair: '#2a2320', gray: '#2a2320' },
  { skin: '#e3bf99', skinShade: '#c99f7b', wrinkle: '#c99f7b', hair: '#2f2823', gray: '#8d8a85' },
  { skin: '#dcb893', skinShade: '#c2976f', wrinkle: '#bf9570', hair: '#6f6c68', gray: '#a3a09b' },
  { skin: '#d5b28f', skinShade: '#b98f69', wrinkle: '#b08763', hair: '#cfccc5', gray: '#e8e6e0' },
]

interface Outfit {
  coat: string
  coatShade: string
  detail: string
  accent: string
}

const OUTFITS: Record<string, Outfit> = {
  researcher: { coat: '#dcdcd6', coatShade: '#b4b4ae', detail: '#3b4a63', accent: '#3b4a63' },
  field: { coat: '#b8672a', coatShade: '#8d4c1d', detail: '#e2dcc0', accent: '#e8c030' },
  office: { coat: '#3a4256', coatShade: '#2a3040', detail: '#8a3140', accent: '#f0f0ee' },
  jian: { coat: '#7a8aa6', coatShade: '#5d6b86', detail: '#e8e0d0', accent: '#e8e0d0' },
  taeseong: { coat: '#4a4f58', coatShade: '#363a42', detail: '#2f5a46', accent: '#f0f0ee' },
  harin: { coat: '#e2e2dc', coatShade: '#b8b8b2', detail: '#6b3a4a', accent: '#6b3a4a' },
}
const DEFAULT_KIND = 'office'

/** 그림 종류(입사 배경 id 또는 NPC id)별로 얹는 층. 같은 옷 층을 여럿이 나눠 쓸 수 있다. */
const KIND_LAYERS: Record<string, Layer[]> = {
  researcher: [RESEARCHER],
  field: [FIELD],
  office: [OFFICE],
  jian: [LONG_HAIR, JIAN],
  taeseong: [TAESEONG, OFFICE],
  harin: [HARIN],
}

/** 나이를 모습 단계(0 젊음 ~ 3 노년)로 */
export function lookStage(age: number): number {
  if (age < 35) {
    return 0
  }
  if (age < 50) {
    return 1
  }
  if (age < 65) {
    return 2
  }
  return 3
}

function stack(grid: string[][], layer: Layer) {
  for (const [rowKey, text] of Object.entries(layer)) {
    const row = Number(rowKey)
    for (let col = 0; col < SIZE; col++) {
      const cell = text[col]
      if (cell !== undefined && cell !== '.') {
        grid[row][col] = cell
      }
    }
  }
}

function buildGrid(kind: string, stage: number, tired: boolean): string[][] {
  const grid = Array.from({ length: SIZE }, () => Array<string>(SIZE).fill('.'))
  stack(grid, BASE)
  stack(grid, kind === 'field' ? {} : stage >= 3 ? HAIR_THIN : HAIR_FULL)
  stack(grid, FACE)
  for (const layer of KIND_LAYERS[kind]) {
    stack(grid, layer)
  }
  if (stage >= 1) {
    stack(grid, WRINKLES_BAGS)
    if (kind !== 'field') {
      // 안전모를 쓴 배경은 윗머리가 가려져 있다
      stack(grid, GRAY_STRANDS)
    }
  }
  if (stage >= 2) {
    stack(grid, WRINKLES_FOREHEAD)
  }
  if (stage >= 3) {
    stack(grid, WRINKLES_CHEEK)
  }
  if (tired) {
    stack(grid, TIRED)
  }
  return grid
}

function colorOf(cell: string, look: Look, outfit: Outfit): string | null {
  switch (cell) {
    case 'o':
      return '#4a3329'
    case 's':
      return look.skin
    case 'S':
      return look.skinShade
    case 'w':
      return look.wrinkle
    case 'd':
      return '#9a7470'
    case 'e':
      return '#1a1412'
    case 'm':
      return '#a35a50'
    case 'h':
    case 'b':
      return look.hair
    case 'G':
      return look.gray
    case 'c':
      return outfit.coat
    case 'C':
      return outfit.coatShade
    case 'k':
    case 'r':
    case 't':
      return outfit.detail
    case 'W':
      return outfit.accent
    case 'y':
      return outfit.accent
    case 'g':
      // 눈(검은색)과 구별되도록 밝은 테
      return '#9fb0cc'
    default:
      return null
  }
}

interface PortraitProps {
  /** 플레이어의 입사 배경 id (옷과 소품이 다르다). 없으면 사무직으로 그린다. */
  backgroundId?: string | null
  /** NPC id. 주면 입사 배경 대신 그 인물(서지안·오태성·문하린)로 그린다. */
  npcId?: string
  /** 그릴 인물의 나이 (NPC는 플레이어 나이 + 나이 차이) */
  age: number
  /** 정신력. 낮으면 다크서클이 생긴다. 주지 않으면 그리지 않는다. */
  sanity?: number
  /** 한 변의 길이(px) */
  size?: number
  className?: string
}

/** 도트 한 줄(같은 색으로 이어진 칸들): 16×16 격자 위의 좌표와 너비 */
export interface PortraitRect {
  x: number
  y: number
  width: number
  fill: string
}

/** 도트 격자의 한 변 칸 수 */
export const PORTRAIT_GRID = SIZE

/**
 * 얼굴 그림을 이루는 도트 줄들. 화면의 SVG와 엔딩 카드(캔버스)가 같은 그림을 쓰도록 계산만 따로 뺐다.
 * @param requested 입사 배경 id 또는 NPC id (모르는 값이면 사무직)
 */
export function portraitRects(requested: string | null | undefined, age: number, sanity?: number): PortraitRect[] {
  const id = requested && KIND_LAYERS[requested] ? requested : DEFAULT_KIND
  const stage = lookStage(age)
  const tired = sanity !== undefined && sanity < 30
  const grid = buildGrid(id, stage, tired)
  const look = LOOKS[stage]
  const outfit = OUTFITS[id]
  const result: PortraitRect[] = []
  // 같은 줄에서 이웃한 같은 색 칸은 하나로 합쳐 그린다
  for (let y = 0; y < SIZE; y++) {
    let x = 0
    while (x < SIZE) {
      const fill = colorOf(grid[y][x], look, outfit)
      if (fill === null) {
        x++
        continue
      }
      let end = x + 1
      while (end < SIZE && colorOf(grid[y][end], look, outfit) === fill) {
        end++
      }
      result.push({ x, y, width: end - x, fill })
      x = end
    }
  }
  return result
}

/** 도트로 그린 얼굴 프로필. 나이가 들수록 머리가 세고 주름이 늘어난다. */
export function Portrait({ backgroundId, npcId, age, sanity, size = 56, className = '' }: PortraitProps) {
  const requested = npcId ?? backgroundId
  const tired = sanity !== undefined && sanity < 30
  // 모양이 달라지는 값(그림 종류·나이 단계·피곤함)이 같으면 다시 계산하지 않는다
  const rects = useMemo(() => portraitRects(requested, age, tired ? 0 : undefined), [requested, age, tired])

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`${Math.floor(age)}세의 모습`}
      className={`shrink-0 rounded border border-edge bg-panel ${className}`}
    >
      {rects.map((rect) => (
        <rect key={`${rect.y}-${rect.x}`} x={rect.x} y={rect.y} width={rect.width} height={1} fill={rect.fill} />
      ))}
    </svg>
  )
}
