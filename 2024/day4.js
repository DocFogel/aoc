
class Context {
    stepMap = new Map([
        ['n',  { x: 0, y: -1 }],
        ['ne', { x: 1, y: -1 }],
        ['e',  { x: 1, y: 0 }],
        ['se', { x: 1, y: 1 }],
        ['s',  { x: 0, y: 1 }],
        ['sw', { x: -1, y: 1 }],
        ['w',  { x: -1, y: 0 }],
        ['nw', { x: -1, y: -1 }]
    ]);

    
    constructor() {
        this.puzzle = [];
        this.puzzleWidth = undefined;
    }

    onLine(line) {
        if (this.puzzleWidth === undefined) {
            this.puzzleWidth = line.length;
        } else if (this.puzzleWidth != line.length) {
            throw `Puzzle is not rectangular: line ${this.puzzle.length} is ${line.length} characters, which differs from previous line lengths of ${this.puzzleWidth}`;
        }
        this.puzzle.push(line);
    }

    onClose() {
        // find possible starting points and check what directions do NOT step out of bounds
        // this will be a list of starting points and directions
        let candidates = this.puzzle.map((line, row) => this.findXs(line).map(x => this.getCompassDirections(x, row).map(dir => ({x: x, y: row, direction: dir})))).flat(2);
        console.log(candidates.length, candidates);

        const matches = candidates.filter(this.isValid, this);
        console.log(`Total matches: ${matches.length}`);
    }

    findXs(line) {
        return Array.from(line.matchAll(/X/g)).map(m => m.index);
    }

    getCompassDirections(x, y) {
        let directions = [];
        if (x >= 3) {
            // x+1 >= 4
            directions.push('w');
        }
        if (x <= this.puzzleWidth - 4) {
            // x+1 <= width - 3
            directions.push('e');
        }
        if (y >= 3) {
            directions.push('n');
        }
        if (y <= this.puzzle.length - 4) {
            directions.push('s');
        }
        if (directions.includes('w')) {
            if (directions.includes('n')) directions.push('nw');
            if (directions.includes('s')) directions.push('sw');
        }
        if (directions.includes('e')) {
            if (directions.includes('n')) directions.push('ne');
            if (directions.includes('s')) directions.push('se');
        }

        return directions;
    }

    isValid(origin) {
        let step = this.stepMap.get(origin.direction);
        return ['M', 'A', 'S'].reduce((isMatch, expected, i) => isMatch && (this.puzzle[origin.y + (i+1)*step.y][origin.x + (i+1)*step.x] === expected), true);
    }
}

const processModule = require('node:process');
const strm = require('node:readline').createInterface({
    input: processModule.stdin
});
const readLines = require('../readstream').readContent;

readLines(strm,
    new Context());
