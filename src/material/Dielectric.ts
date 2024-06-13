import Material from "../lib/Material.ts";
import Color from "../lib/Color.ts";
import Vec3 from "../lib/Vec3.ts";
import Ray from "../lib/Ray.ts";
import { HitRecord } from "../lib/Hittable.ts";

/** Dielectric material */
export default class Dielectric extends Material {
  /** The index of refraction */
  public ir: number;
  /** Create a Dielectric Material */
  constructor(indexOfRefraction: number) {
    super();
    this.ir = indexOfRefraction;
  }
  /** Scatter Ray and calculate attenuation */
  public override scatter(
    rIn: Ray,
    rec: HitRecord,
    random: () => number,
  ): [boolean, Color, Ray] {
    const attenuation = new Color(1, 1, 1);
    const refractionRatio = rec.frontFace ? 1 / this.ir : this.ir;

    const unitDirection = Vec3.unitVector(rIn.direction);
    const cosTheta = Math.min(
      Vec3.dot(Vec3.multiply(unitDirection, -1), rec.normal),
      1,
    );
    const sinTheta = Math.sqrt(1 - cosTheta ** 2);

    const cannotRefract = refractionRatio * sinTheta > 1;

    const direction =
      cannotRefract || this.reflectance(cosTheta, refractionRatio) > random()
        ? Vec3.reflect(unitDirection, rec.normal)
        : Vec3.refract(unitDirection, rec.normal, refractionRatio);

    const scattered = new Ray(rec.p, direction);
    return [true, attenuation, scattered];
  }
  /** Calculate reflectance */
  private reflectance(cosine: number, refIdx: number): number {
    let r0 = (1 - refIdx) / (1 + refIdx);
    r0 = r0 ** 2;
    return r0 + (1 - r0) * (1 - cosine) ** 5;
  }
}
