export function commaFormat(n: number) {
  if (isNaN(n)) return '';
  return String(Math.ceil(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
}
