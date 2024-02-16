import { Canvas } from "./canvas";
import { Scene } from "./scene";

export class App {
    canvas: Canvas;
    scene: Scene;

    constructor(canvasElement: HTMLCanvasElement) {
        this.canvas = new Canvas(canvasElement);
        this.scene = new Scene(this.canvas);
        this.canvas.setScene(this.scene);
    }

    run() {
        this.scene.runPlacePiece();
    }
}
