import '@testing-library/jest-dom'

// Mock document.documentElement for React 19 compatibility
Object.defineProperty(document, 'documentElement', {
  value: {
    style: {
      WebkitAnimation: '',
      MozAnimation: '',
      OAnimation: '',
      animation: '',
    },
  },
  writable: true,
})

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock Google Maps API
Object.defineProperty(window, 'google', {
  value: {
    maps: {
      Map: jest.fn(),
      Marker: jest.fn(),
      InfoWindow: jest.fn(),
      Animation: {
        BOUNCE: 'BOUNCE'
      },
      SymbolPath: {
        CIRCLE: 'CIRCLE'
      }
    }
  },
  writable: true
})

// Mock document.createElement for script loading
const mockScript = {
  src: '',
  async: false,
  defer: false,
  onload: jest.fn(),
  onerror: jest.fn()
}

Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => mockScript),
  writable: true
})

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
  localStorageMock.setItem.mockImplementation(() => {})
  localStorageMock.removeItem.mockImplementation(() => {})
  localStorageMock.clear.mockImplementation(() => {})
})
