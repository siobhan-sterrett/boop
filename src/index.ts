import { App } from './app/app';

function isCanvasElement(element: HTMLElement | null): element is HTMLCanvasElement {
    return element?.tagName == 'CANVAS';
}

const canvasElement = document.getElementById('app-canvas');
if (isCanvasElement(canvasElement)) {
    new App(canvasElement).run();
} else {
    throw new Error('Cannot find canvas element');
}
