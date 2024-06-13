import Material from "../lib/Material.ts";
import Color from "../lib/Color.ts";
import Vec3 from "../lib/Vec3.ts";
import Ray from "../lib/Ray.ts";
import { HitRecord } from "../lib/Hittable.ts";

/** Lambertian material */
export default class Lambertian extends Material {
  /** The albedo */
  public albedo: Color;
  /** Create a Lambertian Material */
  constructor(a: Color) {
    super();
    this.albedo = a;
  }
  /** Scatter Ray and calculate attenuation */
  public override scatter(
    _rIn: Ray,
    rec: HitRecord,
    random: () => number,
  ): [boolean, Color, Ray] {
    let scatterDirection = Vec3.add(rec.normal, Vec3.randomUnitVector(random));
    if (Vec3.nearZero(scatterDirection)) {
      scatterDirection = rec.normal;
    }
    return [true, this.albedo, new Ray(rec.p, scatterDirection)];
  }
}
