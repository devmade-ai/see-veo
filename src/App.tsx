import { useState } from 'react'
import { cvData } from './data/cv-data'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Education from './components/Education'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'
import PortfolioCallout from './components/PortfolioCallout'
import UpdatePrompt from './components/UpdatePrompt'
import InstallInstructionsModal from './components/InstallInstructionsModal'
import DebugBanner from './components/DebugBanner'
import { usePWAUpdate } from './hooks/usePWAUpdate'
import { usePWAInstall } from './hooks/usePWAInstall'

function App() {
  const { hasUpdate, update } = usePWAUpdate()
  const {
    canInstall,
    install,
    isInstalled,
    showManualInstructions,
    getInstallInstructions,
  } = usePWAInstall()
  const [showModal, setShowModal] = useState(false)

  const instructions = getInstallInstructions()

  return (
    <div className="min-h-screen bg-background text-text">
      <Hero
        personal={cvData.personal}
        canInstall={canInstall}
        onInstall={() => void install()}
        showManualInstructions={!canInstall && showManualInstructions && !isInstalled}
        onShowInstructions={() => setShowModal(true)}
      />
      {/* Requirement: Section order optimized for general visitors
         Approach: Lead with projects (show don't tell), then about/skills for context,
         credentials later, CTA after engagement
         Alternatives considered:
           - About first: Rejected — projects are more immediately engaging
           - PortfolioCallout at top: Rejected — CTA lands better after visitor is invested */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Projects items={cvData.projects} />
        <About text={cvData.about} />
        <Skills categories={cvData.skills} />
        <Experience items={cvData.experience} />
        <Education items={cvData.education} />
        <PortfolioCallout />
        <Contact info={cvData.contact} />
      </main>

      <footer className="py-8 text-center text-sm text-text-muted no-print">
        <p>
          &copy; {new Date().getFullYear()} {cvData.personal.name}. All rights
          reserved.
        </p>
        <p className="mt-2">
          Designed &amp; built by {cvData.personal.name} &mdash;{' '}
          <a
            href="https://github.com/devmade-ai/see-veo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-light"
          >
            view source
          </a>
        </p>
      </footer>

      {hasUpdate && <UpdatePrompt onUpdate={() => void update()} />}

      {showModal && (
        <InstallInstructionsModal
          browser={instructions.browser}
          steps={instructions.steps}
          note={instructions.note}
          onClose={() => setShowModal(false)}
        />
      )}

      <DebugBanner />
    </div>
  )
}

export default App
