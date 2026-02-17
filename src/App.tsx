import { useState } from 'react'
import { cvData } from './data/cv-data'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Education from './components/Education'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'
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
      {/* Requirement: Section order — About first to tell the story, then projects as proof
         Approach: Lead with About (why I built this) so visitors understand the context,
         then projects (show don't tell), then skills/experience for detail, CTA last
         Alternatives considered:
           - About after Projects: Rejected — visitors should know the story before seeing work
           - PortfolioCallout kept alongside About: Rejected — redundant, About covers it */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <About text={cvData.about} />
        <Projects items={cvData.projects} />
        <Skills categories={cvData.skills} />
        <Experience items={cvData.experience} />
        <Education items={cvData.education} />
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

      <DebugBanner hasUpdate={hasUpdate} />
    </div>
  )
}

export default App
