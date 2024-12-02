class Context {
    constructor() {
        this.validCount = 0;
    }

    onLine(line) {
        const signal = line.split(/ +/).map(s => parseInt(s));
        if (this.isValid(signal)) this.validCount++;
    }

    onClose() {
        console.log(`Valid signals: ${this.validCount}`);
    }   

    dampen(a) {
        // Try removing any single item from the list and see if the signal is valid.
        
    }
    
    isValid(a) {
        const it = a[Symbol.iterator]();
        const n = it.next();
        const res = this.checkRest(n.value, it);
        if (Math.abs(res) == a.length - 1)
            return true;

        return false;
    }    

    checkRest(v, i) {
        let next = i.next();
        if (next.done) return undefined;
    
        let diff = v - next.value;
        if (Math.abs(diff) > 3) return 0;
        let dir = Math.sign(diff);
        let res = this.checkRest(next.value, i);
        if (res === 0) return 0;
        if (res === undefined) return dir;
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
