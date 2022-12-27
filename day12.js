class Cell {
    constructor(name) {
        this.name = name;
        this.setHeight(name);
        this.distance = undefined;
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

class Context {
    constructor() {
        this.heightMap = new Array();
        this.width = 0;
        this.height = 0;
        this.startPoint = null;
        this.endPoint = null;
    }

    onLine(line) {
        let row = Array.from(line);
        this.width = row.length;
        this.heightMap.push(...row.map(h => new Cell(h)));
        if (this.startPoint == null) {
            let idx = row.findIndex(c => c === 'S');
            if (idx !== -1) {
                this.startPoint = this.toIndex([idx, this.height]);
                this.heightMap[this.startPoint].setHeight('a');
            }
        }
        if (this.endPoint == null) {
            let idx = row.findIndex(c => c === 'E');
            if (idx !== -1) {
                this.endPoint = this.toIndex([idx, this.height]);
                this.heightMap[this.endPoint].setHeight('z');
            }
        }
        this.height++;
    }

    onClose() {
        console.log('Start point:', this.toCoordinates(this.startPoint));
        const stepsTaken = this.growPoint(this.startPoint);
        console.log('Distance to endpoint:', this.heightMap[this.endPoint].distance);
        console.log('Steps taken:', stepsTaken);
    }   

    showMap() {
        for (let row = 0; row < this.height; row++) {
            console.log(this.heightMap
                .slice(row * this.width, (row + 1) * this.width)
                .map(c => c.toString())
                .join(', '));
        }
    }

    growPoint(start) {
        let initials = [start];
        let distance = 0;
        while (initials.length !== 0) {
            distance++;
            let candidates = [];
            initials.forEach(p => {
                candidates.push(...this.candidatesFromPoint(p));
            });
            let toClaim = Array.from(new Set(candidates));
            if (toClaim.some(i => this.heightMap[i].name === 'E')) {
                console.log('Found endpoint at distance', distance);
            }
            toClaim.forEach(i => this.heightMap[i].claim(distance));
            initials = toClaim;
        }
        return distance - 1;
    }

    candidatesFromPoint(index) {
        return this.neighborsOnMap(index)
            .filter(i => !this.heightMap[i].isClaimed())
            .filter(i => this.heightMap[index].isWithinReach(this.heightMap[i]));
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

const processModule = require('node:process');
const strm = require('node:readline').createInterface({
    input: processModule.stdin
});
const readLines = require('./readstream').readContent;

readLines(strm,
    new Context());

// readLines(strm, 
//     processModule.argv.length === 2? new Context(2) : new Context(10));