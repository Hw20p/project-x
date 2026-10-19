// 콘텐츠를 손으로 작성하다 생기는 실수를 잡는 검증기. content/index.ts가 로드 시점에 호출한다.
import { STAT_KEYS } from './types'
import type { Choice, ContainmentObject, InterludeDef, NpcDef, OutcomeExtras } from './types'

const KINDS = ['recovery', 'growth', 'relationship']

function isHalfYear(years: number): boolean {
  return years >= 0 && Number.isInteger(years * 2)
}

/** 선택지 공통 검사 (확률, 위험도, 텍스트, 관계 대상 NPC) */
function validateChoice(choice: Choice, where: string, npcIds: ReadonlySet<string>, fail: (message: string) => void) {
  if (choice.baseChance <= 0 || choice.baseChance >= 1) {
    fail(`${where}: baseChance는 0과 1 사이여야 함 (${choice.baseChance})`)
  }
  if (![1, 2, 3, 4, 5].includes(choice.risk)) {
    fail(`${where}: risk가 1~5가 아님`)
  }
  if (!choice.text || !choice.success.text || !choice.failure.text) {
    fail(`${where}: 텍스트가 비어 있음`)
  }
  for (const outcome of [choice.success, choice.failure] as OutcomeExtras[]) {
    for (const npcId of Object.keys(outcome.relations ?? {})) {
      if (!npcIds.has(npcId)) {
        fail(`${where}: 정의되지 않은 NPC id(relations): ${npcId}`)
      }
    }
  }
}

/** 객체·막간 이벤트의 모든 선택지 결과가 켜는 플래그 */
function collectSetFlags(objects: readonly ContainmentObject[], interludes: readonly InterludeDef[]): Set<string> {
  const flags = new Set<string>()
  const choices = [
    ...objects.flatMap((object) => object.stages.flatMap((stage) => stage.choices)),
    ...interludes.flatMap((def) => def.choices),
  ]
  for (const choice of choices) {
    for (const flag of [...(choice.success.setFlags ?? []), ...(choice.failure.setFlags ?? [])]) {
      flags.add(flag)
    }
  }
  return flags
}

/**
 * @param endingIds 정의된 엔딩 id 목록. 선택 결과가 가리키는 `endingId`가 여기에 있어야 한다.
 * @param npcIds 정의된 NPC id 목록. 선택 결과의 `relations`가 가리키는 NPC가 여기에 있어야 한다.
 */
export function validateObject(
  object: ContainmentObject,
  endingIds: ReadonlySet<string>,
  npcIds: ReadonlySet<string>,
): string[] {
  const errors: string[] = []
  const fail = (message: string) => errors.push(`[${object.code}] ${message}`)

  if (!object.id || !object.code || !object.name) {
    fail('id/code/name이 비어 있음')
  }
  if (![1, 2, 3, 4, 5].includes(object.tier)) {
    fail(`tier가 1~5가 아님: ${object.tier}`)
  }
  if (object.finale && object.tier !== 5) {
    fail('최종 객체(finale)는 tier 5여야 함')
  }
  if (object.stages.length === 0) {
    fail('stages가 비어 있음')
  }

  let totalYears = 0
  const stageIds = new Set<string>()
  for (const [stageIndex, stage] of object.stages.entries()) {
    const isLastStage = stageIndex === object.stages.length - 1
    if (stageIds.has(stage.id)) {
      fail(`단계 id 중복: ${stage.id}`)
    }
    stageIds.add(stage.id)

    if (!isHalfYear(stage.years)) {
      fail(`${stage.id}: years는 0 이상의 0.5 단위여야 함 (${stage.years})`)
    }
    totalYears += stage.years

    if (stage.choices.length < 2) {
      fail(`${stage.id}: 선택지가 2개 미만`)
    }
    if (stage.choices.every((choice) => choice.failure.kind === 'death')) {
      fail(`${stage.id}: 즉사하지 않는 선택지가 하나도 없음`)
    }

    const choiceIds = new Set<string>()
    for (const choice of stage.choices) {
      const where = `${stage.id}/${choice.id}`
      if (choiceIds.has(choice.id)) {
        fail(`${where}: 선택지 id 중복`)
      }
      choiceIds.add(choice.id)
      validateChoice(choice, where, npcIds, fail)

      const { endingId } = choice.success
      if (endingId !== undefined) {
        if (!object.finale) {
          fail(`${where}: endingId는 최종 객체(finale)에서만 쓸 수 있음`)
        }
        if (!endingIds.has(endingId)) {
          fail(`${where}: 정의되지 않은 엔딩 id: ${endingId}`)
        }
      }
      // 최종 객체가 엔딩 없이 "성공"으로 끝나 버리면 판이 안 끝나므로, 객체를 끝내는 성공에는 반드시 엔딩을 붙인다.
      if (object.finale && endingId === undefined && (isLastStage || choice.success.finish)) {
        fail(`${where}: 최종 객체에서 관리를 끝내는 성공은 endingId가 있어야 함`)
      }
    }
  }

  if (totalYears <= 0) {
    fail('전체 소요 시간이 0 이하')
  }
  return errors
}

export function validateObjects(
  objects: ContainmentObject[],
  endingIds: ReadonlySet<string>,
  npcIds: ReadonlySet<string>,
): string[] {
  const errors = objects.flatMap((object) => validateObject(object, endingIds, npcIds))
  const ids = new Set<string>()
  const codes = new Set<string>()
  for (const object of objects) {
    if (ids.has(object.id)) {
      errors.push(`[${object.code}] 객체 id 중복: ${object.id}`)
    }
    if (codes.has(object.code)) {
      errors.push(`[${object.code}] 객체 code 중복`)
    }
    ids.add(object.id)
    codes.add(object.code)
  }
  return errors
}

export function validateNpcs(npcs: readonly NpcDef[]): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  for (const npc of npcs) {
    const fail = (message: string) => errors.push(`[NPC ${npc.id}] ${message}`)
    if (!npc.id || !npc.name || !npc.role) {
      fail('id/name/role이 비어 있음')
    }
    if (ids.has(npc.id)) {
      fail('NPC id 중복')
    }
    ids.add(npc.id)
    for (const bond of npc.bonds ?? []) {
      if (!bond.label) {
        fail('bond의 label이 비어 있음')
      }
      if (bond.minRelation === undefined && bond.maxRelation === undefined) {
        fail(`bond(${bond.label}): minRelation·maxRelation 중 하나는 있어야 함`)
      }
      if (bond.minRelation !== undefined && bond.maxRelation !== undefined && bond.minRelation > bond.maxRelation) {
        fail(`bond(${bond.label}): minRelation이 maxRelation보다 큼`)
      }
    }
  }
  return errors
}

/**
 * 막간 이벤트 검증. 객체는 "등장 조건에 쓰인 플래그가 어딘가에서 켜지는지" 확인하려고 받는다.
 */
export function validateInterludes(
  defs: readonly InterludeDef[],
  npcIds: ReadonlySet<string>,
  objects: readonly ContainmentObject[],
): string[] {
  const errors: string[] = []
  const settableFlags = collectSetFlags(objects, defs)
  const ids = new Set<string>()

  for (const def of defs) {
    const fail = (message: string) => errors.push(`[이벤트 ${def.id}] ${message}`)

    if (!def.id || !def.title || !def.text) {
      fail('id/title/text가 비어 있음')
    }
    if (ids.has(def.id)) {
      fail('이벤트 id 중복')
    }
    ids.add(def.id)
    if (!KINDS.includes(def.kind)) {
      fail(`kind가 올바르지 않음: ${def.kind}`)
    }
    if (def.years !== undefined && !isHalfYear(def.years)) {
      fail(`years는 0 이상의 0.5 단위여야 함 (${def.years})`)
    }
    if (def.weight !== undefined && def.weight <= 0) {
      fail('weight는 0보다 커야 함')
    }
    if (def.npcId !== undefined && !npcIds.has(def.npcId)) {
      fail(`정의되지 않은 NPC id: ${def.npcId}`)
    }
    if (def.kind === 'relationship' && def.npcId === undefined) {
      fail('관계 이벤트(relationship)에는 npcId가 있어야 함')
    }
    if (def.choices.length < 2) {
      fail('선택지가 2개 미만')
    }

    const when = def.when
    for (const flag of [...(when?.flags ?? []), ...(when?.notFlags ?? [])]) {
      if (!settableFlags.has(flag)) {
        fail(`등장 조건의 플래그 "${flag}"를 켜는 선택지가 어디에도 없음 (오타 확인)`)
      }
    }
    for (const npcId of Object.keys(when?.relations ?? {})) {
      if (!npcIds.has(npcId)) {
        fail(`등장 조건의 NPC id가 정의되지 않음: ${npcId}`)
      }
    }
    for (const key of Object.keys(when?.stats ?? {})) {
      if (!(STAT_KEYS as readonly string[]).includes(key)) {
        fail(`등장 조건의 스탯 키가 올바르지 않음: ${key}`)
      }
    }

    const choiceIds = new Set<string>()
    for (const choice of def.choices) {
      const where = choice.id
      if (choiceIds.has(choice.id)) {
        fail(`${where}: 선택지 id 중복`)
      }
      choiceIds.add(choice.id)
      validateChoice(choice, `${def.id}/${where}`, npcIds, (message) => errors.push(`[이벤트 ${def.id}] ${message}`))

      if (choice.failure.kind !== 'setback') {
        fail(`${where}: 막간 이벤트의 실패는 setback만 허용 (${choice.failure.kind})`)
      }
      if (choice.success.finish || choice.success.endingId !== undefined) {
        fail(`${where}: 막간 이벤트에서는 finish·endingId를 쓸 수 없음`)
      }
    }
  }
  return errors
}
