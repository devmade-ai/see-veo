import { useState } from 'react'
import { cvData } from './data/cv-data'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Education from './components/Education'
import Skills from './components/Skills'
import ActivityCharts from './components/ActivityCharts'
import ActivityTimeline from './components/ActivityTimeline'
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
      {/* Requirement: Keyboard accessibility — skip link for screen readers and Tab users
         Approach: Visually hidden anchor that becomes visible on focus, jumps to main content
         Alternatives considered:
           - No skip link: Rejected — violates WCAG 2.1 SC 2.4.1 (Bypass Blocks) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-background focus:outline-none"
        style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
      >
        Skip to content
      </a>
      <Hero
        personal={cvData.personal}
        canInstall={canInstall}
        onInstall={() => void install()}
        showManualInstructions={!canInstall && showManualInstructions && !isInstalled}
        onShowInstructions={() => setShowModal(true)}
      />
      {/* Requirement: Section order — story first, then proof, then CTA, then credentials
         Approach: About → Skills → Projects → Activity → Timeline
           → Experience → Education → InterestForm
         Alternatives considered:
           - Skills after Projects: Previous layout — moved right after About so
             readers see capabilities early before diving into project details
           - CTA after Experience: Rejected — user moved form to follow Activity instead
           - Contact section with heading: Rejected — user requested heading removal and
             splitting contact into footer (LinkedIn/GitHub) and inline form */}
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <About paragraphs={cvData.about} />
        <Skills categories={cvData.skills} />
        <Projects items={cvData.projects} />
        <ActivityCharts />
        <ActivityTimeline />
        <Experience items={cvData.experience} />
        <Education items={cvData.education} />
        <InterestForm />
      </main>

      <footer className="py-8 text-center text-sm text-text-muted no-print">
        <nav aria-label="Social links" className="mb-4 flex justify-center gap-6">
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
        </nav>
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

      <DebugBanner canInstall={canInstall} />
    </div>
  )
}

export default App
