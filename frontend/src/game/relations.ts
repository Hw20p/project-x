import { findActiveBonds } from '../engine/rules'
import type { NpcDef } from '../engine/types'

/** 지금 관계 단계의 이름 (관계 화면과 엔딩 카드가 같은 말을 쓴다). 어떤 구간에도 안 걸리면 무난한 사이. */
export function relationStageLabel(npc: NpcDef, relation: number): string {
  const labels = findActiveBonds(npc, relation).map((bond) => bond.label)
  return labels.length > 0 ? labels.join(', ') : '아직은 평범한 사이'
}
