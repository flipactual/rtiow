import Ray from "./Ray.ts";
import Point3 from "./Point3.ts";
import Vec3 from "./Vec3.ts";
import { HitRecord } from "./Hittable.ts";
import Color from "./Color.ts";

/** A material */
export default class Material {
  /** Scatter Ray and calculate attenuation */
  scatter(
    _rIn: Ray,
    _rec: HitRecord,
    _random: () => number,
  ): [boolean, Color, Ray] {
    return [
      false,
      new Color(0, 0, 0),
      new Ray(new Point3(0, 0, 0), new Vec3(0, 0, 0)),
    ];
  }
}
