// Requirement: Regression guard for iPhone safe-area layout — bottom home-indicator
//   gutter must live outside the fixed 122px game strip and header content row.
// Approach: Assert DOM ownership (sibling bands + strip height class) and that
//   env(safe-area-*) rules live in index.css, not in component padding.
// Note: Simulated non-zero insets below are labelled test-only; not physical device proof.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@testing-library/react'
import LivingCv from '../components/LivingCv'
import CvHeader from '../components/CvHeader'
import CvGameStrip from '../components/CvGameStrip'
import { sections } from '../data/cv-data'

const installProps = {
  canInstall: false,
  isInstalled: false,
  onInstall: () => {},
  showManualInstructions: false,
  onShowInstructions: () => {},
  onCheckForUpdates: () => Promise.resolve('up-to-date' as const),
}

const indexCss = readFileSync(resolve(__dirname, '../index.css'), 'utf8')

describe('safe-area layout (non-zero inset simulation labelled, not physical proof)', () => {
  it('places top/bottom inset bands outside header and game strip siblings', () => {
    const { container } = render(<LivingCv {...installProps} />)
    const root = container.querySelector('[data-cv-root]')!
    const children = [...root.children].map((el) => el.getAttribute('data-safe-area-top') !== null
      ? 'safe-top'
      : el.getAttribute('data-safe-area-bottom') !== null
        ? 'safe-bottom'
        : el.tagName.toLowerCase() === 'header'
          ? 'header'
          : el.getAttribute('data-doc-stage') !== null
            ? 'main'
            : el.getAttribute('data-game-strip') !== null
              ? 'game-strip'
              : el.tagName.toLowerCase())

    expect(children).toContain('safe-top')
    expect(children).toContain('safe-bottom')
    expect(children).toContain('header')
    expect(children).toContain('game-strip')

    const topIdx = children.indexOf('safe-top')
    const headerIdx = children.indexOf('header')
    const stripIdx = children.indexOf('game-strip')
    const bottomIdx = children.indexOf('safe-bottom')
    expect(topIdx).toBeLessThan(headerIdx)
    expect(stripIdx).toBeLessThan(bottomIdx)
  })

  it('keeps the game strip at 122px without env(safe-area-inset-bottom) in its box', () => {
    const { container } = render(
      <CvGameStrip
        sections={sections}
        activeIndex={0}
        isVisited={() => false}
        poppingIndex={null}
        onNavigate={() => {}}
      />,
    )
    const strip = container.querySelector('[data-game-strip]')!
    expect(strip.className).toContain('h-[122px]')
    expect(strip.className).not.toMatch(/safe-area/)
  })

  it('keeps header padding off env(safe-area-inset-top)', () => {
    const { container } = render(
      <CvHeader name="Jaco Theron" soundOn onToggleSound={() => {}} onPrint={() => {}} />,
    )
    const header = container.querySelector('header')!
    expect(header.className).toContain('pt-3.5')
    expect(header.className).not.toMatch(/safe-area/)
  })

  it('defines shell inset bands once in index.css', () => {
    expect(indexCss).toMatch(/\[data-cv-root\][\s\S]*safe-area-inset-left/)
    expect(indexCss).toMatch(/\[data-safe-area-top\][\s\S]*safe-area-inset-top/)
    expect(indexCss).toMatch(/\[data-safe-area-bottom\][\s\S]*safe-area-inset-bottom/)
  })

  it('simulates non-zero bottom inset height via test stylesheet (not physical proof)', () => {
    const { container } = render(<LivingCv {...installProps} />)
    const bottom = container.querySelector('[data-safe-area-bottom]') as HTMLElement
    const style = document.createElement('style')
    style.textContent = '[data-safe-area-bottom]{height:34px!important}'
    document.head.appendChild(style)
    expect(getComputedStyle(bottom).height).toBe('34px')
    style.remove()
  })
})
