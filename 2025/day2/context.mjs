import { stdin } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from "../../readstream.js";

const splits = new Map([
    [ 1, [] ],
    [ 2, [ 1 ] ],
    [ 3, [ 1 ] ],
    [ 4, [ 1, 2 ] ],
    [ 5, [ 1 ] ],
    [ 6, [ 1, 2, 3 ] ],
    [ 7, [ 1 ] ],
    [ 8, [ 1, 2, 4 ] ],
    [ 9, [ 1, 3 ] ],
    [ 10, [ 1, 2, 5 ] ]
]);

function getFirstLargerSplit(number, len) {
    // get the smallest number with length len that produces a periodic number larger than number

    // length of number must be a multiple of len
    const numString = number.toString();
    if (numString.length % len !== 0) {
        throw new Error(`Length ${numString.length} of number is not a multiple of ${len}`);
    }

    const repeat = numString.length / len;
    const head = parseInt(numString.substring(0, len));
    const periodic = parseInt(head.toString().repeat(repeat));

    return [head + (periodic >= number ? 0 : 1), repeat];
}

class Context {
    constructor() {
        this.p1InvalidIds = [];
        this.p2InvalidIds = [];
    }

    onLine(line) {
        const ranges = line.split(',').map(rangedef => {
            const [low, upper] = rangedef.split('-');
            if (low.length !== upper.length) {
                // split into two ranges
                // Assumes lengths only differ by one
                const split = 10 ** low.length;
                return [
                    { lower: parseInt(low), upper: split - 1 },
                    { lower: split, upper: parseInt(upper) }
                ];
            }
            return { lower: parseInt(low), upper: parseInt(upper) };
        }).flat();
        console.log(ranges.length);
        console.log(ranges);
        ranges.forEach(this.onRange, this);
    }

    onRange({lower, upper}, index) {
        const rangeValueLen = lower.toString().length;

        const invalidIdsInRange = new Set();
        splits.get(rangeValueLen).forEach(len => {
            let [lowerNum, repeat ] = getFirstLargerSplit(lower, len);
            let id = parseInt(lowerNum.toString().repeat(repeat));
            while (id <= upper) {
                if (repeat === 2) {
                    // part 1 invalid id are only found when repeat is 2
                    this.p1InvalidIds.push(id);
                }
                invalidIdsInRange.add(id);
                lowerNum++;
                id = parseInt(lowerNum.toString().repeat(repeat));
            }
        });
        this.p2InvalidIds.push(...invalidIdsInRange);
    }

    onClose() {
        console.log(`Found ${this.p1InvalidIds.length} invalid part 1 ids, the sum of which is ${this.p1InvalidIds.reduce((a, b) => a + b, 0)}`);
        console.log(`Found ${this.p2InvalidIds.length} invalid part 2 ids, the sum of which is ${this.p2InvalidIds.reduce((a, b) => a + b, 0)}`);
    }
}

const strm = createInterface({
    input: stdin
});

readContent(strm,
    new Context());
