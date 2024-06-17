import Point3 from "./lib/Point3.ts";
import Vec3 from "./lib/Vec3.ts";
import Camera from "./lib/Camera.ts";

import xoshiro from "./util/xoshiro.ts";

import getRandomRTIOWFinalScene from "./scene/getRandomRTIOWFinalScene.ts";

const SAMPLES_PER_PIXEL = 500;
const WIDTH = 1280;
const HEIGHT = Math.floor(WIDTH * (9 / 16));
const SEED: [number, number, number, number] = [1_000, 2_000, 3_000, 4_000];

/* Main */
const main = document.createElement("main");
document.body.appendChild(main);

/* Canvas */
const canvas = document.createElement("canvas");
canvas.width = WIDTH;
canvas.height = HEIGHT;
main.appendChild(canvas);
const context = canvas.getContext("2d", { colorSpace: "display-p3" })!;

/* Progress */
const progress = document.createElement("progress");
progress.max = 100;
progress.value = 0;
main.appendChild(progress);

/* Export */
const button = document.createElement("button");
button.textContent = "Export as PNG ";
button.addEventListener("click", () => {
	canvas.toBlob(
		(blob) => {
			const newImg = document.createElement("img");
			const url = URL.createObjectURL(blob!);
			newImg.onload = () => URL.revokeObjectURL(url);
			newImg.src = url;
			main.appendChild(newImg);
		},
		"image/png",
		1,
	);
});
main.appendChild(button);

/* Workers */
const threadCount = navigator.hardwareConcurrency || 4;
const batchSize = Math.ceil(HEIGHT / threadCount);
let workers: Worker[] = [];
let completedSamples = 0;

let cameraTheta = 0.3;
let cameraPhi = Math.PI / 2 * .8;
const radius = 13;

const target = new Point3(0, 1, 0);

function getCameraOrigin(): Point3 {
	return new Point3(
		target.x + radius * Math.sin(cameraPhi) * Math.cos(cameraTheta),
		target.y + radius * Math.cos(cameraPhi),
		target.z + radius * Math.sin(cameraPhi) * Math.sin(cameraTheta),
	);
}

function startRendering() {
	workers.forEach((worker) => worker.terminate());
	workers = [];
	completedSamples = 0;
	progress.value = 0;

	const cameraOrigin = getCameraOrigin();

	const random = xoshiro(...SEED);
	const world = getRandomRTIOWFinalScene(random);

	const aspectRatio = canvas.width / canvas.height;

	const camera = new Camera(
		new Point3(cameraOrigin.x, cameraOrigin.y, cameraOrigin.z),
		new Point3(0, 0, 0),
		new Vec3(0, 1, 0),
		20,
		aspectRatio,
		0.1,
		10,
	);

	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = `color(display-p3 0 0 0)`;
	world.draw(context, camera);

	for (let i = 0; i < threadCount; i++) {
		const worker = new Worker("worker.js");
		workers.push(worker);

		worker.onmessage = (e) => {
			const { result, yStart } = e.data;

			for (let y = 0; y < result.length; y += 1) {
				for (let x = 0; x < result[y].length; x += 1) {
					context.fillStyle = `color(display-p3 ${result[y][x]})`;
					context.fillRect(x, yStart + y, 1, 1);
				}
			}

			progress.value = (completedSamples += 1) /
				(Math.ceil(threadCount * SAMPLES_PER_PIXEL)) *
				100;
		};

		const yStart = i * batchSize;
		const yEnd = Math.min((i + 1) * batchSize, HEIGHT);

		worker.postMessage({
			yStart,
			yEnd,
			width: WIDTH,
			height: HEIGHT,
			samplesPerPixel: SAMPLES_PER_PIXEL,
			cameraOrigin,
			seed: SEED,
		});
	}
}

startRendering();

let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

canvas.addEventListener("mousedown", (e) => {
	isDragging = true;
	lastMouseX = e.clientX;
	lastMouseY = e.clientY;
});

canvas.addEventListener("mousemove", (e) => {
	if (!isDragging) return;

	const deltaX = e.clientX - lastMouseX;
	const deltaY = e.clientY - lastMouseY;

	cameraTheta += deltaX * 0.001;
	cameraPhi -= deltaY * 0.001;

	// Clamp the phi angle to avoid flipping the camera upside down
	cameraPhi = Math.max(0.01, Math.min(Math.PI - 0.01, cameraPhi));

	lastMouseX = e.clientX;
	lastMouseY = e.clientY;

	startRendering();
});

canvas.addEventListener("mouseup", () => {
	isDragging = false;
});

canvas.addEventListener("mouseleave", () => {
	isDragging = false;
});

document.addEventListener("mouseup", () => {
	isDragging = false;
});
