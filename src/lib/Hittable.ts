import Point3 from "./Point3.ts";
import Ray from "./Ray.ts";
import Material from "./Material.ts";
import Vec3 from "./Vec3.ts";

/**
 * Information about a hit
 */
export interface HitRecord {
  p: Point3;
  normal: Vec3;
  matPtr: Material;
  t: number;
  frontFace: boolean;
}

/** Interface for objects which can be hit */
export default interface Hittable {
  hit(r: Ray, tMin: number, tMax: number): [boolean, HitRecord];
}
