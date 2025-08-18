// src/setupTests.ts
import '@testing-library/jest-dom'

// Mock do ResizeObserver para testes
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock do window.matchMedia para testes de responsividade
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock global do fetch para evitar erros de URL inválida
global.fetch = () =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  } as Response)

// Mock do IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as typeof IntersectionObserver

// Mock do window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: () => {},
})

// Mock do window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: () => ({
    getPropertyValue: () => '',
  }),
})

// Mock para resolver problema do Radix UI em testes
Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
  writable: true,
  value: () => false,
})

// Mock para getBoundingClientRect
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  writable: true,
  value: () => ({
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    right: 100,
    bottom: 100,
    x: 0,
    y: 0,
  }),
})

// Mock para scrollIntoView
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: () => {},
})

// Mock para focus
Object.defineProperty(HTMLElement.prototype, 'focus', {
  writable: true,
  value: () => {},
})

// Mock para click
Object.defineProperty(HTMLElement.prototype, 'click', {
  writable: true,
  value: () => {},
})
