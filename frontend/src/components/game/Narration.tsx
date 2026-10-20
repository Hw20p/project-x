import { toParagraphs } from '../../game/text'

/**
 * 서술 텍스트. 문장 단위로 문단을 나누고, 문단이 하나씩 떠오르게 한다.
 * 색·크기를 바꾸고 싶으면 className으로 덮어쓴다 (예: "text-fog").
 */
export function Narration({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`narration reveal grid gap-4 ${className}`}>
      {toParagraphs(text).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  )
}
