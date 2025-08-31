// This file runs before the test environment is set up
// Mock document.documentElement for React 19 compatibility
if (typeof document !== 'undefined') {
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
}

// Mock the problematic function globally
global.getVendorPrefixedEventName = () => 'animation'
