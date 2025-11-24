import { stdin, argv } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from "../../readstream.js";

class Path {
    constructor() {
        this.tiles = [];
    }

    go(x, y) {
        this.tiles.push({ x, y });
    }

    visited(x, y) {
        return this.tiles.some(t => t.x === x && t.y === y);
    }
}

class Raindeer {
    constructor() {
        this.path = new Path();
    }


}

const directions = new Map([
    ['N', { dx: 0, dy: -1 }],
    ['E', { dx: 1, dy: 0 }],
    ['S', { dx: 0, dy: 1 }],
    ['W', { dx: -1, dy: 0 }]
]);

class Flood {
    constructor(maze) {
        this.maze = maze;
    }

    flood(x, y, direction) {
        // Flood the maze from (x,y)
        let heads = [{x, y, direction}];
        let flooded = new Map();

        while (heads.length > 0) {
            // on each iteration, expand the heads that can be expanded.
            for (let head of heads) {
                const expansions = floodDirections.filter()
                const key = `${head.x},${head.y}`;
            // if a head meets a dead end, it dies.
            // if a head meets an already flooded tile, it floods the tile if it's cheaper
            // if a head meets an already flooded tile with equal or lower cost, it dies.
            // if a head can expand in multiple directions, it splits and floods each direction.
        }
    }
}

class Maze {
    constructor() {
        this.grid = [];
    }

    addRow(row) {
        this.grid.push(row);
    }
}

class Context {
    constructor() {
        this.maze = new Maze();
    }

    onLine(line) {
        this.maze.addRow(line);
    }

    onClose() {
        console.log(`Board size: ${this.maze.grid[0].length} by ${this.maze.grid.length}`);
    }
}

const strm = createInterface({
    input: stdin
});

readContent(strm,
    new Context());
