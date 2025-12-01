import { stdin } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from "../../readstream.js";

const directions = [
    {symbol: '^', dx: 0, dy: -1 },
    {symbol: '>', dx: 1, dy: 0 },
    {symbol: 'v', dx: 0, dy: 1 },
    {symbol: '<', dx: -1, dy: 0 }
];

class ShortestWayPriceList {
    constructor() {
    }

    getPrice(from, to) {
        return 1;
    }
}

class StepTurnPriceList {
    constructor(turnCost = 1000) {
        this.turnCost = turnCost;
    }

    getPrice(from, to) {
        return from === 'O' || from === to ? 1 : this.turnCost;
    }
}

class Flood {
    constructor(maze, priceList = new ShortestWayPriceList()) {
        this.maze = maze;
        this.priceList = priceList;
        this.flooded = new Map();
    }

    flood(x, y, maxSteps) {
        // Flood the maze from (x,y)
        let heads = [{x, y}];
        this.flooded.set(`${x},${y}`, { direction: 'O', cost: 0 }); // origin
        while (heads.length > 0 && (maxSteps === undefined || maxSteps-- > 0)) {
            // work with the cheapest head
            let head = this.popCheapestHead(heads);
            // if the head meets a dead end, it dies.
            // if the head meets an already flooded tile, tile is marked as intersection and head dies.
            // if the head can expand in multiple directions, it splits and floods each direction.

            const { direction, cost} = this.flooded.get(`${head.x},${head.y}`);

            const possible_moves = directions.filter(dir => {
                // filter candidates that are not walls, not origin and not flooded
                const candidate = { x: head.x + dir.dx, y: head.y + dir.dy };
                return this.maze.grid[candidate.y][candidate.x] === '.' 
                    && !this.flooded.has(`${candidate.x},${candidate.y}`);
            });
            possible_moves.forEach(move => {
                const newHead = { x: head.x + move.dx, y: head.y + move.dy };
                this.flooded.set(`${newHead.x},${newHead.y}`, { direction: move.symbol, cost: cost + this.priceList.getPrice(direction, move.symbol) });
                heads.push(newHead);
            });
        }
    }

    popCheapestHead(heads) {
        heads.sort((a, b) => {
            const aCost = this.flooded.get(`${a.x},${a.y}`)?.cost ?? 0;
            const bCost = this.flooded.get(`${b.x},${b.y}`)?.cost ?? 0;
            return bCost - aCost;
        });
        return heads.pop();
    }

    floodedMaze() {
        const maze = new Maze();
        this.maze.grid.forEach((row, y) => {
            maze.addRow(row.map((cell, X) => {
                const key = `${X},${y}`;
                return this.flooded.has(key) ? this.flooded.get(key).direction : cell;
            }));
        });
        return maze;
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
        this.maze.addRow(line.split(''));
    }

    onClose() {
        console.log(`Board size: ${this.maze.grid[0].length} by ${this.maze.grid.length}`);
        const flood = new Flood(this.maze, new StepTurnPriceList());
        flood.flood(13, 1);
        const floodedMaze = flood.floodedMaze();
        console.log(floodedMaze.grid.map(row => row.join('')).join('\n'));
    }
}

const strm = createInterface({
    input: stdin
});

readContent(strm,
    new Context());
