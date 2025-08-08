// src/setupTests.ts
import '@testing-library/jest-dom'

// Mock do ResizeObserver para testes
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
