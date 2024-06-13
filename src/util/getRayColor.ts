import Color from "../lib/Color.ts";
import Ray from "../lib/Ray.ts";
import Vec3 from "../lib/Vec3.ts";
import Hittable from "../lib/Hittable.ts";

export default function getRayColor(
  random: () => number,
  r: Ray,
  world: Hittable,
  depth: number,
): Color {
  if (depth <= 0) {
    return new Color(0, 0, 0);
  }
  const [hit, rec] = world.hit(r, 0.001, Number.POSITIVE_INFINITY);
  if (hit) {
    const [scatter, attenuation, scattered] = rec.matPtr.scatter(
      r,
      rec,
      random,
    );
    return scatter
      ? Vec3.multiply(
        attenuation,
        getRayColor(random, scattered, world, depth - 1),
      )
      : new Color(0, 0, 0);
  }
  const unitDirection: Vec3 = Vec3.unitVector(r.direction);
  const t = 0.5 * (unitDirection.y + 1);
  return Color.add(
    Color.multiply(1.0 - t, new Color(1.0, 1.0, 1.0)),
    Color.multiply(t, new Color(0.5, 0.7, 1.0)),
  );
}
