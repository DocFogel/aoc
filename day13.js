class Context {
    constructor() {
        this.left = null;
        this.right = null;
        this.currentPairIndex = 1;
        this.correctPacketSum = 0;
    }

    onLine(line) {
        if (line.trim().length === 0) {
            this.correctPacketSum += this.compareLists(this.left, this.right) < 0 ? this.currentPairIndex : 0;
            this.currentPairIndex++;
            this.left = this.right = null;
        } else {
            if (!this.left) {
                this.left = JSON.parse(line);
            } else {
                this.right = JSON.parse(line);
            }
        }
    }

    onClose() {
        if (this.left && this.right) {
            this.correctPacketSum += this.compareLists(this.left, this.right) < 0 ? this.currentPairIndex : 0;
        }
        console.log('Sum of correct packets:', this.correctPacketSum);
    }

    compareLists(left, right) {
        let len = Math.min(left.length, right.length);
        for (let i = 0; i < len; i++) {
            let comparison;
            if (left[i] instanceof Array && right[i] instanceof Array) {
                comparison = this.compareLists(left[i], right[i]);
            } else if (left[i] instanceof Array) {
                comparison = this.compareLists(left[i], [right[i]]);
            } else if (right[i] instanceof Array) {
                comparison = this.compareLists([left[i]], right[i]);
            } else {
                comparison = left[i] - right[i];
            }
            if (comparison === 0) {
                continue;
            } else {
                return comparison;
            }
        }
        return left.length - right.length;
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