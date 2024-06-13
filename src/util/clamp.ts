/** Clamps a number to a number within boundaries */
export default (min: number, max: number) => (n: number) =>
  Math.min(Math.max(n, min), max);
