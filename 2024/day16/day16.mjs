import { stdin } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from "../../readstream.js";

const directions = [
    {symbol: '^', dx: 0, dy: -1 },
    {symbol: '>', dx: 1, dy: 0 },
    {symbol: 'v', dx: 0, dy: 1 },
    {symbol: '<', dx: -1, dy: 0 }
];

const oppositeDirection = {
    '^': 'v',
    '>': '<',
    'v': '^',
    '<': '>'
};

class Path { 
    constructor(pricelist = new ShortestWayPriceList()) {
        this.steps = new Map();
        this.totalCost = 0;
        this.pricelist = pricelist;
    }

    backtrack(flood, startX, startY, direction) {
        let currentDirection = oppositeDirection[direction];
        let x = startX;
        let y = startY;
        while (true) {
            // go in the opposite direction of the flood
            const key = `${x},${y}`;
            const cell = flood.flooded.get(key);
            const cost = this.pricelist.getPrice(currentDirection, cell.direction);
            if (cell.direction === 'O') {
                break;
            }
            currentDirection = cell.direction;
            this.steps.set(key, {direction: oppositeDirection[cell.direction], cost});
            this.totalCost += cost;
            x -= directions.find(dir => dir.symbol === currentDirection).dx;
            y -= directions.find(dir => dir.symbol === currentDirection).dy;
        }
    }

    go(key, direction) {
        const cost = this.pricelist.getPrice(this.currentDirection, direction);
        this.steps.set(key, {direction: oppositeDirection[direction], cost});
        this.totalCost += cost;
        return direction;
    }

    toMaze(maze) {
        const pathMaze = new Maze();
        maze.grid.forEach((row, y) => {
            pathMaze.addRow(row.map((cell, X) => {
                const key = `${X},${y}`;
                return this.steps.has(key) ? this.steps.get(key).direction : cell;
            }));
        });
        return pathMaze;
    }
}

class ShortestWayPriceList {
    constructor() {
    }

    getPrice() {
        return 1;
    }
}

class StepTurnPriceList {
    constructor(turnCost = 1000) {
        this.turnCost = turnCost;
    }

    getPrice(currDir, nextDir) {
        return 1 + (currDir === 'O' || currDir === nextDir ? 0 : this.turnCost);
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
        if (x === undefined || y === undefined) {
            x = this.maze.end.x;
            y = this.maze.end.y;
        }
        let heads = [{x, y}];
        let foundStart = false;
        this.flooded.set(`${x},${y}`, { direction: 'O', cost: 0 }); // origin
        while (!foundStart && heads.length > 0 && (maxSteps === undefined || maxSteps-- > 0)) {
            // work with the cheapest head
            let head = this.popCheapestHead(heads);
            // if the head meets a dead end, it dies.
            // if the head meets an already flooded tile, tile is marked as intersection and head dies.
            // if the head can expand in multiple directions, it splits and floods each direction.

            const { direction, cost} = this.flooded.get(`${head.x},${head.y}`);

            const possible_moves = directions.filter(dir => {
                // filter candidates that are free to walk and not flooded
                // Free to walk are cells with '.' or the Start cell 'S'
                const candidate = { x: head.x + dir.dx, y: head.y + dir.dy };
                return (this.maze.grid[candidate.y][candidate.x] === '.' || this.maze.grid[candidate.y][candidate.x] === 'S')
                    && !this.flooded.has(`${candidate.x},${candidate.y}`);
            });
            possible_moves.forEach(move => {
                const newHead = { x: head.x + move.dx, y: head.y + move.dy };
                if (this.maze.grid[newHead.y][newHead.x] === 'S') {
                    foundStart = true;
                }
                this.flooded.set(`${newHead.x},${newHead.y}`, { direction: move.symbol, cost: cost + this.priceList.getPrice(direction, move.symbol) });
                heads.push(newHead);
            });
            // if any new head is the start cell, stop flooding.
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
        this.start = null;
        this.end = null;
    }

    addRow(row) {
        this.grid.push(row);
        if (this.start === null) {
            const startX = row.indexOf('S');
            if (startX !== -1) {
                this.start = { x: startX, y: this.grid.length - 1 };
            }
        }
        if (this.end === null) {
            const endX = row.indexOf('E');
            if (endX !== -1) {
                this.end = { x: endX, y: this.grid.length - 1 };
            }
        }
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
        flood.flood();
        const floodedMaze = flood.floodedMaze();
        const path = new Path(new StepTurnPriceList());
        path.backtrack(flood, this.maze.start.x, this.maze.start.y, '>');
        console.log(floodedMaze.grid.map(row => row.join('')).join('\n'));
        console.log(path.toMaze(this.maze).grid.map(row => row.join('')).join('\n'));
        console.log(`Total cost of the path: ${path.totalCost}`);
    }
}

const strm = createInterface({
    input: stdin
});

readContent(strm,
    new Context());
