class Context {
    constructor() {
        this.left = null;
        this.right = null;
        this.currentPairIndex = 1;
        this.correctPacketSum = 0;
        this.packets = new Array();
    }

    onLine(line) {
        if (line.trim().length === 0) {
          // skip this
          return;
        }
        if (!this.left) {
          this.left = JSON.parse(line);
          this.packets.push(this.left);
        } else {
          this.right = JSON.parse(line);
          this.packets.push(this.right);
          this.correctPacketSum += this.compareLists(this.left, this.right) < 0 ? this.currentPairIndex : 0;
          this.currentPairIndex++;
          this.left = this.right = null;
        }
    }

    onClose() {
        console.log('Sum of correct packets:', this.correctPacketSum);

        let dividers = [[[2]], [[6]]];
        dividers.forEach(d => d.divider = true);
        this.packets.push(...dividers);        
        console.log(this.packets.length, this.packets.sort((a,b)=>this.compareLists(a,b)));
        console.log('decoder key:', this.packets.reduce((t, p, i) => t * (p.divider ? i + 1 : 1), 1));
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
const readLines = require('../readstream').readContent;

readLines(strm,
    new Context());

// readLines(strm, 
//     processModule.argv.length === 2? new Context(2) : new Context(10));