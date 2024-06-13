import randomInRange from "../util/randomInRange.ts";

/** A three-dimensional vector */
export default class Vec3 {
  /** Create a Vec3 that is the sum of two other Vec3s */
  static add<T extends Vec3>(a: T, b: T): T {
    return Reflect.construct(a.constructor, [a.x + b.x, a.y + b.y, a.z + b.z]);
  }
  /** Create a Vec3 that is the difference of two other Vec3s */
  static subtract<T extends Vec3>(a: T, b: T): T {
    return Reflect.construct(a.constructor, [a.x - b.x, a.y - b.y, a.z - b.z]);
  }
  private static multiplyTwoVec3s<T extends Vec3>(a: T, b: T): T {
    return Reflect.construct(a.constructor, [a.x * b.x, a.y * b.y, a.z * b.z]);
  }
  private static multiplyVec3ByNumber<T extends Vec3>(v: T, x: number): T {
    return Reflect.construct(v.constructor, [v.x * x, v.y * x, v.z * x]);
  }
  private static multiplyNumberByVec3<T extends Vec3>(x: number, v: T): T {
    return Vec3.multiplyVec3ByNumber(v, x);
  }
  static multiply<T extends Vec3>(a: T, b: T): T;
  static multiply<T extends Vec3>(a: T, b: number): T;
  static multiply<T extends Vec3>(a: number, b: T): T;
  /** Create a Vec3 that is the product of two Vec3s or a Vec3 and a number */
  static multiply<T extends Vec3>(a: T | number, b: T | number): T {
    if (typeof a === "number") {
      return Vec3.multiplyNumberByVec3(a, b as T);
    } else if (typeof b === "number") {
      return Vec3.multiplyVec3ByNumber(a, b);
    }
    return Vec3.multiplyTwoVec3s(a, b);
  }
  /** Create a Vec3 that is the quotient of a Vec3 and a number */
  static divide<T extends Vec3>(v: T, x: number): T {
    return Vec3.multiply(v, 1 / x);
  }
  /** Get the dot product of two Vec3s */
  static dot<T extends Vec3>(a: T, b: T): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }
  /** Get the cross product of two Vec3s */
  static cross<T extends Vec3>(a: T, b: T): T {
    return Reflect.construct(a.constructor, [
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x,
    ]);
  }
  /** Get the unit vector of a Vec3 */
  static unitVector<T extends Vec3>(v: T): T {
    return Vec3.divide(v, v.length());
  }
  /** Create a random Vec3 */
  static random(random: () => number, min: number, max: number): Vec3 {
    return new Vec3(
      randomInRange(random, min, max),
      randomInRange(random, min, max),
      randomInRange(random, min, max),
    );
  }
  /** Get a point within the unit sphere */
  static randomInUnitSphere(random: () => number) {
    while (true) {
      const p = Vec3.random(random, -1, 1);
      if (p.lengthSquared() >= 1) continue;
      return p;
    }
  }
  /** Get a random unit vector */
  static randomUnitVector(random: () => number) {
    return Vec3.unitVector(Vec3.randomInUnitSphere(random));
  }
  /** Get a random vector in hemisphere */
  static randomInHemisphere(random: () => number, normal: Vec3): Vec3 {
    const inUnitSphere = Vec3.randomInUnitSphere(random);
    return Vec3.dot(inUnitSphere, normal) > 0
      ? inUnitSphere
      : Vec3.multiply(inUnitSphere, -1);
  }
  /** Determine whether a Vec3 is close to zero in all dimensions */
  static nearZero(v: Vec3): boolean {
    const s = 1e-8;
    return Math.abs(v.x) < s && Math.abs(v.y) < s && Math.abs(v.z) < s;
  }
  /** Reflect a Vec3 */
  static reflect(v: Vec3, n: Vec3): Vec3 {
    return Vec3.subtract(v, Vec3.multiply(2 * Vec3.dot(v, n), n));
  }
  /** Refract a Vec3 */
  static refract(uv: Vec3, n: Vec3, etaiOverEtat: number) {
    const cosTheta = Math.min(Vec3.dot(Vec3.multiply(uv, -1), n), 1);
    const rOutPerp = Vec3.multiply(
      etaiOverEtat,
      Vec3.add(uv, Vec3.multiply(cosTheta, n)),
    );
    const rOutParallel = Vec3.multiply(
      -Math.sqrt(Math.abs(1.0 - rOutPerp.lengthSquared())),
      n,
    );
    return Vec3.add(rOutPerp, rOutParallel);
  }
  /** Get a random Vec3 in unit disk */
  static randomInUnitDisk(random: () => number) {
    while (true) {
      const p = new Vec3(
        randomInRange(random, -1, 1),
        randomInRange(random, -1, 1),
        0,
      );
      if (p.lengthSquared() >= 1) continue;
      return p;
    }
  }
  /** Create a Vec3 */
  constructor(public x: number, public y: number, public z: number) {}
  /** Get the string representation of this Vec3 */
  string(): string {
    return `${Math.round(255 * this.x)} ${
      Math.round(
        255 * this.y,
      )
    } ${Math.round(255 * this.z)}`;
  }
  /** Get the length of the Vec3 */
  length(): number {
    return Math.sqrt(this.lengthSquared());
  }
  /** Get the length ** 2 of the Vec3 */
  lengthSquared(): number {
    return this.x ** 2 + this.y ** 2 + this.z ** 2;
  }
}
