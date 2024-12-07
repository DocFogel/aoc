
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
        // Part 1
        // find possible starting points and check what directions do NOT step out of bounds
        // this will be a list of starting points and directions
        let candidates = this.puzzle.map((line, row) => this.findXs(line).map(x => this.allDirections().map(dir => ({x: x, y: row, direction: dir})))).flat(2);

        const matches = candidates.filter(this.isXMAS, this);
        console.log(`Total part 1 matches: ${matches.length}`);
    }

    findXs(line) {
        return Array.from(line.matchAll(/X/g)).map(m => m.index);
    }

    allDirections() {
        return Array.from(this.stepMap.keys());        
    }

    isXMAS(origin) {
        let step = this.stepMap.get(origin.direction);
        return ['M', 'A', 'S'].reduce((isMatch, expected, i) => {
            const x = origin.x + (i+1)*step.x;
            const y = origin.y + (i+1)*step.y;
            if (x < 0 || x >= this.puzzleWidth) return false;
            return isMatch 
                && x >= 0
                && x < this.puzzleWidth
                && y >= 0
                && y < this.puzzle.length
                && (this.puzzle[y][x] === expected)
        }, true);
    }
}

const processModule = require('node:process');
const strm = require('node:readline').createInterface({
    input: processModule.stdin
});
const readLines = require('../readstream').readContent;

readLines(strm,
    new Context());
