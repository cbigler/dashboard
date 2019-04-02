export default function deduplicate(array) {
  return [ ...(new Set(array) as any) ];
}
