import Color from "./lib/Color.ts";
import Point3 from "./lib/Point3.ts";
import Vec3 from "./lib/Vec3.ts";
import Camera from "./lib/Camera.ts";

import xoshiro from "./util/xoshiro.ts";
import getRayColor from "./util/getRayColor.ts";

import getRandomRTIOWFinalScene from "./scene/getRandomRTIOWFinalScene.ts";

self.onmessage = (e) => {
	const { yStart, yEnd, width, height, samplesPerPixel, cameraOrigin, seed }: {
		yStart: number;
		yEnd: number;
		width: number;
		height: number;
		samplesPerPixel: number;
		cameraOrigin: { x: number; y: number; z: number };
		seed: [number, number, number, number];
	} = e.data;

	const random = xoshiro(...seed);
	const world = getRandomRTIOWFinalScene(random);

	const depth = 50;
	const lookFrom = new Vec3(cameraOrigin.x, cameraOrigin.y, cameraOrigin.z);
	const lookAt = new Point3(0, 0, 0);
	const aspectRatio = width / height;
	const focusDist = Vec3.subtract(lookFrom, lookAt).length();

	const camera = new Camera(
		lookFrom,
		lookAt,
		new Vec3(0, 1, 0),
		20,
		aspectRatio,
		0.1,
		focusDist,
	);

	const result: string[][] = Array.from(
		{ length: yEnd - yStart },
		() => Array(width).fill(new Color(0, 0, 0)),
	);

	const accumulatedColors: Color[][] = Array.from(
		{ length: yEnd - yStart },
		() => Array(width).fill(new Color(0, 0, 0)),
	);

	for (let s = 0; s < samplesPerPixel; s += 1) {
		for (let y = 0; y < yEnd - yStart; y += 1) {
			const canvasY = height - 1 - (yStart + y);
			for (let x = 0; x < width; x += 1) {
				const u = (x + random()) / (width - 1);
				const v = (canvasY + random()) / (height - 1);
				const r = camera.getRay(random, u, v);
				const color = getRayColor(random, r, world, depth);
				accumulatedColors[y]![x] = Color.add(accumulatedColors[y]![x]!, color);
				result[y]![x]! = accumulatedColors[y]![x]!.sample(s + 1);
			}
		}

		self.postMessage({
			result: result.map((row) => row.map((color) => color.toString())),
			yStart,
			sample: s + 1,
		});
	}
};
