const jsdom = require('jsdom')

class CustomTestEnvironment extends jsdom.JSDOM {
  constructor(config) {
    super('<!DOCTYPE html><html><body></body></html>', {
      ...config,
      pretendToBeVisual: true,
    })

    // Mock the problematic function
    this.window.getVendorPrefixedEventName = () => 'animation'
    
    // Ensure documentElement has the required properties
    Object.defineProperty(this.window.document, 'documentElement', {
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

  getVmContext() {
    return this.getInternalVMContext()
  }
}

module.exports = CustomTestEnvironment
