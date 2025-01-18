import { stdin, argv } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from "../readstream.js";

class Context {
    constructor() {
        this.sum = 0;
    }

    onLine(line) {
        // split line <result>: operand1 operand2 ...
        const parts = line.split(':');
        const result = parseInt(parts[0].trim());
        const operands = parts[1].trim().split(' ').map(s => parseInt(s));
        this.sum += this.onInstruction(result, operands) ? result : 0;
    }

    onInstruction(expected, operands) {
        const operatorCount = 2**(operands.length - 1);
        for (let ops = 0; ops < operatorCount; ops++) {
            if (expected === this.calculate(operands, ops, expected)) {
                return true;
            }
        }
    }

    calculate(operands, opsInt, upperLimit = 1000) {
        const operators = opsInt.toString(2)
                                .padStart(operands.length - 1, '0')
                                .slice(-operands.length + 1);

        try {
            return operands.reduce((acc, val, idx) => {
                if (acc > upperLimit) {
                    throw new Error('Upper limit exceeded');
                }
                if (idx === 0) {
                    return val;
                } else {
                    if (operators[idx - 1] === '0') {
                        return acc + val;
                    } else {
                        return acc * val;
                    }
                }
            });
        } catch (e) {
            return -1;
        }
    }

    onClose() {
        console.log('Sum:', this.sum);
    }
}

const strm = createInterface({
    input: stdin
});

readContent(strm,
    new Context());
