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
        let floodDirection = oppositeDirection[direction];
        let x = startX;
        let y = startY;
        while (true) {
            // go in the opposite direction of the flood
            const key = `${x},${y}`;
            const cell = flood.flooded.get(key);
            if (cell.direction === 'O') {
                break;
            }

            const cost = this.pricelist.getPrice(floodDirection, cell.direction);
            floodDirection = cell.direction;
            this.steps.set(key, {direction: oppositeDirection[cell.direction], cost});
            this.totalCost += cost;
            const counterMove = directions.find(dir => dir.symbol === floodDirection);
            x -= counterMove.dx;
            y -= counterMove.dy;
        }
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

class StepOrTurnPriceList {
    constructor(turnCost = 1000) {
        this.turnCost = turnCost;
    }

    getPrice(currDir, nextDir) {
        return currDir === nextDir ? 1 : this.turnCost;
    }
}

class StepAndTurnPriceList {
    constructor(turnCost = 1000) {
        this.turnCost = turnCost;
    }

    getPrice(currDir, nextDir) {
        return 1 + (currDir === nextDir ? 0 : this.turnCost);
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
        // if no coordinates provided, start flooding from the maze end
        let foundStart = false;
        if (x === undefined || y === undefined) {
            x = this.maze.end.x;
            y = this.maze.end.y;
            foundStart = false;
        }

        // heads carry position, current direction and accumulated cost
        let heads = [{ x, y, direction: 'O', cost: 0 }];
        this.flooded.set(`${x},${y}`, { direction: 'O' }); // origin

        while (!foundStart && heads.length > 0 && (maxSteps === undefined || maxSteps-- > 0)) {
            // work with the cheapest head
            let head = this.popCheapestHead(heads);
            // if the head meets a dead end, it dies.
            // if the head can expand in multiple directions, it splits and floods each direction.

            const possible_moves = directions.filter(dir => {
                // filter candidates that are free to walk and not flooded
                // Free to walk are cells with '.' or the Start cell 'S'
                const candidate = { x: head.x + dir.dx, y: head.y + dir.dy };
                return (this.maze.grid[candidate.y][candidate.x] === '.' || this.maze.grid[candidate.y][candidate.x] === 'S')
                    && !this.flooded.has(`${candidate.x},${candidate.y}`);
            });
            possible_moves.forEach(move => {
                // if the move would change direction, create a turned head
                const moveCost = this.priceList.getPrice(head.direction, move.symbol);
                if (move.symbol !== head.direction) {
                    heads.push({ ...head, direction: move.symbol, cost: head.cost + moveCost });
                } else {
                    // advance into the candidate cell
                    const newHead = { x: head.x + move.dx, y: head.y + move.dy, direction: move.symbol, cost: head.cost + moveCost };
                    // if we've reached the start cell, register and stop flooding
                    if (this.maze.grid[newHead.y][newHead.x] === 'S') {
                        foundStart = true;
                    }
                    heads.push(newHead);
                    this.flooded.set(`${newHead.x},${newHead.y}`, { direction: move.symbol });
                }
            });
            // if any new head is the start cell, stop flooding.
        }
    }

    popCheapestHead(heads) {
        heads.sort((a, b) => {
            return b.cost - a.cost;
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
        const flood = new Flood(this.maze, new StepOrTurnPriceList());
        flood.flood();
        const floodedMaze = flood.floodedMaze();
        const path = new Path(new StepAndTurnPriceList());
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
