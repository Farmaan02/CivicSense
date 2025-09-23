/**
 * Focus trap utility for accessibility
 * Traps focus within a container element
 */

export function trapFocus(container: HTMLElement, initialFocusElement?: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstFocusableElement = focusableElements[0] as HTMLElement
  const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  // Set initial focus
  if (initialFocusElement) {
    initialFocusElement.focus()
  } else if (firstFocusableElement) {
    firstFocusableElement.focus()
  }
  
  // Handle tab key navigation
  container.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus()
          e.preventDefault()
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus()
          e.preventDefault()
        }
      }
    }
  })
  
  return {
    firstFocusableElement,
    lastFocusableElement
  }
}

export function releaseFocus() {
  // Remove event listeners if needed
  // This is a simple implementation - in a more complex scenario,
  // you might want to store and remove specific event listeners
}