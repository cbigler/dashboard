import { csvParseRows, csvFormatRows } from 'd3-dsv';


/* eslint-disable no-useless-escape */
const LEADING_MINUS_SIGN_FOLLOWED_BY_NON_DIGIT = /^\-(?=[^\d])/g;
const FORBIDDEN = /^[\@\=\+\!]+/g;
/* eslint-enable no-useless-escape */

export function sanitizeCellText(cellText: string): string {
  // remove leading and trailing whitespace
  const trimmed = cellText.trim();

  // strip forbidden sequences
  return trimmed
    .replace(LEADING_MINUS_SIGN_FOLLOWED_BY_NON_DIGIT, '')
    .replace(FORBIDDEN, '')
}

export function sanitizeCSVDocument(csvText: string): string {
  const parsed = csvParseRows(csvText);

  // sanitize cells in each row
  const rows = parsed.map(row => {
    return row.map(sanitizeCellText)
  })

  return csvFormatRows(rows);
}