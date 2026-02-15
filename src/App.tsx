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
      <header className="bg-surface px-4 pt-10 pb-6 text-center no-print">
        <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
          see-veo{' '}
          <span className="text-text-muted font-normal">(CV oh!)</span>
        </h1>

        <div className="mt-3 flex justify-center gap-3">
          {canInstall && (
            <button
              onClick={() => void install()}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-background transition-colors hover:bg-primary-light"
            >
              Install as an App
            </button>
          )}
          {!canInstall && showManualInstructions && !isInstalled && (
            <button
              onClick={() => setShowModal(true)}
              className="rounded-md bg-surface-light px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-border"
            >
              How to Install
            </button>
          )}
        </div>
      </header>

      <Hero personal={cvData.personal} />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <About text={cvData.about} />
        <Experience items={cvData.experience} />
        <Education items={cvData.education} />
        <Skills categories={cvData.skills} />
        <Projects items={cvData.projects} />
        <Contact info={cvData.contact} />
      </main>

      <footer className="py-8 text-center text-sm text-text-muted no-print">
        <p>
          &copy; {new Date().getFullYear()} {cvData.personal.name}. All rights
          reserved.
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
    </div>
  )
}

export default App
