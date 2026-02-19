// Requirement: Chart iframes should auto-size to match their content height
// Approach: Load repo-tor's embed.js helper script, which auto-discovers all
//   repo-tor iframes on the page and handles resize messages via a single
//   global postMessage listener. Idempotent — safe to call from multiple
//   components without loading the script twice.
// Alternatives considered:
//   - Custom postMessage listener (useIframeAutoResize): Rejected — repo-tor
//     now ships embed.js which handles this natively, removing the need for
//     manual origin validation, source matching, and per-iframe React state
//   - <script> tag in index.html: Rejected — couples static HTML to an
//     optional feature; dynamic loading via useEffect is more React-idiomatic
//     and only loads when chart components are actually rendered

import { useEffect } from 'react'

/** URL of the repo-tor embed helper script */
const EMBED_SCRIPT_URL = 'https://devmade-ai.github.io/repo-tor/embed.js'

/**
 * Loads the repo-tor `embed.js` script once. The script auto-discovers all
 * repo-tor iframes on the page and handles `repo-tor:resize` postMessage
 * events, setting each iframe's height to match its content.
 *
 * Safe to call from multiple components — the script is only appended once.
 * No cleanup on unmount because the listener must persist for the page lifetime.
 */
export function useRepoTorEmbed() {
  useEffect(() => {
    if (document.querySelector(`script[src="${EMBED_SCRIPT_URL}"]`)) return

    const script = document.createElement('script')
    script.src = EMBED_SCRIPT_URL
    script.async = true
    document.head.appendChild(script)
  }, [])
}
