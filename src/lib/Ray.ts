import Vec3 from "./Vec3.ts";
import Point3 from "./Point3.ts";

/** A ray */
export default class Ray {
  /** The Ray's origin */
  public origin: Point3;
  /** The Ray's direction */
  public direction: Vec3;
  /** Create a Ray */
  constructor(origin: Point3, direction: Vec3) {
    this.origin = origin;
    this.direction = direction;
  }
  /** Get the value at a position on the Ray */
  at(t: number): Point3 {
    return Point3.add(this.origin, Vec3.multiply(t, this.direction));
  }
}
