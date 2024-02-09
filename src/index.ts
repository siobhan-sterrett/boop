import { Canvas } from "./canvas";
import { Game } from "./game";
import { CanvasPlayer, RandomPlayer } from "./player";

const canvas = new Canvas();
document.body.appendChild(canvas.element);

const player = new CanvasPlayer(canvas);
const opponent = new RandomPlayer();
const game = new Game([player, opponent]);

game.run();
