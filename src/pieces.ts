export class Piece {
    color: string;
    radius: number;
    center: [number, number];

    constructor(color: string, radius: number) {
        this.color = color;
        this.radius = radius;
        this.center = [300, 400];
    }

    getPath(): Path2D {
        const path = new Path2D();
        let [x, y] = this.center;
        path.ellipse(x, y, this.radius, this.radius, 0, 0, 2 * Math.PI);
        return path;
    }

    moveTo(position: [number, number]) {
        this.center = position;
    }
}

export const pieces: Piece[] = [];

export const initialize_pieces = () => {
    pieces.push(new Piece("#000000", 20));
}
