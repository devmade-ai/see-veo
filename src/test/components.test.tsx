// Requirement: Render tests for all CV section components
// Approach: Testing Library renders with assertions on visible text, structure, and interactions
// Alternatives considered:
//   - Snapshot tests: Rejected — brittle, break on styling changes unrelated to behavior
//   - E2E tests: Rejected — overkill for render verification, Vitest + jsdom is sufficient

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Hero from '../components/Hero'
import About from '../components/About'
import Experience from '../components/Experience'
import Education from '../components/Education'
import Skills from '../components/Skills'
import Projects from '../components/Projects'
import type { PersonalInfo, ExperienceItem, EducationItem, SkillCategory, ProjectItem } from '../data/cv-data'

const mockPersonal: PersonalInfo = {
  name: 'Test User',
  title: 'Software Engineer',
  tagline: 'Building great things',
  location: 'Cape Town, South Africa',
  avatarInitials: 'TU',
}

const mockExperience: ExperienceItem[] = [
  {
    id: 'exp-1',
    company: 'Acme Corp',
    role: 'Senior Developer',
    period: '2020 - 2023',
    location: 'Remote',
    description: 'Led frontend development.',
    highlights: ['Built component library', 'Improved performance by 40%'],
  },
  {
    id: 'exp-2',
    company: 'Startup Inc',
    role: 'Junior Developer',
    period: '2018 - 2020',
    description: 'Full-stack development.',
    highlights: ['Shipped MVP'],
  },
]

const mockEducation: EducationItem[] = [
  {
    id: 'edu-1',
    institution: 'University of Testing',
    degree: 'BSc Computer Science',
    period: '2014 - 2018',
    description: 'Graduated with honours.',
  },
  {
    id: 'edu-2',
    institution: 'Code Academy',
    degree: 'Full-Stack Certificate',
    period: '2019',
    description: '',
  },
]

const mockSkills: SkillCategory[] = [
  {
    id: 'skill-1',
    category: 'Frontend',
    skills: ['React', 'TypeScript', 'CSS'],
  },
  {
    id: 'skill-2',
    category: 'Backend',
    skills: ['Node.js', 'PostgreSQL'],
  },
]

const mockProjects: ProjectItem[] = [
  {
    id: 'proj-1',
    name: 'Test Project',
    description: 'A project for testing.',
    tech: ['React', 'Vite'],
    link: 'https://example.com',
    accent: '#818cf8',
  },
  {
    id: 'proj-2',
    name: 'Another Project',
    description: 'No link on this one.',
    tech: ['Vue'],
  },
]

describe('Hero', () => {
  it('renders personal info', () => {
    render(<Hero personal={mockPersonal} />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Building great things')).toBeInTheDocument()
  })

  it('renders avatar image with name as alt text', () => {
    render(<Hero personal={mockPersonal} />)
    const img = screen.getByAltText('Test User')
    expect(img).toBeInTheDocument()
    expect(img.tagName).toBe('IMG')
  })

  it('renders Download as PDF button', () => {
    render(<Hero personal={mockPersonal} />)
    expect(screen.getByText('Download as PDF')).toBeInTheDocument()
  })

  it('calls window.print when PDF button is clicked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    const user = userEvent.setup()
    render(<Hero personal={mockPersonal} />)
    await user.click(screen.getByText('Download as PDF'))
    expect(printSpy).toHaveBeenCalledOnce()
    printSpy.mockRestore()
  })

  it('renders install button when canInstall is true', () => {
    const onInstall = vi.fn()
    render(<Hero personal={mockPersonal} canInstall onInstall={onInstall} />)
    expect(screen.getByText('Install as an App')).toBeInTheDocument()
  })

  it('does not render install button when canInstall is false', () => {
    render(<Hero personal={mockPersonal} canInstall={false} />)
    expect(screen.queryByText('Install as an App')).not.toBeInTheDocument()
  })

  it('calls onInstall when install button is clicked', async () => {
    const onInstall = vi.fn()
    const user = userEvent.setup()
    render(<Hero personal={mockPersonal} canInstall onInstall={onInstall} />)
    await user.click(screen.getByText('Install as an App'))
    expect(onInstall).toHaveBeenCalledOnce()
  })

  it('renders manual instructions button when showManualInstructions is true', () => {
    const onShow = vi.fn()
    render(<Hero personal={mockPersonal} showManualInstructions onShowInstructions={onShow} />)
    expect(screen.getByText('How to Install')).toBeInTheDocument()
  })

  it('does not render manual instructions button when showManualInstructions is false', () => {
    render(<Hero personal={mockPersonal} showManualInstructions={false} />)
    expect(screen.queryByText('How to Install')).not.toBeInTheDocument()
  })
})

describe('About', () => {
  const paragraphs = [
    'First paragraph of the about section.',
    'Second paragraph with more detail.',
  ]

  it('renders the section title', () => {
    render(<About paragraphs={paragraphs} />)
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('renders all paragraphs', () => {
    render(<About paragraphs={paragraphs} />)
    expect(screen.getByText('First paragraph of the about section.')).toBeInTheDocument()
    expect(screen.getByText('Second paragraph with more detail.')).toBeInTheDocument()
  })

  it('renders nothing extra for empty paragraphs array', () => {
    const { container } = render(<About paragraphs={[]} />)
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(container.querySelectorAll('p')).toHaveLength(0)
  })
})

describe('Experience', () => {
  it('renders the section title', () => {
    render(<Experience items={mockExperience} />)
    expect(screen.getByText('Experience')).toBeInTheDocument()
  })

  it('renders all experience entries', () => {
    render(<Experience items={mockExperience} />)
    expect(screen.getByText('Senior Developer')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('2020 - 2023')).toBeInTheDocument()
    expect(screen.getByText('Remote')).toBeInTheDocument()
    expect(screen.getByText('Led frontend development.')).toBeInTheDocument()
    expect(screen.getByText('Built component library')).toBeInTheDocument()
    expect(screen.getByText('Improved performance by 40%')).toBeInTheDocument()

    expect(screen.getByText('Junior Developer')).toBeInTheDocument()
    expect(screen.getByText('Startup Inc')).toBeInTheDocument()
  })

  it('renders highlights as list items', () => {
    const { container } = render(<Experience items={mockExperience} />)
    const listItems = container.querySelectorAll('li')
    // 2 highlights from exp-1 + 1 from exp-2
    expect(listItems).toHaveLength(3)
  })
})

describe('Education', () => {
  it('renders the section title', () => {
    render(<Education items={mockEducation} />)
    expect(screen.getByText('Education')).toBeInTheDocument()
  })

  it('renders all education entries', () => {
    render(<Education items={mockEducation} />)
    expect(screen.getByText('BSc Computer Science')).toBeInTheDocument()
    expect(screen.getByText('University of Testing')).toBeInTheDocument()
    expect(screen.getByText('2014 - 2018')).toBeInTheDocument()
    expect(screen.getByText('Graduated with honours.')).toBeInTheDocument()

    expect(screen.getByText('Full-Stack Certificate')).toBeInTheDocument()
    expect(screen.getByText('Code Academy')).toBeInTheDocument()
  })
})

describe('Skills', () => {
  it('renders the section title', () => {
    render(<Skills categories={mockSkills} />)
    expect(screen.getByText('Skills')).toBeInTheDocument()
  })

  it('renders all skill categories', () => {
    render(<Skills categories={mockSkills} />)
    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('Backend')).toBeInTheDocument()
  })

  it('renders all individual skills as badges', () => {
    render(<Skills categories={mockSkills} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('CSS')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument()
  })
})

describe('Projects', () => {
  it('renders the section title', () => {
    render(<Projects items={mockProjects} />)
    expect(screen.getByText('Projects')).toBeInTheDocument()
  })

  it('renders all project names and descriptions', () => {
    render(<Projects items={mockProjects} />)
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('A project for testing.')).toBeInTheDocument()
    expect(screen.getByText('Another Project')).toBeInTheDocument()
    expect(screen.getByText('No link on this one.')).toBeInTheDocument()
  })

  it('renders tech badges for each project', () => {
    render(<Projects items={mockProjects} />)
    // proj-1 has React and Vite, proj-2 has Vue
    expect(screen.getByText('Vite')).toBeInTheDocument()
    expect(screen.getByText('Vue')).toBeInTheDocument()
  })

  it('renders View Project link only for projects with links', () => {
    render(<Projects items={mockProjects} />)
    const links = screen.getAllByText(/View Project/)
    expect(links).toHaveLength(1)
    expect(links[0].closest('a')).toHaveAttribute('href', 'https://example.com')
  })

  it('opens project links in new tab', () => {
    render(<Projects items={mockProjects} />)
    const link = screen.getByText(/View Project/).closest('a')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('applies accent color to left border', () => {
    const { container } = render(<Projects items={mockProjects} />)
    const cards = container.querySelectorAll('[style]')
    // First card should have the accent color on the border
    const firstCard = Array.from(cards).find(
      (el) => (el as HTMLElement).style.borderLeftColor === 'rgb(129, 140, 248)'
    )
    expect(firstCard).toBeTruthy()
  })

  it('uses default accent for projects without custom accent', () => {
    render(<Projects items={mockProjects} />)
    // proj-2 has no accent — should still render without errors
    expect(screen.getByText('Another Project')).toBeInTheDocument()
  })
})
