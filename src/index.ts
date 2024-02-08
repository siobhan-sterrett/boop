import { Canvas } from "./canvas";

const canvas = new Canvas();
document.body.appendChild(canvas.element);

requestAnimationFrame(() => canvas.drawLoop());
