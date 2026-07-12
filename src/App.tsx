import { useState } from 'react'
import LivingCv from './components/LivingCv'
import UpdatePrompt from './components/UpdatePrompt'
import InstallInstructionsModal from './components/InstallInstructionsModal'
import { usePWAUpdate } from './hooks/usePWAUpdate'
import { usePWAInstall } from './hooks/usePWAInstall'

// Requirement: The app is the "Living CV" pixel-runner game (full replacement of the
//   previous scrolling resume). The functional PWA chrome — update toast + manual
//   install instructions — is kept and layered above the game shell.
// Approach: LivingCv owns the game; App owns the PWA hooks and passes install state
//   down to the Contact "level" (install button / how-to-install link) and renders the
//   update toast + install modal as fixed overlays.
// Alternatives considered:
//   - Put PWA hooks inside LivingCv: Rejected — keeps LivingCv focused on the game and
//     the modal/toast as siblings, matching the previous separation of concerns

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
    <>
      <LivingCv
        canInstall={canInstall}
        isInstalled={isInstalled}
        onInstall={() => void install()}
        showManualInstructions={showManualInstructions}
        onShowInstructions={() => setShowModal(true)}
      />

      {hasUpdate && <UpdatePrompt onUpdate={() => void update()} />}

      {showModal && (
        <InstallInstructionsModal
          browser={instructions.browser}
          steps={instructions.steps}
          note={instructions.note}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

export default App
