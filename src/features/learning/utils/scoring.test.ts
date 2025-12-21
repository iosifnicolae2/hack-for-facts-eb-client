import { describe, expect, it } from 'vitest'
import { scoreSingleChoice } from './scoring'
import type { SingleChoiceOption } from './scoring'

describe('scoring', () => {
  const options: readonly SingleChoiceOption[] = [
    { id: 'a', isCorrect: false },
    { id: 'b', isCorrect: true },
  ]

  it('returns 100 for a correct selection', () => {
    expect(scoreSingleChoice(options, 'b')).toBe(100)
  })

  it('returns 0 for an incorrect selection', () => {
    expect(scoreSingleChoice(options, 'a')).toBe(0)
  })

  it('returns 0 when nothing is selected', () => {
    expect(scoreSingleChoice(options, null)).toBe(0)
  })

  it('returns 0 when selection does not exist', () => {
    expect(scoreSingleChoice(options, 'missing')).toBe(0)
  })
})
