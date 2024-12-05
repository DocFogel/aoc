class Context {
    constructor() {
        this.validCount = 0;
        this.validDampened = 0;
    }

    onLine(line) {
        const signal = line.split(/ +/).map(s => parseInt(s));
        if (this.isValid(signal)) {
            this.validCount++;
        } else {
            // Try removing any single item from the list and see if the signal is valid.
            for (const dampenedSignal of this.dampened(signal)) {
                if (this.isValid(dampenedSignal)) {
                    this.validDampened++;
                    break;
                }
            }
        }
    }

    onClose() {
        console.log(`Valid signals: ${this.validCount}`);
        console.log(`Valid with dampening: ${this.validCount + this.validDampened}`);
    }   

    *dampened(a) {
        for (let indexToRemove = 0; indexToRemove < a.length; indexToRemove++) {
            yield a.toSpliced(indexToRemove, 1);
        }
    }
    
    isValid(a) {
        const it = a[Symbol.iterator]();
        const n = it.next();
        const res = this.checkRest(n.value, it);
        if (Math.abs(res) == a.length - 1) {
            return true;
        }
        return false;
    }    

    checkRest(val, iterator) {
        let next = iterator.next();
        if (next.done) {
            return undefined;
        }
    
        let diff = val - next.value;
        if (Math.abs(diff) > 3) {
            // too big a step
            return 0;
        }

        let dir = Math.sign(diff);
        let res = this.checkRest(next.value, iterator);
        if (res === 0) {
            // too big a step in the rest
            return 0;
        }
        if (res === undefined) { 
            // ah, the rest is empty! Return rising or falling indicator
            return dir;
        }

        // nothing special, add to direction indicator and return
        return res + dir;
    }
}

const processModule = require('node:process');
const strm = require('node:readline').createInterface({
    input: processModule.stdin
});
const readLines = require('../readstream').readContent;

readLines(strm,
    new Context());
