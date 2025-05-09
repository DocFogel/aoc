operationsMap = new Map( [
    [ "AND", (v) => v[0] & v[1] ],
    [ "OR", (v) => v[0] | v[1] ],
    [ "NOT", (v) => ~v[0] ],
    [ "LSHIFT", (v) => v[0] << v[1] ],
    [ "RSHIFT", (v) => v[0] >> v[1] ],
    [ "EQ", (v) => v[0] ]
]);

class Gate {
    constructor(wirename, operation, inputs) {
        if (operation === undefined) {
            throw new Error(`Operation is undefined for gate ${wirename}`);
        }
        this.wirename = wirename;
        this.inputs = inputs;
        this.operation = operation;
        this.cachedValue = undefined;
    }

    get value() {
        if (this.cachedValue !== undefined) {
            console.log(`Gate ${this.wirename} already calculated, returning cached value ${this.cachedValue}`);
            return this.cachedValue;
        }
        let inputWires = this.inputs.map((input) => input.value);
        this.cachedValue = this.operation(inputWires);

        console.log(`Gate ${this.wirename} with inputs [ ${inputWires} ] gives value ${this.cachedValue}`);
        return this.cachedValue;
    }

    getGate(wirename) {
        if (this.wirename === wirename) {
            return this;
        }
        for (let input of this.inputs) {
            let gate = input.getGate(wirename);
            if (gate !== undefined) {
                return gate;
            }
        }
        return undefined;
    }
}

class Signal {
    constructor(value) {
        this.value = parseInt(value);
    }


    getGate = (wirename) => undefined;
}

class NullSignal {
    constructor() {
        this.value = undefined;
    }

    getGate = (wirename) => undefined;
}

function buildGate(output, wires) {
    let wire = wires.get(output)
    if (wire === undefined) {
        throw new Error(`Wire '${output}' not found`);
    }

    let definition = wire.definition;

    // end of recursion is when the definition is a numeric string
    if (!isNaN(definition)) {
        return new Signal(definition);
    }

    // split the definition into parts
    let parts = definition.split(' ');
    if (parts.length === 1) {
        // this is a direct wiring, so return the direct wiring gate
        let input = wires.get(parts[0]).gate ?? buildGate(parts[0], wires);

        wire.gate = new Gate(output, operationsMap.get("EQ"), [ input ]);
    }
    if (parts.length === 2) {
        // this is a NOT gate, so return the NOT gate
        let input = wires.get(parts[1]).gate ?? buildGate(parts[1], wires);
        wire.gate = new Gate(output, operationsMap.get("NOT"), [ input ]);
    }
    if (parts.length === 3) {
        // the any part may be a number or a wire name, so we need to check if it's a number
        inputs = [ parts[0], parts[2] ].map((input) => {
            if (!isNaN(input)) {
                // if part is a number, make input a Signal object
                return new Signal(input);
            } else {
                // else part is a wire name. Use existing gate if it exists, or build a new one
                return wires.get(input).gate ?? buildGate(input, wires);
            }
        });
        wire.gate = new Gate(output, operationsMap.get(parts[1]), inputs);
    }

    if (wire.gate === undefined) {
        // this definition is not valid, so we need to throw an error
        throw new Error(`Invalid definition for wire ${output}: ${definition}`);
    }
    return wire.gate;
}

class Context {
    constructor() {
        this.wires = new Map();
    }

    onLine(line) {
        // build map from wire-name to their gate definitions
        let split = line.split(' -> ');
        this.wires.set(split[1], { definition: split[0] });
    }

    onClose() {
        // walk through the wire-map and build the gates (recursively?)
        // start from wire 'a' and build the tree of gates from there
        let circuit = buildGate('a', this.wires);
        let part1value = circuit.value; // this should be the value of wire 'a'
        console.log(part1value); // this should be the value of wire 'a'

        // reset the wires to their initial state
        this.resetWires();
        // assign wire b the value part 1.
        this.wires.get('b').definition = part1value.toString();
        console.log(buildGate('a', this.wires).value); // this should be the value of wire 'a' after resetting the wires and assigning b the value of part 1.
    }

    resetWires() {
        // reset the wires to their initial state
        this.wires.forEach((value) => value.gate = undefined);
    }
}

const processModule = require('node:process');
const strm = require('node:readline').createInterface({
    input: processModule.stdin
});
const readLines = require('../readstream').readContent;
readLines(strm, new Context());

// readLines(strm, 
//     processModule.argv.length === 2? new Context(2) : new Context(10));