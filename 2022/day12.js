class Cell {
    constructor(name) {
        this.name = name;
        this.setHeight(name);
        this.distance = undefined;
        if (name === 'S') this.setHeight('a');
        if (name === 'E') this.setHeight('z');
    }

    setHeight(height) {
        this.height = height.charCodeAt(0) - 'a'.charCodeAt(0);
    }

    isWithinReach(other) {
        return other.height <= this.height + 1;
    }

    claim(dist) {
        if (!this.isClaimed()) {
            this.distance = dist;
            return true;
        }
        return false;
    }

    isClaimed() {
        return this.distance != undefined;
    }

    toString() {
        return this.distance ? this.distance.toString() : this.name;
    }
}

class HeightMap {
    constructor() {
        this.grid = new Array();
        this.width = 0;
        this.height = 0;
        this.startIndex = null;
        this.endIndex = null;
    }

    addRow(row) {
        this.width = row.length;
        this.grid.push(...row.map(h => new Cell(h)))
        if (this.startIndex == null) {
            let idx = row.findIndex(c => c === 'S');
            if (idx !== -1) {
                this.startIndex = this.toIndex([idx, this.height]);
            }
        }
        if (this.endIndex == null) {
            let idx = row.findIndex(c => c === 'E');
            if (idx !== -1) {
                this.endIndex = this.toIndex([idx, this.height]);
            }
        }
        this.height++;
    }

    showMap() {
        for (let row = 0; row < this.height; row++) {
            console.log(this.grid
                .slice(row * this.width, (row + 1) * this.width)
                .map(c => c.toString())
                .join(', '));
        }
    }

    findStartPoints() {
        return this.grid
            .map((c, i) => ({idx: i, cell: c}))
            .filter(o => o.cell.name === 'b')
            .map(o => this.neighborsOnMap(o.idx).filter(idx => this.grid[idx].height === 0))
            .flat(); 
    }

    growFrom(startIndexes) {
        let candidates = startIndexes.slice();
        let distance = 0;

        while (candidates.length !== 0) {
            let toClaim = Array.from(new Set(candidates));
            toClaim.forEach(i => this.grid[i].claim(distance));
            candidates = [];
            toClaim.forEach(i => {
                candidates.push(...this.candidatesFromCell(i));
            });
            distance++;
        }
        return distance - 1;
    }

    get endCell() {
        return this.grid[this.endIndex];
    }

    candidatesFromCell(index) {
        return this.neighborsOnMap(index)
            .filter(i => !this.grid[i].isClaimed())
            .filter(i => this.grid[index].isWithinReach(this.grid[i]));
    }

    toCoordinates(index) {
        return [index % this.width, Math.trunc(index / this.width)];
    }

    toIndex(coords) {
        return coords[0] + this.width * coords[1];
    }
    
    neighborsOnMap(index) {
        let [x, y] = this.toCoordinates(index);
        let neighbors = [];
        if (x - 1 >= 0) neighbors.push(index - 1);
        if (x + 1 < this.width) neighbors.push(index + 1);
        if (y - 1 >= 0) neighbors.push(index - this.width);
        if (y + 1 < this.height) neighbors.push(index + this.width);
        return neighbors;
    }
}

class Context {
    constructor() {
        this.heightMap = new HeightMap();
    }

    onLine(line) {
        this.heightMap.addRow(Array.from(line));
    }

    onClose() {
        let startIndexes = this.heightMap.findStartPoints();
        console.log(startIndexes.length, startIndexes);
        const stepsTaken = this.heightMap.growFrom(startIndexes);
        console.log('Distance to endpoint:', this.heightMap.endCell.distance);
        console.log('Steps taken:', stepsTaken);
    }   
}

const processModule = require('node:process');
const strm = require('node:readline').createInterface({
    input: processModule.stdin
});
const readLines = require('../readstream').readContent;

readLines(strm,
    new Context());

// readLines(strm, 
//     processModule.argv.length === 2? new Context(2) : new Context(10));