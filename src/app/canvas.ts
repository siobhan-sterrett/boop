import { Scene } from "./scene";

export class Canvas {
    #element: HTMLCanvasElement;
    #ctx: CanvasRenderingContext2D;
    #scene: Scene | undefined = undefined;

    constructor(element: HTMLCanvasElement) {
        this.#element = element;

        const ctx = this.#element.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D rendering context for canvas');
        }
        this.#ctx = ctx;
        this.#ctx.save();

        this.onResize();
        window.addEventListener('resize', () => this.onResize());

        this.draw();
    }

    onResize() {
        const width = this.#element.clientWidth;
        const height = this.#element.clientHeight;

        this.#element.width = width;
        this.#element.height = height;

        this.#ctx.restore();
        this.#ctx.translate(width / 2, height / 2);

        if (this.#scene) {
            const scale = this.#scene.calculateScale(width, height);
            this.#ctx.scale(scale, scale);
        }
    }

    setScene(scene: Scene) {
        this.#scene = scene;
        this.onResize();
    }

    draw() {
        requestAnimationFrame(() => this.draw());

        this.#ctx.clearRect(
            -this.#element.width / 2,
            -this.#element.height / 2,
            this.#element.width,
            this.#element.height
        );

        this.#scene?.draw(this.#ctx);
    }

    addEventListeners(listeners: Partial<{
        [K in keyof GlobalEventHandlersEventMap]: (ev: GlobalEventHandlersEventMap[K]) => void
    }>): {
        removeListeners(): void
    } {
        for (const [eventKind, event] of Object.entries(listeners)) {
            this.#element.addEventListener(eventKind, event);
        }

        return {
            removeListeners: () => {
                for (const [eventKind, event] of Object.entries(listeners)) {
                    this.#element.removeEventListener(eventKind, event);
                }
            }
        }
    }

    isPointInPath(path: Path2D, x: number, y: number) {
        return this.#ctx.isPointInPath(path, x, y);
    }

    toScenePoint(x: number, y: number): DOMPoint {
        return new DOMPoint(x, y).matrixTransform(this.#ctx.getTransform().inverse());
    }
}
