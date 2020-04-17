import { csvParseRows, csvFormatRows } from 'd3-dsv';


// \w matches alphanumeric characters
// \040 matches the space character
// \- matches the minus sign character
// [^] negates a set
// | is a logical OR
// (?:) is a non-capturing group
// \d matches numeric digits
// This regex matches anything that is not alphanumeric, space, or minus sign,
//   and also matches minus signs that are followed by non-digits

/* eslint-disable no-useless-escape */
const FORBIDDEN = /[^\w\040\.\-]|(?:\-[^\d])/g;
/* eslint-enable no-useless-escape */

export function sanitizeCellText(cellText: string): string {
  return cellText.replace(FORBIDDEN, '');
}

export function sanitizeCSVDocument(csvText: string): string {
  const parsed = csvParseRows(csvText);

  // sanitize cells in each row
  const rows = parsed.map(row => {
    return row.map(sanitizeCellText)
  })

  return csvFormatRows(rows);
}