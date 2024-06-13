import Vec3 from "./Vec3.ts";
import clamp from "../util/clamp.ts";

/** An RGB color */
export default class Color extends Vec3 {
  /** Get the string representation of this Color */
  sample(samplesPerPixel: number): string {
    const scale = 1 / samplesPerPixel;
    const c = clamp(0, 0.999);
    return `${
      [this.x, this.y, this.z]
        .map((x) => c(Math.sqrt(x * scale)))
        .join(" ")
    }`;
  }
}
