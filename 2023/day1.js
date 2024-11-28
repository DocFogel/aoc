class Context {
    constructor() {
        this.sum = 0;
        this.patterns = [ /0|zero/g, /1|one/g, /2|two/g, /3|three/g, /4|four/g, /5|five/g, /6|six/g, /7|seven/g, /8|eight/g, /9|nine/g ];
    }

    onLine(line) {
        const digits = this.FirstAndLastDigit(line);
        console.log(digits);
        this.sum += 10*digits.at(0) + digits.at(1);
    }

    onClose() {
        console.log(this.sum);
        console.log("I'm done...");
    }   

    FirstAndLastDigit(line) {
        let digits = new Map();
        this.patterns.forEach((p, i) => {
            for (const match of line.matchAll(p)) {
                digits.set(match.index, i);
            }
        });
        console.log(digits);
        const startPositions = Array.from(digits.keys()).sort((a,b)=>a-b);

        return [digits.get(startPositions.at(0)), digits.get(startPositions.at(-1))];
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