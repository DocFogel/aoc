// /mul\((\d{1,3}),(\d{1,3})\)/g

class Context {
    constructor() {
        this.unconditionalSum = 0;
        this.sum = 0;
        this.on = true;
    }

    onLine(line) {
        const ops = line.matchAll(/mul\((\d{1,3}),(\d{1,3})\)|(don't)\(\)|(do)\(\)/g);
        for (const m of ops) {

            if (m[0] === "don't()") {
                this.on = false;
            } else if (m[0] === 'do()') {
                this.on = true;
            } else {
                const prod = parseInt(m[1])*parseInt(m[2]);
                this.unconditionalSum += prod;
                if (this.on) {
                    this.sum += prod;
                }
            }
        }
    }

    onClose() {
        console.log("unconditional sum =", this.unconditionalSum);
        console.log(`sum=${this.sum}`);
    }   

}

const processModule = require('node:process');
const strm = require('node:readline').createInterface({
    input: processModule.stdin
});
const readLines = require('../readstream').readContent;

readLines(strm,
    new Context());
