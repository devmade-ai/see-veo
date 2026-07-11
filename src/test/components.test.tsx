// Requirement: Render tests for the "Living CV" section components + game chrome
// Approach: Testing Library render + assertions on visible text, links, and interactions
// Alternatives considered:
//   - Snapshot tests: Rejected — brittle, break on unrelated styling tweaks
//   - E2E tests: Rejected — jsdom render coverage is enough for these presentational parts

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CvProfile from '../components/CvProfile'
import CvExperience from '../components/CvExperience'
import CvSkills from '../components/CvSkills'
import CvProjects from '../components/CvProjects'
import CvEducation from '../components/CvEducation'
import CvContact from '../components/CvContact'
import CvHeader from '../components/CvHeader'
import CvGameStrip from '../components/CvGameStrip'
import { cvData, sections } from '../data/cv-data'

const noopInstall = {
  canInstall: false,
  isInstalled: false,
  onInstall: () => {},
  showManualInstructions: false,
  onShowInstructions: () => {},
}

describe('CvProfile', () => {
  it('renders name, title, quote and contact links', () => {
    render(<CvProfile />)
    expect(screen.getByRole('heading', { level: 1, name: cvData.personal.name })).toBeInTheDocument()
    expect(screen.getByText(cvData.personal.title)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(cvData.personal.quote.slice(0, 20)))).toBeInTheDocument()
    expect(screen.getByRole('link', { name: cvData.personal.linkedin.label })).toHaveAttribute(
      'href',
      cvData.personal.linkedin.url,
    )
  })

  it('renders all four stats', () => {
    render(<CvProfile />)
    for (const stat of cvData.stats) {
      expect(screen.getByText(stat.label)).toBeInTheDocument()
      expect(screen.getByText(stat.value)).toBeInTheDocument()
    }
  })
})

describe('CvExperience', () => {
  it('renders the eyebrow, every role, and highlights', () => {
    render(<CvExperience />)
    expect(screen.getByText('Campaign Log')).toBeInTheDocument()
    for (const job of cvData.experience) {
      expect(screen.getByText(job.role)).toBeInTheDocument()
      expect(screen.getByText(job.period)).toBeInTheDocument()
    }
    const firstHighlight = cvData.experience[0].highlights[0]
    expect(screen.getByText(firstHighlight)).toBeInTheDocument()
  })
})

describe('CvSkills', () => {
  it('renders each category with its skills joined into a line', () => {
    render(<CvSkills />)
    expect(screen.getByText('Inventory')).toBeInTheDocument()
    for (const cat of cvData.skills) {
      expect(screen.getByText(cat.category)).toBeInTheDocument()
      expect(screen.getByText(cat.skills.join(', '))).toBeInTheDocument()
    }
  })
})

describe('CvProjects', () => {
  it('renders project names and outbound VISIT links', () => {
    render(<CvProjects />)
    for (const project of cvData.projects) {
      expect(screen.getByText(project.name)).toBeInTheDocument()
    }
    const links = screen.getAllByRole('link', { name: /visit/i })
    expect(links).toHaveLength(cvData.projects.length)
    expect(links[0]).toHaveAttribute('href', cvData.projects[0].url)
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

describe('CvEducation', () => {
  it('renders every degree, institution and period', () => {
    render(<CvEducation />)
    for (const edu of cvData.education) {
      expect(screen.getByText(edu.degree)).toBeInTheDocument()
      expect(screen.getByText(edu.institution)).toBeInTheDocument()
      expect(screen.getByText(edu.period)).toBeInTheDocument()
    }
  })
})

describe('CvContact', () => {
  it('renders the interest form and email/social links', () => {
    render(<CvContact {...noopInstall} />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      `mailto:${cvData.personal.email}`,
    )
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      cvData.personal.linkedin.url,
    )
  })

  it('shows the install button when the browser supports it', () => {
    const onInstall = vi.fn()
    render(<CvContact {...noopInstall} canInstall onInstall={onInstall} />)
    expect(screen.getByRole('button', { name: /install app/i })).toBeInTheDocument()
  })

  it('shows "how to install" when manual instructions are needed', () => {
    render(<CvContact {...noopInstall} showManualInstructions />)
    expect(screen.getByRole('button', { name: /how to install/i })).toBeInTheDocument()
  })

  it('hides install affordances once installed', () => {
    render(<CvContact {...noopInstall} isInstalled canInstall showManualInstructions />)
    expect(screen.queryByRole('button', { name: /install/i })).not.toBeInTheDocument()
  })
})

describe('CvHeader', () => {
  it('renders the name, HUD and controls', () => {
    render(
      <CvHeader name="Jaco Theron" soundOn onToggleSound={() => {}} onPrint={() => {}} />,
    )
    expect(screen.getByText('Jaco Theron')).toBeInTheDocument()
    expect(screen.getByText('SFX ON')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download as PDF' })).toBeInTheDocument()
  })

  it('reflects the sound state and fires the callbacks', async () => {
    const onToggleSound = vi.fn()
    const onPrint = vi.fn()
    const user = userEvent.setup()
    render(
      <CvHeader name="Jaco Theron" soundOn={false} onToggleSound={onToggleSound} onPrint={onPrint} />,
    )
    expect(screen.getByText('SFX OFF')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Toggle sound effects' }))
    expect(onToggleSound).toHaveBeenCalledOnce()
    await user.click(screen.getByRole('button', { name: 'Download as PDF' }))
    expect(onPrint).toHaveBeenCalledOnce()
  })
})

describe('CvGameStrip', () => {
  it('renders a flag button per section and navigates on click', async () => {
    const onNavigate = vi.fn()
    const user = userEvent.setup()
    render(
      <CvGameStrip
        sections={sections}
        activeIndex={0}
        isVisited={() => false}
        poppingIndex={null}
        onNavigate={onNavigate}
      />,
    )
    for (const section of sections) {
      expect(screen.getByRole('button', { name: section.flagLabel })).toBeInTheDocument()
    }
    await user.click(screen.getByRole('button', { name: 'Projects' }))
    expect(onNavigate).toHaveBeenCalledWith(3)
  })
})
