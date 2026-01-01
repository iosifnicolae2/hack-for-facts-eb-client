/**
 * ChartTitle Component Tests
 *
 * This file tests the ChartTitle component which renders
 * chart title and optional subtitle.
 *
 * Pattern: Simple Component Testing
 * - Test title rendering
 * - Test optional subtitle rendering
 * - Test styling
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { ChartTitle } from './ChartTitle'

describe('ChartTitle', () => {
  describe('title rendering', () => {
    it('renders title text', () => {
      render(<ChartTitle title="Test Chart Title" />)

      expect(screen.getByText('Test Chart Title')).toBeInTheDocument()
    })

    it('renders title as h2 element', () => {
      render(<ChartTitle title="Test Chart Title" />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Test Chart Title')
    })

    it('applies title styling classes', () => {
      render(<ChartTitle title="Test Chart Title" />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveClass('text-center')
      expect(heading).toHaveClass('text-lg')
      expect(heading).toHaveClass('font-bold')
      expect(heading).toHaveClass('text-muted-foreground')
    })
  })

  describe('subtitle rendering', () => {
    it('renders subtitle when provided', () => {
      render(<ChartTitle title="Title" subtitle="Subtitle Text" />)

      expect(screen.getByText('Subtitle Text')).toBeInTheDocument()
    })

    it('does not render subtitle when not provided', () => {
      render(<ChartTitle title="Title" />)

      const paragraphs = document.querySelectorAll('p')
      expect(paragraphs).toHaveLength(0)
    })

    it('does not render subtitle when empty string', () => {
      render(<ChartTitle title="Title" subtitle="" />)

      const paragraphs = document.querySelectorAll('p')
      expect(paragraphs).toHaveLength(0)
    })

    it('renders subtitle as p element', () => {
      render(<ChartTitle title="Title" subtitle="Subtitle" />)

      const paragraph = document.querySelector('p')
      expect(paragraph).toHaveTextContent('Subtitle')
    })

    it('applies subtitle styling classes', () => {
      render(<ChartTitle title="Title" subtitle="Subtitle" />)

      const paragraph = document.querySelector('p')
      expect(paragraph).toHaveClass('text-center')
      expect(paragraph).toHaveClass('text-sm')
      expect(paragraph).toHaveClass('text-muted-foreground')
    })
  })

  describe('combined rendering', () => {
    it('renders both title and subtitle', () => {
      render(<ChartTitle title="Main Title" subtitle="Sub Title" />)

      expect(screen.getByText('Main Title')).toBeInTheDocument()
      expect(screen.getByText('Sub Title')).toBeInTheDocument()
    })

    it('renders title before subtitle', () => {
      const { container } = render(
        <ChartTitle title="First" subtitle="Second" />
      )

      const children = container.children
      expect(children[0].tagName).toBe('H2')
      expect(children[1].tagName).toBe('P')
    })
  })
})
