describe('Simple Test', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have document', () => {
    expect(document).toBeDefined()
  })

  it('should have documentElement', () => {
    expect(document.documentElement).toBeDefined()
  })
})
