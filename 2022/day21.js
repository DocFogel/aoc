
class Monkey {
    #value;

    constructor(value) {
        this.#value = parseInt(value);
    }

    getValue(monkeys) {
        return this.#value;
    }

    ToString() {
        return `Monkey yelling ${this.#value}`;
    }
}

class Brain {
    constructor(operator, opname1, opname2) {
        this.operator = operator;
        this.operand1 = opname1
        this.operand2 = opname2;
    }

    getValue(monkeys) {
        switch (this.operator) {
            case "+":
                return monkeys.get(this.operand1).getValue(monkeys) + monkeys.get(this.operand2).getValue(monkeys);
            case "-":
                return monkeys.get(this.operand1).getValue(monkeys) - monkeys.get(this.operand2).getValue(monkeys);
            case "*":
                return monkeys.get(this.operand1).getValue(monkeys) * monkeys.get(this.operand2).getValue(monkeys);
            case "/":
                return monkeys.get(this.operand1).getValue(monkeys) / monkeys.get(this.operand2).getValue(monkeys);
            }
    }

    ToString() {
        return `Brain working with ${this.operand1} and ${this.operand2}`;
    }
}

class Context {
    constructor() {
        this.monkeys = new Map();
    }

    onLine(line) {
        let split = line.split(' ');
        let name = split[0];
        name = name.substring(0, name.length - 1);
        if (split.length === 2) {
            // this is a monkey
            this.monkeys.set(name, new Monkey(split[1]));
        } else {
            // this is a brain
            this.monkeys.set(name, new Brain(split[2], split[1], split[3]));
        }
    }

    onClose() {
        console.log("root monkey yells", this.monkeys.get("root").getValue(this.monkeys));
    }
}

function test() {
    let monkeys = new Map();
    monkeys.set("m1", new Monkey(10));
    monkeys.set("m2", new Monkey(2));
    monkeys.set("add", new Brain("+", "m1", "m2"));
    monkeys.set("sub", new Brain("-", "m2", "m1"));
    monkeys.set("mult", new Brain("*", "m1", "m2"));
    monkeys.set("div", new Brain("/", "m1", "m2"));
    if (monkeys.get("add").getValue(monkeys) != 12)  throw new Error("add monkey in error");
    if (monkeys.get("sub").getValue(monkeys) != -8)  throw new Error("sub monkey in error");
    if (monkeys.get("mult").getValue(monkeys) != 20)  throw new Error("mult monkey in error");
    if (monkeys.get("div").getValue(monkeys) != 5)  throw new Error("div monkey in error");
}

test();

const processModule = require('node:process');
const strm = require('node:readline').createInterface({
    input: processModule.stdin
});
const readLines = require('../readstream').readContent;

readLines(strm,
    new Context());

// readLines(strm, 
//     processModule.argv.length === 2? new Context(2) : new Context(10));