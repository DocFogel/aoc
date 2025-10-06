const OPERATIONS = new Map([
    ['AND', (a, b) => a & b],
    ['OR', (a, b) => a | b],
    ['XOR', (a, b) => a ^ b]
]);

class Gate {
    constructor(op, input1, input2) {
        this.op = op;
        this.input1 = input1;
        this.input2 = input2;
        this.output = null;
    }

    reset() {
        this.output = null;
    }

    evaluate(signals) {
        if (this.output === null) {
            const val1 = signals.get(this.input1).evaluate(signals);
            const val2 = signals.get(this.input2).evaluate(signals);
            this.output = OPERATIONS.get(this.op)(val1, val2);
        }
        return this.output;
    }
}

class HardWire {
    #output = false;

    constructor(output) {
        this.#output = output.trim() === '1';
    }

    evaluate() {
        return this.#output;
    }

    reset() {
        // nothing to reset
    }

    get output() {
        return this.#output;
    }
    set output(value) {
        this.#output = value;
    }
}

export class Context {
    constructor() {
        this.signals = new Map();
    }

    onLine(line) {
        if (line.includes(':')) {
            const [name, value] = line.split(': ');
            this.signals.set(name, new HardWire(value));
        } else if (line.includes('->')) {
            const [gate, wire] = line.split(' -> ');
            const [i1, op, i2] = gate.split(' ');
            this.signals.set(wire, new Gate(op, i1, i2));
        }
    }

    onClose() {
        this.part1();
        this.part2();
    }

    part1() {
        const zbinary = this.showSignal(this.getSignal('z'));
        console.log('z-signals:', zbinary, '=>', Number.parseInt(zbinary, 2));
    }

    part2() {
        // Swap back wires that seem to be swapped
        const sus_wire_pairs = [
            ['z18', 'hmt'],
            ['z27', 'bfq'],
            ['z31', 'hkh'],
            ['bng', 'fjp']
        ];
        sus_wire_pairs.forEach(pair => this.swapWires(...pair));

        // find dependencies for each z-signal
        const zsignals = this.getSignal('z');
        const wireDependencies = zsignals.map(z => this.findDependencies(z));

        // find which z-signals are affected by output swaps, i.e. have unexpected values for addition of inputs

        for (let i = 0; i < zsignals.length - 1; i++) {
            this.signals.forEach(signal => signal.reset());
            this.set('y', 1n << BigInt(i));
            this.set('x', 1n << BigInt(i));
            const expected_signal = this.showSignal(this.getSignal('x')) + '0';
            const actual_signal = this.showSignal(zsignals);
            if (expected_signal !== actual_signal) {
                console.log(`x${i.toString().padStart(2, '0')} = ${this.showSignal(this.getSignal('x')).padStart(46, ' ')}`);
                console.log(`z${i.toString().padStart(2, '0')} = ${actual_signal.padStart(46, ' ')}`);
            }
        }
        const suspicious_signals = [5, // Just for reference of a good signal dependency tree
            39, 40,
            32, 31,
            27, 26,
            18, 17
        ];
        for (const sus of suspicious_signals) {
            console.log(`Dependencies for z${sus.toString().padStart(2, '0')}:`);
            this.showDependencies(wireDependencies[sus]);
        }
        // I guess simply start swapping pairs of dependencies until the output matches the expected value?
        // You might use hints from the dependencies to limit the search space, e.g. z(n) should only depend on x(n +- 1) and y(n +- 1)?

        console.log('Part 2: suspicious wires are:', sus_wire_pairs.flat().toSorted().join(','));
    }

    set(signal, value) {
        let rest = value;
        this.getSignal(signal)                                      // get matching signals only
            .forEach(signal => {
                const v = rest & 1n;
                this.signals.get(signal).output = v === 1n;
                rest >>= 1n;
            });
    }

    getSignal(name) {
        return Array.from(this.signals.keys())
            .filter(k => k.startsWith(name))                         // get matching signals only
            .toSorted();                                            // sorted lsb first
    }

    showSignal(signal) {
        return signal
            .map(s => this.signals.get(s).evaluate(this.signals) ? '1' : '0')  // evaluate and map to '1' or '0'
            .reverse()                                      // msb first in string, but last in array   
            .join('');
    }

    findDependencies(wire) {
        const signal = this.signals.get(wire);
        if (signal instanceof HardWire) {
            return [ wire ];
        } else if (signal instanceof Gate) {
            const deps1 = this.findDependencies(signal.input1);
            const deps2 = this.findDependencies(signal.input2);
            return [ wire, [ deps1, deps2] ]; 
        }
    }

    checkDependencyTree(deps, index) {
        let check_ok = true;
        const expected_depth = index * 2 + 1;
        const actual_depth = this.getTreeDepth(deps);
        if (actual_depth !== expected_depth) {
            console.log(`Unexpected tree depth for z${index}: expected ${expected_depth}, got ${actual_depth}`);
            check_ok = false;
        }
        // This check is rather crude: walk through the dependency tree and check if gate operations are reasonable
        // for (const dep of deps) {
        //     if (Array.isArray(dep)) {
        //         this.checkDependencyTree(dep[0]);
        //         this.checkDependencyTree(dep[1]);
        //     } else {
        //         const signal = this.signals.get(dep);
        //         if (signal instanceof Gate) {
        //             // Check if the gate operation is valid
        //             if (!this.isValidGateOperation(signal)) {
        //                 console.error(`Invalid gate operation: ${signal.op} on ${dep}`);
        //             }
        //         }
        //     }
        // }
        return check_ok;
    }

    getTreeDepth(tree, level = 1) {
        if (tree.length > 1) {
            return Math.max(
                this.getTreeDepth(tree[1][0], level + 1),
                this.getTreeDepth(tree[1][1], level + 1)
            );
        } else {
            return level;
        }
    }

    swapWires(wire1, wire2) {
        const gate1 = this.signals.get(wire1);
        const gate2 = this.signals.get(wire2);
        this.signals.set(wire1, gate2);
        this.signals.set(wire2, gate1);
    }

    showDependencies(deps, level = 0) {
        const indent = '  '.repeat(level);
        for (const dep of deps) {
            if (Array.isArray(dep)) {
                this.showDependencies(dep[0], level + 1);
                this.showDependencies(dep[1], level + 1);
            } else {
                const signal = this.signals.get(dep);
                if (signal instanceof Gate) {
                    console.log(`${indent}- ${dep} (${signal.op})`);
                } else {
                    console.log(`${indent}- ${dep}`);
                }
            }
        }
    }
}
