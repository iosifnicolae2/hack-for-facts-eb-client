export type SingleChoiceOption = {
  readonly id: string
  readonly isCorrect: boolean
}

export function scoreSingleChoice(options: readonly SingleChoiceOption[], selectedOptionId: string | null): number {
  if (!selectedOptionId) return 0
  const selected = options.find((o) => o.id === selectedOptionId)
  return selected?.isCorrect ? 100 : 0
}
