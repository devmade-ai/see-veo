// Requirement: Integration coverage for the game orchestrator — navigation (flags +
//   arrow keys), the sound toggle, and PDF export.
// Approach: Render LivingCv and scope queries to the on-screen game root ([data-cv-root])
//   so the always-mounted print document (a sibling) doesn't create duplicate matches.
//   The canvas engine no-ops under jsdom (null 2D context), so this exercises the React
//   navigation layer, which is the source of truth.

import { describe, it, expect, vi } from 'vitest'
import { render, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LivingCv from '../components/LivingCv'

const installProps = {
  canInstall: false,
  isInstalled: false,
  onInstall: () => {},
  showManualInstructions: false,
  onShowInstructions: () => {},
  onCheckForUpdates: () => Promise.resolve('up-to-date' as const),
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

  // Regression: a real message arrived by email with every space missing. The game's
  // window-level keydown listener claimed Space for the runner's jump and called
  // preventDefault(), which cancels the browser inserting the character — so every space
  // typed into the contact form was swallowed. The arrow keys were taken the same way.
  describe('game keys never take keystrokes from the contact form', () => {
    async function openContact(user: ReturnType<typeof userEvent.setup>) {
      const { root } = renderGame()
      await user.click(within(root).getByRole('button', { name: 'Contact' }))
      return root
    }

    it('keeps the spaces typed into the name and message fields', async () => {
      const user = userEvent.setup()
      const root = await openContact(user)

      const name = within(root).getByLabelText('Name')
      await user.type(name, 'Louise Wentworth')
      expect(name).toHaveValue('Louise Wentworth')

      const message = within(root).getByLabelText('Message')
      await user.type(message, 'please send me your cell phone number.')
      expect(message).toHaveValue('please send me your cell phone number.')
    })

    it('leaves the arrow keys to the caret instead of walking to another level', async () => {
      const user = userEvent.setup()
      const root = await openContact(user)

      const name = within(root).getByLabelText('Name')
      await user.type(name, 'Jaco{ArrowLeft}{ArrowLeft}X')

      expect(within(root).getByText('Final Stage')).toBeInTheDocument() // still on Contact
      expect(name).toHaveValue('JaXco') // the caret moved, the runner did not
    })

    it('lets Space activate a focused button', () => {
      const { root } = renderGame()
      const sfx = within(root).getByRole('button', { name: 'Toggle sound effects' })
      sfx.focus()

      // fireEvent returns false when a listener called preventDefault(); cancelling the
      // keydown is exactly what stops the browser activating the focused control.
      expect(fireEvent.keyDown(sfx, { key: ' ' })).toBe(true)
    })

    it('still claims Space everywhere else', () => {
      const { root } = renderGame()
      expect(fireEvent.keyDown(root, { key: ' ' })).toBe(false)
    })

    it('keeps a half-written message when the visitor walks away and comes back', async () => {
      const user = userEvent.setup()
      const root = await openContact(user)

      await user.type(within(root).getByLabelText('Message'), 'Half a thought')
      await user.click(within(root).getByRole('button', { name: 'Work' }))
      expect(within(root).queryByLabelText('Message')).not.toBeInTheDocument()

      await user.click(within(root).getByRole('button', { name: 'Contact' }))
      expect(within(root).getByLabelText('Message')).toHaveValue('Half a thought')
    })
  })
})
