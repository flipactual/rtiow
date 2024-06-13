import Point3 from "./Point3.ts";
import Vec3 from "./Vec3.ts";
import Ray from "./Ray.ts";

import degreesToRadians from "../util/degreesToRadians.ts";

/** A camera */
export default class Camera {
  /** The origin */
  public origin: Point3;
  /** The horizontal */
  public horizontal: Vec3;
  /** The vertical */
  public vertical: Vec3;
  /** The lower left corner */
  public lowerLeftCorner: Vec3;
  /** The radius of the lens */
  public lensRadius: number;
  /** The x vector */
  public u: Vec3;
  /** The y vector */
  public v: Vec3;
  /** The z vector */
  public w: Vec3;
  /** Create a Camera */
  constructor(
    lookFrom: Point3,
    lookAt: Point3,
    vup: Vec3,
    vfov: number,
    aspectRatio: number,
    aperture: number,
    focusDist: number,
  ) {
    const theta = degreesToRadians(vfov);
    const h = Math.tan(theta / 2);
    const viewportHeight = 2 * h;
    const viewportWidth = aspectRatio * viewportHeight;

    this.w = Vec3.unitVector(Vec3.subtract(lookFrom, lookAt));
    this.u = Vec3.unitVector(Vec3.cross(vup, this.w));
    this.v = Vec3.cross(this.w, this.u);

    this.origin = lookFrom;
    this.horizontal = Vec3.multiply(
      focusDist,
      Vec3.multiply(viewportWidth, this.u),
    );
    this.vertical = Vec3.multiply(
      focusDist,
      Vec3.multiply(viewportHeight, this.v),
    );
    this.lowerLeftCorner = Vec3.subtract(
      Vec3.subtract(
        Vec3.subtract(this.origin, Vec3.divide(this.horizontal, 2)),
        Vec3.divide(this.vertical, 2),
      ),
      Vec3.multiply(focusDist, this.w),
    );

    this.lensRadius = aperture / 2;
  }
  /** Get a Ray from the Camera */
  getRay(random: () => number, s: number, t: number): Ray {
    const rd = Vec3.multiply(this.lensRadius, Vec3.randomInUnitDisk(random));
    const offset = Vec3.add(
      Vec3.multiply(this.u, rd.x),
      Vec3.multiply(this.v, rd.y),
    );
    const sByHorizontal = Vec3.multiply(s, this.horizontal);
    const tByVertical = Vec3.multiply(t, this.vertical);
    const sum = Vec3.add(
      Vec3.add(this.lowerLeftCorner, sByHorizontal),
      tByVertical,
    );
    return new Ray(
      Vec3.add(this.origin, offset),
      Vec3.subtract(Vec3.subtract(sum, this.origin), offset),
    );
  }
}
