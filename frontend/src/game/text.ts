const SENTENCE_END = '.?!…'
/** 이보다 짧은 문장은 다음 문장과 한 문단으로 묶는다 ("문은 닫혔다." 같은 짧은 문장이 혼자 떠 있지 않게) */
const MIN_PARAGRAPH_LENGTH = 14

/**
 * 서술을 문장 단위로 나눈다. 따옴표(“ ”) 안의 마침표에서는 나누지 않고,
 * 따옴표가 닫히면서 문장이 끝나는 경우(“…다.” 뒤)에는 닫는 따옴표까지 한 문장으로 본다.
 */
export function splitSentences(text: string): string[] {
  const sentences: string[] = []
  let current = ''
  let quoteDepth = 0

  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    current += char
    if (char === '“') {
      quoteDepth += 1
    } else if (char === '”') {
      quoteDepth = Math.max(0, quoteDepth - 1)
    }

    const next = text[index + 1]
    const atBoundary = next === undefined || /\s/.test(next)
    const endsWithPunctuation = SENTENCE_END.includes(char)
    const closesQuoteAfterPunctuation =
      char === '”' && quoteDepth === 0 && SENTENCE_END.includes(text[index - 1] ?? '')

    if (atBoundary && quoteDepth === 0 && (endsWithPunctuation || closesQuoteAfterPunctuation)) {
      sentences.push(current.trim())
      current = ''
    }
  }
  if (current.trim()) {
    sentences.push(current.trim())
  }
  return sentences
}

/** 문장을 문단으로 묶는다: 짧은 문장은 다음 문장과 합친다. */
export function toParagraphs(text: string): string[] {
  const paragraphs: string[] = []
  let pending = ''
  for (const sentence of splitSentences(text)) {
    pending = pending ? `${pending} ${sentence}` : sentence
    if (pending.length >= MIN_PARAGRAPH_LENGTH) {
      paragraphs.push(pending)
      pending = ''
    }
  }
  if (pending) {
    paragraphs.push(pending)
  }
  return paragraphs
}
