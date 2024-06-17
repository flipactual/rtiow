import Ray from "./Ray.ts";
import Hittable, { HitRecord } from "./Hittable.ts";
import Camera from "./Camera.ts";

/** A list of hittables */
export default class HittableList implements Hittable {
	public list: Hittable[] = [];
	/** Create a HittableList */
	constructor() {}
	/** Clear the list */
	clear() {
		this.list = [];
	}
	/** Add an entity to the list */
	add(item: Hittable) {
		this.list.push(item);
	}
	/** Determine if there's a hit in the list */
	hit(r: Ray, tMin: number, tMax: number): [boolean, HitRecord] {
		let lastRec = {} as HitRecord;
		let hitAnything = false;
		let closestSoFar = tMax;

		this.list.forEach((item) => {
			const [hit, rec] = item.hit(r, tMin, closestSoFar);
			if (hit) {
				hitAnything = true;
				closestSoFar = rec.t;
				lastRec = rec;
			}
		});

		return [hitAnything, lastRec];
	}
	/** Draw wireframe of each item in list */
	draw(context: CanvasRenderingContext2D, camera: Camera) {
		for (const item of this.list) {
			item.draw(context, camera);
		}
	}
}
