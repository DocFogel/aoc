
class Counter extends Map {
    constructor(iterable)  {
        super();
        for (const i of iterable) {
            let count = this.get(i);
            if (count == undefined) { count = 0; }
            this.set(i, count + 1);
        }
    }
}

class Context {
    constructor() {
        this.leftLocations = [];
        this.rightLocations = [];
    }

    onLine(line) {
        let l, r = 0;
        [l, r] = line.split(/ +/);
        this.leftLocations.push(parseInt(l));
        this.rightLocations.push(parseInt(r));
    }

    onClose() {
        let totalDiff = 0;
        for (const d of this.locationDiffs()){
            totalDiff += Math.abs(d)
        }
        console.info(`Total diff=${totalDiff}`);

        let leftCounter = new Counter(this.leftLocations);
        let rightCounter = new Counter(this.rightLocations);

        let similarityScore = 0;
        for (const key of leftCounter.keys()) {
            similarityScore += rightCounter.has(key) ? key * rightCounter.get(key) * leftCounter.get(key) : 0;
        }
        console.info(`Similarity score=${similarityScore}`);
    }

    *locationDiffs() {
        let leftIterator = this.leftLocations.sort()[Symbol.iterator]();
        let rightIterator = this.rightLocations.sort()[Symbol.iterator]();

        let leftResult = leftIterator.next();
        let rightResult = rightIterator.next();

        while (!rightResult.done && !leftResult.done){
            yield leftResult.value - rightResult.value;
            leftResult = leftIterator.next();
            rightResult = rightIterator.next();
        }
    }
}

const { symlink } = require('node:fs');
const processModule = require('node:process');
const strm = require('node:readline').createInterface({
    input: processModule.stdin
});
const readLines = require('../readstream').readContent;

readLines(strm,
    new Context());
