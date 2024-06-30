import Point3 from "./lib/Point3.ts";
import Vec3 from "./lib/Vec3.ts";
import Camera from "./lib/Camera.ts";
import xoshiro from "./util/xoshiro.ts";
import getRandomRTIOWFinalScene from "./scene/getRandomRTIOWFinalScene.ts";

const SEED: [number, number, number, number] = [1_000, 2_000, 3_000, 4_000];

let samplesPerPixel = 500;
let width = 1280;
let height = Math.floor(width * (9 / 16));

/**
 * Interface
 */

/* Main */
const main = document.createElement("main");
document.body.appendChild(main);

/** Canvas */
const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;
main.appendChild(canvas);
const context = canvas.getContext("2d", { colorSpace: "display-p3" })!;

/* Progress */
const progress = document.createElement("progress");
progress.max = 100;
progress.value = 0;
main.appendChild(progress);

/** Controls */
const controls = document.createElement("div");
controls.id = "controls";

/** Inputs */
const inputs = document.createElement("div");
inputs.id = "inputs";

/** Width Input */
const widthContainer = document.createElement("div");
widthContainer.classList.add("controls-container");

const widthLabel = document.createElement("label");
widthLabel.textContent = "Width: ";
widthLabel.htmlFor = "widthInput";

const widthInput = document.createElement("input");
widthInput.type = "number";
widthInput.id = "widthInput";
widthInput.value = width.toString();
widthInput.min = "1";
widthInput.addEventListener("change", () => {
	width = parseInt(widthInput.value, 10);
	canvas.width = width;
	height = Math.floor(width * (9 / 16));
	canvas.height = height;
	drawWireframe();
});

widthContainer.appendChild(widthLabel);
widthContainer.appendChild(widthInput);

inputs.appendChild(widthContainer);

/** Samples Per Pixel Input */
const samplesContainer = document.createElement("div");
samplesContainer.classList.add("controls-container");

const samplesLabel = document.createElement("label");
samplesLabel.textContent = "Samples Per Pixel: ";
samplesLabel.htmlFor = "samplesInput";

const samplesInput = document.createElement("input");
samplesInput.type = "number";
samplesInput.id = "samplesInput";
samplesInput.value = samplesPerPixel.toString();
samplesInput.min = "1";
samplesInput.addEventListener("change", () => {
	samplesPerPixel = parseInt(samplesInput.value, 10);
	drawWireframe();
});

samplesContainer.appendChild(samplesLabel);
samplesContainer.appendChild(samplesInput);

inputs.appendChild(samplesContainer);

controls.appendChild(inputs);

/** Buttons */
const buttons = document.createElement("div");
buttons.id = "buttons";

/** Render */
const renderButton = document.createElement("button");
renderButton.textContent = "Render";
renderButton.addEventListener("click", () => {
	startRendering();
});
buttons.appendChild(renderButton);

/** Export */
const exportButton = document.createElement("button");
exportButton.textContent = "Export";
exportButton.addEventListener("click", () => {
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
buttons.appendChild(exportButton);

controls.appendChild(buttons);

main.appendChild(controls);

/**
 * Listeners
 */

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

	/* Clamp the phi angle to avoid flipping the camera upside down */
	cameraPhi = Math.max(0.01, Math.min(Math.PI - 0.01, cameraPhi));

	lastMouseX = e.clientX;
	lastMouseY = e.clientY;

	drawWireframe();
});

canvas.addEventListener("mouseleave", () => {
	isDragging = false;
});

document.addEventListener("mouseup", () => {
	isDragging = false;
});

canvas.addEventListener("wheel", (e) => {
	e.preventDefault();
	const zoomAmount = e.deltaY * -0.01;
	radius = Math.max(1, radius - zoomAmount);
	drawWireframe();
});

/**
 * Workers
 */

const threadCount = navigator.hardwareConcurrency || 1;
const batchSize = Math.ceil(height / threadCount);
let workers: Worker[] = [];
let completedSamples = 0;

let cameraTheta = 0 * (Math.PI * 2); // Azimuthal angle in radians
let cameraPhi = (Math.PI / 2) * 0.75; // Polar angle in radians
let radius = 13; // Distance from the focal point

const target = new Point3(0, 1, 0);

function getCameraOrigin(): Point3 {
	return new Point3(
		target.x + radius * Math.sin(cameraPhi) * Math.cos(cameraTheta),
		target.y + radius * Math.cos(cameraPhi),
		target.z + radius * Math.sin(cameraPhi) * Math.sin(cameraTheta),
	);
}

function drawWireframe() {
	kill();

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
}

drawWireframe();

/** Terminate workers and reset */
function kill() {
	workers.forEach((worker) => worker.terminate());
	workers = [];
	completedSamples = 0;
	progress.value = 0;
}

function startRendering() {
	kill();

	const cameraOrigin = getCameraOrigin();

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
				(Math.ceil(threadCount * samplesPerPixel)) * 100;
		};

		const yStart = i * batchSize;
		const yEnd = Math.min((i + 1) * batchSize, height);

		worker.postMessage({
			yStart,
			yEnd,
			width: width,
			height: height,
			samplesPerPixel: samplesPerPixel,
			cameraOrigin,
			seed: SEED,
		});
	}
}
