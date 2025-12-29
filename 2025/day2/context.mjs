import { stdin } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from "../../readstream.js";

class Context {
    constructor() {
        this.invalidIds = [];
    }

    getFirstPossibleHalf(str) {
        const len = str.length;
        if (len % 2 == 0) {
            let head = parseInt(str.substring(0, len / 2));
            let tail = parseInt(str.substring(len / 2));
            return head + (head >= tail ? 0 : 1);
        }
        // length is odd, so return the lowest even length number above
        return 10 ** ((len - 1) / 2);
    }

    onLine(line) {
        const ranges = line.split(',').map(part => part.split('-').map(numStr => parseInt(numStr)));
        console.log(ranges.length);
        console.log(ranges);
        ranges.forEach(range => {
            const [lower, upper] = range;
            let lowerNum = this.getFirstPossibleHalf(lower.toString());
            let id = parseInt(`${lowerNum}${lowerNum}`);
            while (id <= upper) {
                console.log(`Invalid id in ${range} is ${id}, which is ${id <= upper ? 'within' : 'outside'} the range.`);
                this.invalidIds.push(id);
                lowerNum++;
                id = parseInt(`${lowerNum}${lowerNum}`);
            }
        });
    }

    onClose() {
        console.log(`Found ${this.invalidIds.length} invalid IDs.`);
        console.log(`the sum of which is ${this.invalidIds.reduce((a, b) => a + b, 0)}`);
    }
}

const strm = createInterface({
    input: stdin
});

readContent(strm,
    new Context());
