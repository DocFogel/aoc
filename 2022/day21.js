class Operation {
    inversionMap = new Map([["+", "-"], ["-", "+"], ["*", "/"], ["/", "*"]]);

    constructor(op) {
        if (!["+", "-", "*", "/"].includes(op)) 
            throw Error(`Unexpected operator ${operator}`);
        this.operator = op;
    }

    calculate(operand1, operand2) {
        switch (this.operator) {
            case "+":
                return operand1 + operand2;
            case "-":
                return operand1 - operand2;
            case "*":
                return operand1 * operand2;
            case "/":
                return operand1 / operand2;
            };
    }

    get inverse() { 
        return this.inversionMap[this.operator];
    }
}

class Monkey {
    #value;

    constructor(name, value) {
        this.name = name;
        this.#value = parseInt(value);
    }

    getValue(monkeys) {
        return this.#value;
    }

    dependencyOn(name) { return null; }

    ToString() {
        return `Monkey ${this.name} yelling ${this.#value}`;
    }
}

class Brain {
    #operator;

    constructor(name, operator, opname1, opname2) {
        this.name = name;
        this.#operator = new Operation(operator);

        this.operand1 = opname1
        this.operand2 = opname2;
    }

    getValue(monkeys) {
        return this.#operator.calculate(this.operand1, this.operand2);
    }

    dependencyOn(operand) {
        let other;
        try {
            other = this.other(operand);
        } catch (Error) {
            return null;
        }

        switch (this.#operator.operator) {
            case "+": 
                return new Brain(operand, this.#operator.inverse, this.name, other);

            case "-":
                if (operand === this.operand1)
                    return new Brain(operand, this.#operator.inverse, this.name, other);
                else
                    return new Brain(operand, this.#operator.operator, other, this.name);

            case "*":
                return new Brain(operand, this.#operator.inverse, this.name, other);

            case "/":
                if (operand === this.operand1)
                    return new Brain(operand, this.#operator.inverse, this.name, other);
                else
                    return new Brain(operand, this.#operator.operator, other, this.name);

            default:
                throw Error(`Unknown operator ${this.#operator}`);
        }
        
    }

    other(operand) {
        if (operand !== this.operand1 && operand !== this.operand2) {
            throw Error(`This brain is not wired to the ${operand} monkey`);
        }

        return operand === this.operand1 ? this.operand2 : this.operand1;
    }

    ToString() {
        return `Brain ${this.name} depending on ${this.operand1} ${this.#operator} ${this.operand2}`;
    }
}

class Context {
    constructor() {
        this.monkeys = [];
    }

    onLine(line) {
        let split = line.split(' ');
        let name = split[0];
        name = name.substring(0, name.length - 1);

        if (split.length === 2) {
            // this is a monkey
            this.monkeys.push(new Monkey(name, split[1]));
        } else {
            // this is a brain
            this.monkeys.push(new Brain(name, split[2], split[1], split[3]));
        }
    }

    onClose() {
        if (this.monkeys.size === 0) return;

        this.part1();
        this.part2();
    }

    part1() {
        tree = new Map(this.monkeys.map(m => [m.name, m]));
        console.log("root monkey yells", tree.get("root").getValue(tree));
    }

    part2() {
    }
}

function reverseDependency(brains, name) {
    let reversedBrain = null;
    for (brain of brains.values()) {
        reversedBrain = brain.dependencyOn(name);
        if (reversedBrain != null) {
            console.log(`reversed ${name} into ${reversedBrain.ToString()}`);
            return [...reverseDependency(brains, reversedBrain.name), reversedBrain]
        }
    }
    console.log(`reversing stopped with ${name}`);
    return [];
}

function monkeyTest() {
    let monkeys = new Map();
    monkeys.set("m1", new Monkey("m1", 10));
    monkeys.set("m2", new Monkey("m2", 2));
    monkeys.set("add", new Brain("add", "+", "m1", "m2"));
    monkeys.set("sub", new Brain("sub", "-", "m2", "m1"));
    monkeys.set("mult", new Brain("mult", "*", "m1", "m2"));
    monkeys.set("div", new Brain("div", "/", "m1", "m2"));
    try {
        monkeys.set("fail", new Brain("fail", "=", "m1", "m2"));
    } catch (e) {
        console.log("Could not create the fail monkey, which is good!", e.message);
    }

    if (monkeys.get("add").getValue(monkeys) != 12)  throw new Error("add monkey in error");
    if (monkeys.get("sub").getValue(monkeys) != -8)  throw new Error("sub monkey in error");
    if (monkeys.get("mult").getValue(monkeys) != 20)  throw new Error("mult monkey in error");
    if (monkeys.get("div").getValue(monkeys) != 5)  throw new Error("div monkey in error");
}

function dependencyTest() {
    let addBrain = new Brain("A", "+", "B", "C");
    let multBrain = new Brain("D", "*", "E", "F");
    let divBrain = multBrain.dependencyOn("E");

    console.log("addBrain:", addBrain.ToString());
    console.log("addBrain as seen from B:", addBrain.dependencyOn("B").ToString());
    console.log("addBrain as seen from C:", addBrain.dependencyOn("C").ToString());
    console.log("addBrain as seen from D:", addBrain.dependencyOn("D")?.ToString());
    
    console.log("multBrain:", multBrain.ToString());
    console.log("multBrain as seen from E:", multBrain.dependencyOn("E").ToString());
    console.log("multBrain as seen from F:", multBrain.dependencyOn("F").ToString());

    console.log("divBrain's three views:\n", divBrain.ToString());
    console.log(divBrain.dependencyOn("F").ToString());
    console.log(divBrain.dependencyOn("D").ToString());
}

function reverseTest() {
    let ctx = new Context();
    [ 
        "a: b + c",
        "b: 1",
        "c: d * f",
        "d: g / e",
        "f: 2",
        "g: 3",
        "e: 4"
    ].forEach(l => ctx.onLine(l));
    console.log("initial monkeys:", ctx.monkeys.size);
    Array.from(ctx.monkeys.values()).forEach(m => console.log(m.ToString()));
    
    const onlyBrains = new Map(Array.from(ctx.monkeys.entries()).filter(e => e[1] instanceof Brain));
    const reversed = reverseDependency(onlyBrains, "e");
    reversed.values().forEach(b => console.log(b.ToString()));
}

const processModule = require('node:process');
const { isInt16Array } = require('node:util/types');
const strm = require('node:readline').createInterface({
    input: processModule.stdin
});
const readLines = require('../readstream').readContent;

//reverseTest();
monkeyTest(); dependencyTest();

//readLines(strm, new Context());

// readLines(strm, 
//     processModule.argv.length === 2? new Context(2) : new Context(10));