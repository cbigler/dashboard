export function createIdGenerator(prefix: string) {
  return () => `${prefix}_${Math.floor(Math.random() * 1e12)}`
}
