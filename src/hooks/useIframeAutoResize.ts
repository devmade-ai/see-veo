// Requirement: Chart iframe containers should size to match their content height
// Approach: Listen for repo-tor's postMessage resize protocol and apply reported
//   height to the iframe element. Uses event.source to match messages to the
//   correct iframe when multiple embeds are on the page.
// Alternatives considered:
//   - Read iframe contentDocument.body.scrollHeight: Rejected — blocked by
//     same-origin policy (embed is on devmade-ai.github.io)
//   - CSS aspect-ratio: Rejected — approximation, doesn't reflect actual content
//   - iframe-resizer library: Rejected — requires companion script in embed,
//     repo-tor's native postMessage protocol is simpler and already implemented

import { useRef, useState, useEffect } from 'react'

/** Expected origin for repo-tor embeds */
const EMBED_ORIGIN = 'https://devmade-ai.github.io'

/**
 * Listens for `repo-tor:resize` postMessage events from an embedded iframe
 * and returns the reported content height.
 *
 * The hook validates message origin and matches `event.source` to the ref'd
 * iframe so multiple embeds on the same page are handled correctly.
 *
 * @returns `iframeRef` to attach to the `<iframe>`, and `height` (null until
 *   the first resize message arrives — use a CSS fallback until then).
 */
export function useIframeAutoResize() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState<number | null>(null)

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (
        event.origin === EMBED_ORIGIN &&
        event.data?.type === 'repo-tor:resize' &&
        typeof event.data.height === 'number' &&
        iframeRef.current &&
        event.source === iframeRef.current.contentWindow
      ) {
        setHeight(event.data.height)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return { iframeRef, height }
}
