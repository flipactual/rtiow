/** Xoshiro PRNG */
export default (a: number, b: number, c: number, d: number) => () => {
  const t = b << 9;
  let r = a * 5;
  r = ((r << 7) | (r >>> 25)) * 9;
  c = c ^ a;
  d = d ^ b;
  b = b ^ c;
  a = a ^ d;
  c = c ^ t;
  d = (d << 11) | (d >>> 21);
  return (r >>> 0) / 4294967296;
};
