import { colorScale, COLORS } from '.';

describe('analytics-color-scale', function() {
  let scale = colorScale(Array.from(COLORS));
  beforeEach(() => {
    scale.reset();
  })
  test('should give the same color when called with the same id', function() {
    const color123 = scale('123');
    expect(scale('123')).toBe(color123)
  });
  test('should give back the input colors in order when assigning new ids', () => {
    expect(scale('foo')).toBe(COLORS[0])
    expect(scale('bar')).toBe(COLORS[1])
    expect(scale('baz')).toBe(COLORS[2])
    expect(scale('qux')).toBe(COLORS[3])
  })

});

