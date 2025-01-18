import { stdin, argv } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from "../readstream.js";

class Context {
    constructor() {
        this.p1Sum = 0;
        this.p2Sum = 0;
    }

    onLine(line) {
        // split line <result>: operand1 operand2 ...
        const parts = line.split(':');
        const result = parseInt(parts[0].trim());
        const operands = parts[1].trim().split(' ').map(s => parseInt(s));
        this.p1Sum += this.onInstruction(2, result, operands) ? result : 0;
        this.p2Sum += this.onInstruction(3, result, operands) ? result : 0;
    }

    onInstruction(opSet, expected, operands) {
        const operatorCount = opSet**(operands.length - 1);
        for (let ops = 0; ops < operatorCount; ops++) {
            const operators = ops.toString(opSet)
                                .padStart(operands.length - 1, '0')
                                .slice(-operands.length + 1);

            if (expected === this.calculate(operands, operators, expected)) {
                return true;
            }    
        }    
    }    

    calculate(operands, operators, upperLimit = 1000) {
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
                    } else if (operators[idx - 1] === '1') {
                        return acc * val;
                    } else if (operators[idx - 1] === '2') {
                        return parseInt(acc.toString() + val.toString());
                    } else {
                        throw new Error('Invalid operator');
                    }
                }
            });
        } catch (e) {
            return -1;
        }
    }

    onClose() {
        console.log('Part 1 sum:', this.p1Sum);
        console.log('Part 2 sum:', this.p2Sum);
    }
}

const strm = createInterface({
    input: stdin
});

readContent(strm,
    new Context());
