// 엔딩 카드: 종료 화면의 내용을 한 장의 이미지로 그린다. 위에서 아래로: 얼굴·엔딩 제목·에필로그·후일담, 그리고
// 삶의 기록(한눈에 보기·직급의 길·마지막 스탯·인간관계·관리한 객체). 서버 없이 브라우저의 캔버스로만 만들고,
// 저장(PNG 내려받기)과 공유(웹 공유 시트)에 쓴다.
import { PORTRAIT_GRID, portraitRects } from '../components/game/Portrait'

export interface EndingCardRelation {
  npcId: string
  name: string
  role: string
  /** 끝난 시점의 인물 나이 (플레이어 나이 + 나이 차이) */
  age: number
  /** 지금 관계 단계 이름 (예: 든든한 동료) */
  label: string
  /** 관계 값 -100~100 */
  value: number
  /** 연인이었는지 */
  lover: boolean
}

export interface EndingCardObject {
  code: string
  name: string
  outcome: 'cleared' | 'failed' | 'demoted'
  reassigned: boolean
}

/** 카드에 담을 내용 */
export interface EndingCardData {
  /** 끝난 나이 */
  age: number
  title: string
  epilogue: string
  /** 후일담 (이미 골라진 글) */
  afterwords: string[]
  /** 입사 배경 id (얼굴 그림과 옷). 없으면 사무직 */
  backgroundId: string | null
  backgroundName?: string
  rankLabel: string
  /** 끝났을 때의 스탯 */
  stats: { sanity: number; health: number; reputation: number; knowledge: number }
  /** 직급이 바뀐 때 (수습부터): 직급 이름과 그때의 나이 */
  rankPath: { label: string; age: number }[]
  /** 만난 사람들 (만나지 않은 사람은 넣지 않는다) */
  relations: EndingCardRelation[]
  /** 관리한 객체들 (관리한 순서) */
  objects: EndingCardObject[]
  /** 한눈에 보기 */
  highlights: { managed: number; streak: number; flawless: number; choices: number }
  seed: number
  /** 카드 맨 아래에 적는 주소 (예: 접속한 사이트의 호스트) */
  host: string
}

const WIDTH = 1080
const MIN_HEIGHT = 1350
const PAD = 90
const TEXT_WIDTH = WIDTH - PAD * 2
const PORTRAIT_SIZE = 320

// 화면의 색 토큰과 같은 값
const COLOR = {
  void: '#07070a',
  panel: '#14161e',
  edge: '#2c303d',
  bone: '#ebe5d6',
  fog: '#aaa699',
  ash: '#8b8779',
  gain: '#9cc596',
  loss: '#d2655c',
  gold: '#c8a45c',
  glow: '#a9bfdf',
} as const

const STAT_ROWS = [
  { key: 'sanity', label: '정신력', color: '#8a93de' },
  { key: 'health', label: '체력', color: '#bd5a50' },
  { key: 'reputation', label: '평판', color: '#c8a45c' },
  { key: 'knowledge', label: '지식', color: '#5fa59b' },
] as const

const OUTCOME_COLOR = { cleared: COLOR.gain, failed: COLOR.loss, demoted: COLOR.gold } as const
const OUTCOME_LABEL = { cleared: '성공', failed: '실패', demoted: '규정 위반' } as const

const SERIF = '"Noto Serif KR", "Nanum Myeongjo", "Batang", serif'
const SANS = '"Pretendard", "Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", system-ui, sans-serif'

/** 단어 단위로 줄바꿈한다 (한글도 띄어쓰기를 지킴). 한 단어가 한 줄보다 길면 글자 단위로 자른다. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    let line = ''
    for (const word of paragraph.split(' ')) {
      const candidate = line ? `${line} ${word}` : word
      if (ctx.measureText(candidate).width <= maxWidth) {
        line = candidate
        continue
      }
      if (line) {
        lines.push(line)
        line = ''
      }
      // 단어 하나가 한 줄에 안 들어가면 글자 단위로 잘라 이어 붙인다
      for (const char of word) {
        if (line && ctx.measureText(line + char).width > maxWidth) {
          lines.push(line)
          line = char
        } else {
          line += char
        }
      }
    }
    lines.push(line)
  }
  return lines
}

/** 웹 폰트가 아직 안 불러와졌다면 카드를 그리기 전에 기다린다 (실패해도 기본 글꼴로 그린다). */
async function ensureFonts(): Promise<void> {
  try {
    await Promise.all([document.fonts.load(`40px ${SERIF}`), document.fonts.load(`28px ${SANS}`)])
    await document.fonts.ready
  } catch {
    // 글꼴을 못 기다려도 그릴 수 있다
  }
}

/**
 * 카드 전체를 위에서 아래로 배치한다. `draw`가 false면 그리지 않고 높이만 센다 (카드 높이를 먼저 알아야 캔버스를 만들 수 있다).
 * 같은 코드로 재서 높이와 그림이 어긋나지 않게 한다.
 */
function layout(ctx: CanvasRenderingContext2D, data: EndingCardData, draw: boolean): number {
  const text = (value: string, x: number, baseline: number, font: string, color: string, align: CanvasTextAlign = 'left') => {
    ctx.font = font
    if (!draw) {
      return
    }
    ctx.fillStyle = color
    ctx.textAlign = align
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(value, x, baseline)
  }
  const rect = (x: number, y: number, width: number, height: number, color: string) => {
    if (draw) {
      ctx.fillStyle = color
      ctx.fillRect(x, y, width, height)
    }
  }
  const outline = (x: number, y: number, width: number, height: number, color: string, lineWidth = 2) => {
    if (draw) {
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.strokeRect(x, y, width, height)
    }
  }
  const portrait = (x: number, y: number, size: number, requested: string | null, age: number) => {
    if (!draw) {
      return
    }
    const cell = size / PORTRAIT_GRID
    for (const piece of portraitRects(requested, age)) {
      ctx.fillStyle = piece.fill
      ctx.fillRect(x + piece.x * cell, y + piece.y * cell, piece.width * cell, cell)
    }
  }
  /** 구역 머리글: 작은 글씨와 오른쪽으로 뻗는 가는 선 */
  const sectionLabel = (label: string, y: number): number => {
    text(label, PAD, y + 26, `26px ${SANS}`, COLOR.ash)
    const width = ctx.measureText(label).width
    rect(PAD + width + 22, y + 16, TEXT_WIDTH - width - 22, 2, COLOR.edge)
    return y + 70
  }

  let y = 0

  // ── 머리말 ──
  text('제 단 X', WIDTH / 2, 118, `30px ${SANS}`, COLOR.ash, 'center')
  text(`끝 · ${Math.floor(data.age)}세`, WIDTH / 2, 164, `34px ${SANS}`, COLOR.fog, 'center')

  // ── 얼굴: 끝난 나이의 모습 ──
  const portraitTop = 190
  const portraitLeft = (WIDTH - PORTRAIT_SIZE) / 2
  rect(portraitLeft - 14, portraitTop - 14, PORTRAIT_SIZE + 28, PORTRAIT_SIZE + 28, COLOR.panel)
  outline(portraitLeft - 14, portraitTop - 14, PORTRAIT_SIZE + 28, PORTRAIT_SIZE + 28, COLOR.edge, 3)
  portrait(portraitLeft, portraitTop, PORTRAIT_SIZE, data.backgroundId, data.age)

  // ── 엔딩 제목과 에필로그 ──
  const titleBaseline = portraitTop + PORTRAIT_SIZE + 130
  text(data.title, WIDTH / 2, titleBaseline, `bold 96px ${SERIF}`, COLOR.bone, 'center')

  const BODY_FONT = `34px ${SERIF}`
  const BODY_LINE = 56
  ctx.font = BODY_FONT
  const bodyLines = wrapText(ctx, data.epilogue, TEXT_WIDTH)
  const bodyTop = titleBaseline + 70
  bodyLines.forEach((line, index) => text(line, PAD, bodyTop + index * BODY_LINE + 36, BODY_FONT, COLOR.bone))
  y = bodyTop + bodyLines.length * BODY_LINE + 30

  // ── 후일담: 왼쪽에 가는 선을 두고 한 단계 흐린 글씨로 ──
  const AFTER_FONT = `29px ${SERIF}`
  const AFTER_LINE = 48
  for (const afterword of data.afterwords) {
    ctx.font = AFTER_FONT
    const lines = wrapText(ctx, afterword, TEXT_WIDTH - 36)
    rect(PAD, y + 6, 4, lines.length * AFTER_LINE, COLOR.edge)
    lines.forEach((line, index) => text(line, PAD + 36, y + index * AFTER_LINE + 36, AFTER_FONT, COLOR.fog))
    y += lines.length * AFTER_LINE + 22
  }
  y += 40

  // ── 한눈에 보기: 큰 숫자 네 개 ──
  y = sectionLabel('이번 삶', y)
  const numbers = [
    { value: data.highlights.managed, unit: '건', caption: '관리한 객체' },
    { value: data.highlights.streak, unit: '회', caption: '최고 연속 성공' },
    { value: data.highlights.flawless, unit: '건', caption: '무결점 관리' },
    { value: data.highlights.choices, unit: '번', caption: '내린 선택' },
  ]
  const numberWidth = TEXT_WIDTH / numbers.length
  numbers.forEach((item, index) => {
    const centerX = PAD + numberWidth * index + numberWidth / 2
    text(`${item.value}${item.unit}`, centerX, y + 52, `bold 56px ${SERIF}`, COLOR.bone, 'center')
    text(item.caption, centerX, y + 92, `24px ${SANS}`, COLOR.ash, 'center')
  })
  y += 150

  // ── 직급의 길: 승급한 나이 ──
  if (data.rankPath.length > 1) {
    y = sectionLabel('직급의 길', y)
    const nodeWidth = TEXT_WIDTH / data.rankPath.length
    data.rankPath.forEach((node, index) => {
      const centerX = PAD + nodeWidth * index + nodeWidth / 2
      const last = index === data.rankPath.length - 1
      text(node.label, centerX, y + 40, `bold 34px ${SERIF}`, last ? COLOR.glow : COLOR.bone, 'center')
      text(`${Math.floor(node.age)}세`, centerX, y + 80, `24px ${SANS}`, COLOR.ash, 'center')
      if (!last) {
        text('→', PAD + nodeWidth * (index + 1), y + 38, `28px ${SANS}`, COLOR.edge, 'center')
      }
    })
    y += 140
  }

  // ── 마지막 스탯: 막대 2×2 ──
  y = sectionLabel('마지막 상태', y)
  const statColumnWidth = (TEXT_WIDTH - 40) / 2
  STAT_ROWS.forEach((row, index) => {
    const x = PAD + (index % 2) * (statColumnWidth + 40)
    const top = y + Math.floor(index / 2) * 64
    const value = Math.max(0, Math.min(100, data.stats[row.key]))
    text(row.label, x, top + 30, `26px ${SANS}`, COLOR.fog)
    const barX = x + 110
    const barWidth = statColumnWidth - 110 - 90
    rect(barX, top + 14, barWidth, 12, COLOR.edge)
    rect(barX, top + 14, (barWidth * value) / 100, 12, row.color)
    text(String(Math.round(value * 10) / 10), x + statColumnWidth, top + 30, `26px ${SANS}`, COLOR.bone, 'right')
  })
  y += 128 + 50

  // ── 인간관계: 만난 사람마다 얼굴·관계 단계·막대 ──
  if (data.relations.length > 0) {
    y = sectionLabel('인간관계', y)
    const columnWidth = TEXT_WIDTH / data.relations.length
    const meterWidth = Math.min(240, columnWidth - 50)
    data.relations.forEach((relation, index) => {
      const centerX = PAD + columnWidth * index + columnWidth / 2
      const faceSize = 128
      rect(centerX - faceSize / 2 - 8, y - 8, faceSize + 16, faceSize + 16, COLOR.panel)
      outline(centerX - faceSize / 2 - 8, y - 8, faceSize + 16, faceSize + 16, relation.lover ? COLOR.loss : COLOR.edge, relation.lover ? 3 : 2)
      portrait(centerX - faceSize / 2, y, faceSize, relation.npcId, relation.age)
      let line = y + faceSize + 50
      text(relation.name, centerX, line, `bold 32px ${SERIF}`, COLOR.bone, 'center')
      line += 36
      text(`${relation.role} · ${Math.floor(relation.age)}세`, centerX, line, `22px ${SANS}`, COLOR.ash, 'center')
      line += 44
      const stageColor = relation.value > 0 ? COLOR.gain : relation.value < 0 ? COLOR.loss : COLOR.fog
      text(relation.label, centerX, line, `26px ${SERIF}`, stageColor, 'center')
      line += 34
      // 가운데(0)에서 값 쪽으로 뻗는 막대
      const meterX = centerX - meterWidth / 2
      rect(meterX, line, meterWidth, 10, COLOR.edge)
      const zero = meterX + meterWidth / 2
      const reach = (meterWidth / 2) * (Math.max(-100, Math.min(100, relation.value)) / 100)
      rect(Math.min(zero, zero + reach), line, Math.abs(reach), 10, relation.value >= 0 ? COLOR.gain : COLOR.loss)
      rect(zero - 1, line - 4, 2, 18, COLOR.bone)
      line += 44
      text(relation.lover ? `♥ 연인  ${relation.value}` : String(relation.value), centerX, line, `24px ${SANS}`, relation.lover ? COLOR.loss : COLOR.fog, 'center')
    })
    y += 128 + 50 + 36 + 44 + 34 + 44 + 50
  }

  // ── 관리한 객체: 결과별 색깔 태그 ──
  if (data.objects.length > 0) {
    y = sectionLabel('관리한 객체', y)
    const TAG_FONT = `24px ${SANS}`
    const TAG_HEIGHT = 46
    const TAG_GAP = 12
    let x = PAD
    for (const object of data.objects) {
      const label = `${object.code} ${object.name}${object.reassigned ? ' · 재' : ''}`
      ctx.font = TAG_FONT
      const width = Math.min(TEXT_WIDTH, ctx.measureText(label).width + 36)
      if (x + width > PAD + TEXT_WIDTH) {
        x = PAD
        y += TAG_HEIGHT + TAG_GAP
      }
      const color = OUTCOME_COLOR[object.outcome]
      rect(x, y, width, TAG_HEIGHT, COLOR.panel)
      outline(x, y, width, TAG_HEIGHT, color, 2)
      text(label, x + width / 2, y + 31, TAG_FONT, color, 'center')
      x += width + TAG_GAP
    }
    y += TAG_HEIGHT + 24
    // 범례
    let legendX = PAD
    for (const outcome of ['cleared', 'failed', 'demoted'] as const) {
      rect(legendX, y + 8, 14, 14, OUTCOME_COLOR[outcome])
      text(OUTCOME_LABEL[outcome], legendX + 24, y + 22, `22px ${SANS}`, COLOR.ash)
      legendX += 24 + ctx.measureText(OUTCOME_LABEL[outcome]).width + 36
    }
    y += 70
  }

  // ── 맨 아래: 입사 배경·직급, 시드와 주소 ──
  const record = [data.backgroundName, data.rankLabel].filter((part): part is string => Boolean(part)).join('  ·  ')
  rect(PAD, y, TEXT_WIDTH, 2, COLOR.edge)
  text(record, WIDTH / 2, y + 66, `28px ${SANS}`, COLOR.fog, 'center')
  text(`시드 ${data.seed}  ·  ${data.host}`, WIDTH / 2, y + 112, `24px ${SANS}`, COLOR.ash, 'center')
  y += 112 + 80

  return Math.max(MIN_HEIGHT, y)
}

/** 엔딩 카드를 PNG 이미지로 그린다. */
export async function renderEndingCard(data: EndingCardData): Promise<Blob> {
  await ensureFonts()
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('캔버스를 쓸 수 없는 환경')
  }

  // 1) 먼저 재서 카드 높이를 정한다 (캔버스 크기를 바꾸면 그린 것이 지워지므로 그리기 전에)
  const height = layout(ctx, data, false)
  canvas.width = WIDTH
  canvas.height = height

  // 2) 배경: 위쪽이 조금 밝은 어두운 바탕과 가는 테두리
  const gradient = ctx.createRadialGradient(WIDTH / 2, 420, 80, WIDTH / 2, 420, Math.max(height, 1300) * 0.85)
  gradient.addColorStop(0, COLOR.panel)
  gradient.addColorStop(1, COLOR.void)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, WIDTH, height)
  ctx.strokeStyle = COLOR.edge
  ctx.lineWidth = 2
  ctx.strokeRect(36, 36, WIDTH - 72, height - 72)

  // 3) 내용
  layout(ctx, data, true)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('이미지를 만들지 못함'))), 'image/png')
  })
}

/** 만든 이미지를 파일로 내려받는다. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  // 내려받기가 시작될 시간을 준 뒤 주소를 정리한다
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** 이 브라우저가 이미지 파일을 웹 공유 시트로 보낼 수 있는지 (주로 휴대폰) */
export function canShareImage(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') {
    return false
  }
  try {
    return navigator.canShare({ files: [new File([], 'card.png', { type: 'image/png' })] })
  } catch {
    return false
  }
}
