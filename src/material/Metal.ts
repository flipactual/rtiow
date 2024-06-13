import Material from "../lib/Material.ts";
import Color from "../lib/Color.ts";
import Vec3 from "../lib/Vec3.ts";
import Ray from "../lib/Ray.ts";
import { HitRecord } from "../lib/Hittable.ts";

/** Metal material */
export default class Metal extends Material {
  /** The albedo */
  public albedo: Color;
  /** The fuzz */
  public fuzz: number;
  /** Create a Lambertian Material */
  constructor(a: Color, f: number) {
    super();
    this.albedo = a;
    this.fuzz = f < 1 ? f : 1;
  }
  /** Scatter Ray and calculate attenuation */
  public override scatter(
    rIn: Ray,
    rec: HitRecord,
    random: () => number,
  ): [boolean, Color, Ray] {
    const reflected = Vec3.reflect(Vec3.unitVector(rIn.direction), rec.normal);
    const scattered = new Ray(
      rec.p,
      Vec3.add(
        reflected,
        Vec3.multiply(this.fuzz, Vec3.randomInUnitSphere(random)),
      ),
    );
    return [
      Vec3.dot(scattered.direction, rec.normal) > 0,
      this.albedo,
      scattered,
    ];
  }
}
