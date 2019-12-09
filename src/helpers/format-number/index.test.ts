import { commaFormat } from '.';

describe('commaFormat', () => {
  it('should format numbers using commas to separate thousands, millions, etc.', () => {
    expect(commaFormat(1000)).toBe('1,000');
    expect(commaFormat(200)).toBe('200');
    expect(commaFormat(123456789)).toBe('123,456,789');
    expect(commaFormat(NaN)).toBe('');
  })
})
