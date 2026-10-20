import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface DecisionPopupProps {
  /** 팝업 맨 위의 작은 분류 문구 (스크린 리더용 이름이기도 하다) */
  label: string
  onClose: () => void
  /** 닫기 버튼 문구. 기본은 줄거리를 다시 읽는다는 뜻의 "닫고 기록 보기" */
  closeLabel?: string
  children: ReactNode
}

/**
 * 객체 관리·막간 이벤트의 선택을 띄우는 팝업. 바깥을 누르거나 Esc로 닫을 수 있고,
 * 닫으면 아래의 줄거리 스트림을 다시 읽을 수 있다. 좁은 화면에서는 아래에서 올라오는 시트가 된다.
 */
export function DecisionPopup({ label, onClose, closeLabel = '닫고 기록 보기', children }: DecisionPopupProps) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={label}>
      <button
        type="button"
        aria-label="닫기"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-void/75"
      />
      <div className="animate-fade-in-up relative max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-t-lg border border-edge bg-ink px-5 pb-6 pt-4 shadow-2xl sm:rounded-lg">
        <div className="mb-5 flex items-center justify-between gap-4">
          <span className="text-xs tracking-[0.2em] text-ash">{label}</span>
          <button type="button" onClick={onClose} className="text-xs text-ash hover:text-fog">
            {closeLabel} <span aria-hidden="true">✕</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
