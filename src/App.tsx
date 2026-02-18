import { useState } from 'react'
import { cvData } from './data/cv-data'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Education from './components/Education'
import Skills from './components/Skills'
import ActivityCharts from './components/ActivityCharts'
import Projects from './components/Projects'
import InterestForm from './components/InterestForm'
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
      {/* Requirement: Section order — story first, then proof, then credentials, then CTA
         Approach: About (why I built this) → Projects (show don't tell) → credentials →
         InterestForm after Experience (CTA after full professional context) → Education
         Alternatives considered:
           - Contact section with heading: Rejected — user requested heading removal and
             splitting contact into footer (LinkedIn/GitHub) and inline form
           - CTA before credentials: Rejected — user requested form after Experience */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <About text={cvData.about} />
        <ActivityCharts />
        <Projects items={cvData.projects} />
        <Skills categories={cvData.skills} />
        <Experience items={cvData.experience} />
        <InterestForm />
        <Education items={cvData.education} />
      </main>

      <footer className="py-8 text-center text-sm text-text-muted no-print">
        <div className="mb-4 flex justify-center gap-6">
          <a
            href={cvData.contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-light"
          >
            LinkedIn
          </a>
          <a
            href={cvData.contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-light"
          >
            GitHub
          </a>
        </div>
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
