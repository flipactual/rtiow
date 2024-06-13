/** Get a random number in specified range */
export default (random: () => number, min: number, max: number): number =>
  random() * (max - min) + min;
