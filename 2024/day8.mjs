import { stdin, argv } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from "../readstream.js";

class Coordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }   

    add(other) {
        return new Coordinate(this.x + other.x, this.y + other.y);
    }

    difference(other) {     
        return new Coordinate(this.x - other.x, this.y - other.y);
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}

class Boundary extends Coordinate {
    constructor(x, y) {
        super(x, y);
    }

    contains(coordinate) {
        return coordinate.x >= 0 && coordinate.x < this.x && coordinate.y >= 0 && coordinate.y < this.y;
    }
}

class Context {
    constructor() {
        this.influencers = new Map();
        this.lineCount = 0;
        this.mapX = 0;
        this.mapY = 0;
    }

    onLine(line) {
        Array.from(line).forEach((frequency, x) => {
            if (frequency !== '.') {
                if (!this.influencers.has(frequency)) {
                    this.influencers.set(frequency, new Array);
                }
                this.influencers.get(frequency).push(new Coordinate(x, this.lineCount));
            }
        });
        this.lineCount++;
        this.mapX = line.length;
        this.mapY = this.lineCount;
    }

    onClose() {
        let bounds = new Boundary(this.mapX, this.mapY);
        
        console.log(this.countAntinodes(bounds, this.firstAntinode));
        console.log(this.countAntinodes(bounds, this.harmonicAntinodes));
    }

    countAntinodes(bounds, antinodeGenerator) {
        let antinodeMap = new Map();
        this.influencers.forEach((transmitters, frequency) => {
            let anodes = transmitters.flatMap((baseAntenna, idx, array) => {
                return array
                    .filter(a => !a.equals(baseAntenna))
                    .map(interferer => antinodeGenerator(baseAntenna, interferer, bounds))
                    .flat()
                });
            antinodeMap.set(frequency, anodes);
        });
        //console.log(antinodeMap);
        let antinodes = Array.from(antinodeMap.values()).flat().map(anode => anode.toString());
        return new Set(antinodes).size;
    }

    firstAntinode(baseAntenna, interferenceAntenna, bounds) {
        return [ interferenceAntenna.add(interferenceAntenna.difference(baseAntenna)) ].filter(anode => bounds.contains(anode));
    }

    harmonicAntinodes(baseAntenna, interferenceAntenna, bounds) {
        let antinodes = [baseAntenna, interferenceAntenna];
        let diff = baseAntenna.difference(interferenceAntenna);
        let antinode = baseAntenna.add(diff);
        while (bounds.contains(antinode)) {
            antinodes.push(antinode);
            antinode = antinode.add(diff);
        }
        return antinodes;
    }
}

const strm = createInterface({
    input: stdin
});

readContent(strm,
    new Context());
