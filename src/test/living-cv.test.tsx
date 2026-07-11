// Requirement: Integration coverage for the game orchestrator — navigation (flags +
//   arrow keys), the sound toggle, and PDF export.
// Approach: Render LivingCv and scope queries to the on-screen game root ([data-cv-root])
//   so the always-mounted print document (a sibling) doesn't create duplicate matches.
//   The canvas engine no-ops under jsdom (null 2D context), so this exercises the React
//   navigation layer, which is the source of truth.

import { describe, it, expect, vi } from 'vitest'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LivingCv from '../components/LivingCv'

const installProps = {
  canInstall: false,
  isInstalled: false,
  onInstall: () => {},
  showManualInstructions: false,
  onShowInstructions: () => {},
}

function renderGame() {
  const utils = render(<LivingCv {...installProps} />)
  const root = utils.container.querySelector('[data-cv-root]') as HTMLElement
  return { ...utils, root }
}

describe('LivingCv', () => {
  it('starts on the profile level', () => {
    const { root } = renderGame()
    expect(within(root).getByRole('heading', { level: 1 })).toHaveTextContent('Jaco Theron')
    expect(within(root).getByText(/walk between sections/i)).toBeInTheDocument()
  })

  it('navigates to a section when its flag is clicked', async () => {
    const user = userEvent.setup()
    const { root } = renderGame()
    await user.click(within(root).getByRole('button', { name: 'Work' }))
    expect(within(root).getByText('Campaign Log')).toBeInTheDocument()
    await user.click(within(root).getByRole('button', { name: 'Contact' }))
    expect(within(root).getByText('Final Stage')).toBeInTheDocument()
  })

  it('walks between sections with the arrow keys', async () => {
    const user = userEvent.setup()
    const { root } = renderGame()
    await user.keyboard('{ArrowRight}') // → experience
    expect(within(root).getByText('Campaign Log')).toBeInTheDocument()
    await user.keyboard('{ArrowRight}') // → skills
    expect(within(root).getByText('Inventory')).toBeInTheDocument()
    await user.keyboard('{ArrowLeft}') // ← experience
    expect(within(root).getByText('Campaign Log')).toBeInTheDocument()
  })

  it('toggles the sound label', async () => {
    const user = userEvent.setup()
    const { root } = renderGame()
    expect(within(root).getByText('SFX ON')).toBeInTheDocument()
    await user.click(within(root).getByRole('button', { name: 'Toggle sound effects' }))
    expect(within(root).getByText('SFX OFF')).toBeInTheDocument()
  })

  it('prints when the PDF button is clicked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    const user = userEvent.setup()
    const { root } = renderGame()
    await user.click(within(root).getByRole('button', { name: 'Download as PDF' }))
    expect(printSpy).toHaveBeenCalledOnce()
    printSpy.mockRestore()
  })
})
