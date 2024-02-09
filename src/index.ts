import { Canvas } from "./canvas/canvas.ts";

const canvas = new Canvas();
document.body.appendChild(canvas.element);

requestAnimationFrame(() => canvas.drawLoop());
