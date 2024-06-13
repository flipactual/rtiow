import Color from "../lib/Color.ts";
import HittableList from "../lib/HittableList.ts";
import Vec3 from "../lib/Vec3.ts";
import Point3 from "../lib/Point3.ts";

import Sphere from "../object/Sphere.ts";

import Lambertian from "../material/Lambertian.ts";
import Metal from "../material/Metal.ts";
import Dielectric from "../material/Dielectric.ts";

import randomInRange from "../util/randomInRange.ts";

export default function getRandomRTIOWFinalScene(
  random: () => number,
): HittableList {
  const world = new HittableList();

  const groundMaterial = new Lambertian(new Color(0.5, 0.5, 0.5));
  world.add(new Sphere(new Point3(0, -1000, 0), 1000, groundMaterial));

  for (let a = -11; a < 11; a += 1) {
    for (let b = -11; b < 11; b += 1) {
      const chooseMat = random();
      const center = new Point3(
        a + 0.75 * random(),
        0.2,
        b + 0.75 * random(),
      );

      if (
        Vec3.subtract(center, new Point3(0, 1, 0)).length() > 1.35 &&
        Vec3.subtract(center, new Point3(-4, 1, 0)).length() > 1.35 &&
        Vec3.subtract(center, new Point3(4, 1, 0)).length() > 1.35
      ) {
        if (chooseMat < 0.8) {
          /* diffuse */
          const albedo = Vec3.multiply(
            Color.random(random, 0, 1),
            Color.random(random, 0, 1),
          );
          world.add(new Sphere(center, 0.2, new Lambertian(albedo as Color)));
        } else if (chooseMat < 0.95) {
          /* metal */
          const albedo = Color.random(random, 0.5, 1);
          const fuzz = randomInRange(random, 0, 0.5);
          world.add(new Sphere(center, 0.2, new Metal(albedo as Color, fuzz)));
        } else {
          /* glass */
          world.add(new Sphere(center, 0.2, new Dielectric(1.5)));
        }
      }
    }
  }

  const material1 = new Dielectric(1.5);
  const material2 = new Lambertian(new Color(0.4, 0.2, 0.1));
  const material3 = new Metal(new Color(0.7, 0.6, 0.5), 0.0);

  world.add(new Sphere(new Point3(0, 1, 0), 1.0, material1));
  world.add(new Sphere(new Point3(-4, 1, 0), 1.0, material2));
  world.add(new Sphere(new Point3(4, 1, 0), 1.0, material3));

  return world;
}
