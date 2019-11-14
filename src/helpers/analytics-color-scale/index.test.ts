import analyticsColorScale, { COLORS } from '.';

describe('analytics-color-scale', function() {
  beforeEach(() => {
    analyticsColorScale.reset();
  })
  test('should give the same color when called with the same id', function() {
    const color123 = analyticsColorScale('123');
    expect(analyticsColorScale('123')).toBe(color123)
  });
  test('should give back the input colors in order when assigning new ids', () => {
    expect(analyticsColorScale('foo')).toBe(COLORS[0])
    expect(analyticsColorScale('bar')).toBe(COLORS[1])
    expect(analyticsColorScale('baz')).toBe(COLORS[2])
    expect(analyticsColorScale('qux')).toBe(COLORS[3])
  })

});

