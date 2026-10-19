import type { ReactNode } from 'react'

/** 다음으로 넘어가는 버튼. 화면이 바뀌면 자동으로 포커스가 가서 Enter·Space로 넘길 수 있다. */
export function ContinueButton({ label = '계속', onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      autoFocus
      onClick={onClick}
      className="mt-2 rounded border border-glow/50 px-6 py-2.5 text-glow transition-colors hover:bg-glow/10"
    >
      {label} <span aria-hidden="true">→</span>
    </button>
  )
}

/** 화면 위쪽의 작은 분류 문구 (예: "X-001 · 수습 등급") */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs tracking-[0.2em] text-fog">{children}</p>
}

/** 본문 소제목 */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 text-xs tracking-[0.2em] text-ash">{children}</h3>
}
