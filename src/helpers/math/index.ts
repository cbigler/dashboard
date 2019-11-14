/**
 * Computes `a mod n` for integer inputs `a` and `n`
 * 
 * Correctly handles negative values for `a`
 * 
 * For context, see: https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm
 */
export const mod = (a: number, n: number) => ((a % n) + n) % n;
