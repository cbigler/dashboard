import { mod } from '.'

describe('mod', () => {
  it('should handle positive numbers', () => {
    expect(mod(2, 12)).toBe(2)
    expect(mod(15, 12)).toBe(3)
    expect(mod(25, 12)).toBe(1)
    expect(mod(24, 12)).toBe(0)
  })
  it('should handle negative numbers', () => {
    expect(mod(-1, 12)).toBe(11)
    expect(mod(-5, 12)).toBe(7)
    expect(mod(-24, 12)).toBe(0)
  })
})