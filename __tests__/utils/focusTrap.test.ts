import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { trapFocus, releaseFocus } from '@/utils/focusTrap'

describe('Focus Trap Utility', () => {
  let container: HTMLElement
  let button1: HTMLButtonElement
  let button2: HTMLButtonElement
  let input: HTMLInputElement

  beforeEach(() => {
    // Create a container with focusable elements
    container = document.createElement('div')
    container.innerHTML = `
      <button id="button1">Button 1</button>
      <input id="input1" type="text" />
      <button id="button2">Button 2</button>
    `
    
    button1 = container.querySelector('#button1') as HTMLButtonElement
    input = container.querySelector('#input1') as HTMLInputElement
    button2 = container.querySelector('#button2') as HTMLButtonElement
    
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    jest.restoreAllMocks()
  })

  describe('trapFocus', () => {
    it('should focus the first element by default', () => {
      const result = trapFocus(container)
      
      expect(document.activeElement).toBe(button1)
      expect(result.firstFocusableElement).toBe(button1)
      expect(result.lastFocusableElement).toBe(button2)
    })

    it('should focus the specified initial element when provided', () => {
      const result = trapFocus(container, input)
      
      expect(document.activeElement).toBe(input)
      expect(result.firstFocusableElement).toBe(button1)
      expect(result.lastFocusableElement).toBe(button2)
    })

    it('should trap focus when tabbing forward', () => {
      trapFocus(container)
      
      // Simulate tabbing to the last element
      button2.focus()
      
      // Create and dispatch a tab keydown event
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' })
      container.dispatchEvent(tabEvent)
      
      // Should wrap around to the first element
      expect(document.activeElement).toBe(button1)
    })

    it('should trap focus when tabbing backward', () => {
      trapFocus(container)
      
      // Simulate tabbing to the first element
      button1.focus()
      
      // Create and dispatch a shift+tab keydown event
      const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true })
      container.dispatchEvent(shiftTabEvent)
      
      // Should wrap around to the last element
      expect(document.activeElement).toBe(button2)
    })

    it('should not interfere with other keys', () => {
      trapFocus(container)
      
      // Simulate pressing enter key
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      container.dispatchEvent(enterEvent)
      
      // Focus should remain unchanged
      expect(document.activeElement).toBe(button1)
    })
  })

  describe('releaseFocus', () => {
    it('should exist and be callable', () => {
      expect(typeof releaseFocus).toBe('function')
      expect(() => releaseFocus()).not.toThrow()
    })
  })
})