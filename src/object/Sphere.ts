import Hittable, { HitRecord } from "../lib/Hittable.ts";
import Point3 from "../lib/Point3.ts";
import Ray from "../lib/Ray.ts";
import Material from "../lib/Material.ts";
import Vec3 from "../lib/Vec3.ts";
import Camera from "../lib/Camera.ts";

/** A sphere */
export default class Sphere implements Hittable {
	/** The center of the Sphere */
	public center: Point3;
	/** The radius of the Sphere */
	public radius: number;
	/** The material of the Sphere */
	public material: Material;

	/** Create a Sphere */
	constructor(center: Point3, radius: number, material: Material) {
		this.center = center;
		this.radius = radius;
		this.material = material;
	}

	/** Calculate if the Sphere is hit by a Ray */
	hit(r: Ray, tMin: number, tMax: number): [boolean, HitRecord] {
		const oc: Vec3 = Vec3.subtract(r.origin, this.center);
		const a = r.direction.lengthSquared();
		const halfB = Vec3.dot(oc, r.direction);
		const c = oc.lengthSquared() - this.radius ** 2;

		const discriminant = halfB ** 2 - a * c;
		if (discriminant < 0) return [false, {} as HitRecord];
		const sqrtd = Math.sqrt(discriminant);

		let root = (-halfB - sqrtd) / a;
		if (root < tMin || tMax < root) {
			root = (-halfB + sqrtd) / a;
			if (root < tMin || tMax < root) {
				return [false, {} as HitRecord];
			}
		}

		const t = root;
		const p = r.at(t);
		const outwardNormal = Vec3.divide(
			Vec3.subtract(p, this.center),
			this.radius,
		);
		const frontFace = Vec3.dot(r.direction, outwardNormal) < 0;
		const rec: HitRecord = {
			t,
			p,
			frontFace,
			normal: frontFace ? outwardNormal : Vec3.multiply(outwardNormal, -1),
			matPtr: this.material,
		};

		return [true, rec];
	}

	/** Draw the wireframe of the Sphere */
	draw(context: CanvasRenderingContext2D, camera: Camera): void {
		const canvasWidth = context.canvas.width;
		const canvasHeight = context.canvas.height;

		const screenCenter = camera.worldToScreen(
			this.center,
			canvasWidth,
			canvasHeight,
		);
		const screenEdge = camera.worldToScreen(
			new Point3(
				this.center.x,
				this.center.y + this.radius,
				this.center.z,
			),
			canvasWidth,
			canvasHeight,
		);

		const screenRadius = Math.sqrt(
			((screenEdge.x - screenCenter.x) ** 2) +
				((screenEdge.y - screenCenter.y) ** 2),
		);

		context.beginPath();
		context.arc(screenCenter.x, screenCenter.y, screenRadius, 0, 2 * Math.PI);
		context.stroke();
	}
}
