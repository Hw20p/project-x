// 게임 콘텐츠를 자동으로 모아서 내보낸다.
//   - content/objects/*.ts : 격리 객체 (파일 하나 = 객체 하나, default export = ContainmentObject)
//   - content/events/*.ts  : 막간 이벤트 (파일 하나 = 이벤트 묶음, default export = InterludeDef[])
//   - content/flows/*.ts   : 흐르는 서술 (파일 하나 = 서술 묶음, default export = FlowDef[])
//   - content/npcs.ts, content/endings.ts, content/backgrounds.ts, content/openings.ts
// 새 객체·이벤트·서술을 추가하려면 해당 폴더에 파일만 더 만들면 된다.
import type { GameContext } from '../engine/game'
import {
  validateBackgrounds,
  validateFlows,
  validateInterludes,
  validateNpcs,
  validateObjects,
} from '../engine/validate'
import type { BackgroundDef, ContainmentObject, EndingDef, FlowDef, InterludeDef, Rank } from '../engine/types'
import { backgrounds } from './backgrounds'
import { endings } from './endings'
import { npcs } from './npcs'
import { openings } from './openings'

const objectModules = import.meta.glob<{ default: ContainmentObject }>('./objects/*.ts', { eager: true })
const eventModules = import.meta.glob<{ default: InterludeDef[] }>('./events/*.ts', { eager: true })
const flowModules = import.meta.glob<{ default: FlowDef[] }>('./flows/*.ts', { eager: true })

export const objects: ContainmentObject[] = Object.values(objectModules)
  .map((module) => module.default)
  .sort((a, b) => a.code.localeCompare(b.code))

export const interludes: InterludeDef[] = Object.values(eventModules).flatMap((module) => module.default)

export const flows: FlowDef[] = Object.values(flowModules).flatMap((module) => module.default)

export { backgrounds, endings, npcs, openings }

/** 게임 엔진에 넘기는 콘텐츠 묶음 */
export const gameContext: GameContext = { objects, interludes, npcs, backgrounds, flows, openings }

/** 엔딩 id → 제목. 리포트·집계 화면에서 id 대신 보여 줄 때 쓴다. */
export const endingTitles: Readonly<Record<string, string>> = Object.fromEntries(
  endings.map((ending) => [ending.id, ending.title]),
)

export function findEnding(endingId: string): EndingDef | undefined {
  return endings.find((ending) => ending.id === endingId)
}

export function findBackground(backgroundId: string): BackgroundDef | undefined {
  return backgrounds.find((background) => background.id === backgroundId)
}

const endingIds = new Set(endings.map((ending) => ending.id))
const npcIds = new Set(npcs.map((npc) => npc.id))
const backgroundIds = new Set(backgrounds.map((background) => background.id))
const errors = [
  ...validateBackgrounds(backgrounds),
  ...validateNpcs(npcs),
  ...validateObjects(objects, endingIds, npcIds),
  ...validateInterludes(interludes, npcIds, objects),
  ...validateFlows(flows, openings, { backgroundIds, npcIds, objects, interludes }),
]
if (errors.length > 0) {
  const message = `콘텐츠 데이터 검증 실패:\n${errors.join('\n')}`
  if (import.meta.env.DEV) {
    throw new Error(message)
  }
  console.error(message)
}

export function objectsOfTier(tier: Rank): ContainmentObject[] {
  return objects.filter((object) => object.tier === tier)
}
