import { sanitizeCellText, sanitizeCSVDocument } from '.';


const safeDocument = `one,two,three
1,2,3
4,5,6
7,8,9
-1,-2,-3`;

const dangerDocument = `one,=two,three
@1,!2,+3
==4,@@5,!=6
-=7,!@8,++9
@-1,!-2,++-3`;


describe('sanitizeCSVDocument', () => {
    it('should leave a safe document unaltered', () => {
        const result = sanitizeCSVDocument(safeDocument);
        expect(result).toEqual(safeDocument);
    })
    it('should remove the problematic characters from a dangerous document ', () => {
        const result = sanitizeCSVDocument(dangerDocument);
        expect(result).toEqual(safeDocument);
    })
})

describe('sanitizeCellText', () => {
    it('should allow negative numbers', () => {
        const text = '-2'
        const result = sanitizeCellText(text)
        expect(result).toEqual(text)
    })
    it('should allow decimals', () => {
        const text = '3.14'
        const result = sanitizeCellText(text)
        expect(result).toEqual(text)
    })
    it('should allow ISO timestamps', () => {
        const text = '2020-04-20T12:34:56Z'
        const result = sanitizeCellText(text)
        expect(result).toEqual(text)
    })
    it('should allow Excel-friendly timestamps', () => {
        const text = '2020-04-20 12:34:56'
        const result = sanitizeCellText(text)
        expect(result).toEqual(text)
    })
    it('should strip forbidden control characters', () => {
        expect(sanitizeCellText('@foo')).toEqual('foo')
        expect(sanitizeCellText('=foo')).toEqual('foo')
        expect(sanitizeCellText('==foo')).toEqual('foo')
        expect(sanitizeCellText('+foo')).toEqual('foo')
        expect(sanitizeCellText('+=foo')).toEqual('foo')
        expect(sanitizeCellText('-=foo')).toEqual('foo')
        expect(sanitizeCellText('!foo')).toEqual('foo')
        expect(sanitizeCellText('=!foo')).toEqual('foo')
        expect(sanitizeCellText('!=foo')).toEqual('foo')
    })
})