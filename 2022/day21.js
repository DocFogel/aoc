class Operation {
    inversionMap = new Map([
        ["+", "-"], ["-", "+"], 
        ["*", "/"], ["/", "*"], 
        ["=?", "="], ["=", "=?"]
    ]);

    constructor(op) {
        if (!["+", "-", "*", "/", "=?", "="].includes(op)) 
            throw Error(`Unexpected operator ${op}`);
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
            case "=?":
                return Math.sign(operand1 - operand2);
            case "=":
                return operand2 + Math.sign(operand1);
        };
    }

    get inverse() { 
        return new Operation(this.inversionMap.get(this.operator));
    }

    toString() { 
        return this.operator;
    }
}

class Monkey {
    constructor(name) {
        this.name = name;
    }
}

class Howler extends Monkey {
    #value;

    constructor(name, value) {
        super(name);
        this.#value = parseInt(value);
    }

    getValue() {
        return this.#value;
    }

    toString() {
        return `Monkey ${this.name} yelling ${this.#value}`;
    }
}

class Brain extends Monkey {
    #operator;

    constructor(name, operator, m1, m2) {
        super(name);
        this.#operator = operator;

        this.monkey1 = m1
        this.monkey2 = m2;
    }

    getValue() {
        const m1 = this.monkey1.getValue();
        const m2 = this.monkey2.getValue();
        return this.#operator.calculate(
            m1, m2
        ); 
    }

    toString() {
        return `Brain ${this.name} depending on ${this.monkey1} ${this.#operator} ${this.monkey2}`;
    }
}

class Edge {
    constructor(name) {
        this.name = name;
        this.red = null;
        this.blue = null;
    }

    addEndpoint(endpoint) {
        if (this.red == null) {
            this.red = endpoint;
            return;
        }
        if (this.blue == null) {
            this.blue = endpoint;
            return;
        }
        // all endpoints are already taken... throw an error
        throw Error(`Attempt to assign too many endpoints to ${this.name}`);
    }

    asTree(fromNode = undefined) {
        if (fromNode === undefined) {
            // starting from a dangling edge, where there is no fromNode. Take the first available.
            if (this.red != null) { 
                return this.red.asTree(this);
            }
            if (this.blue != null) {
                return this.blue.asTree(this);
            }
            console.error("no endpoints available");
            return null;
        }
        if (this.red?.name === fromNode.name) {
            return this.blue?.asTree(this);
        }
        if (this.blue?.name === fromNode.name) {
            return this.red?.asTree(this);
        }
        // this edge is not connected to the node
        console.log("not connected to that node or to any node");
        return null;
    }

    toString = () => `${this.name} with red: (${this.red?.name}) and blue: (${this.blue?.name})`;
}

class Node {
    #name
    constructor(edges, relation) {
        this.#name = Node.ids.next().value;
        this.gamma = edges[2];
        this.operation = new Operation(relation);
        if (relation === "-" || relation === "/" || relation === "=") {
             this.alpha = edges[1];
             this.beta = edges[0];
             this.operation = this.operation.inverse;
        } else {
            this.alpha = edges[0];
            this.beta = edges[1];
        }
    }

    toString() {
        return `${this.#name} connecting ${this.alpha.name} as ${this.beta.name} ${this.operation} ${this.gamma.name}`;
    }

    asTree(fromEdge) { 
        // this is a bit of a hack, but it works for now.
        if (this.alpha.name === fromEdge.name) {
            return new Brain(this.alpha.name, this.operation, this.beta.asTree(this), this.gamma.asTree(this));
        }
        if (this.beta.name === fromEdge.name) {
            return new Brain(this.beta.name, this.operation.inverse, this.alpha.asTree(this), this.gamma.asTree(this));
        }
        if (this.gamma.name === fromEdge.name) {
            return new Brain(this.gamma.name, this.operation.inverse, this.alpha.asTree(this), this.beta.asTree(this));
        }
        // this node is not connected to the edge
        return null;
    }

    get name() {
        return this.#name;
    }

    static ids = ids("node");
}

class Leaf {
    #name;
    constructor(edge, value) {
        this.#name = Leaf.ids.next().value;
        this.edge = edge;
        this.value = parseInt(value);
    }

    toString() {
        return `${this.#name} provides ${this.edge} the value ${this.value}`;
    }

    asTree(fromEdge) {
        // be promisquous and return the Howler from any edge...
        return new Howler(fromEdge.name, this.value);
    }

    get name() {
        return this.#name;
    }

    static ids = ids("leaf");
}

class Context {
    constructor() {
        this.edges1 = new Map();
        this.edges2 = new Map();
        // prime part 2's edges with the root edge and it's leaf
        let root = new Edge("root");
        root.addEndpoint(new Leaf(root, 0));
        this.edges2.set("root", root);
    }

    onLine(line) {
        let split = line.split(' ');
        let name = split[0];
        name = name.substring(0, name.length - 1);

        this.handleRule(name, split.slice(1), this.edges1);

        // we have some special rules for the second part
        if (name === "root") {
            // give root the proper job 
            split[2] = "=?";
            this.handleRule(name, split.slice(1), this.edges2);
        } else if (name !== "humn") {
            this.handleRule(name, split.slice(1), this.edges2);
        } // leave humn without a job. This is what we will calculate.
    }

    handleRule(name, rule, edges) {
        let edge = this.getOrCreateEdge(edges, name);
        if (rule.length > 1) {
            this.addNode([edge, this.getOrCreateEdge(edges, rule[0]), this.getOrCreateEdge(edges, rule[2])], rule[1]);
        } else {
            edge.addEndpoint(new Leaf(edge, rule[0]));
        }
    }

    addNode(edges, relation) {
        let node = new Node(edges, relation);
        edges.forEach(e => e.addEndpoint(node));
    }

    getOrCreateEdge(edges, name) {
        let edge = edges.get(name);
        if (edge == undefined) {
            edge = new Edge(name);
            edges.set(name, edge);
        }
        return edge;
    }

    onClose() {
        if (this.edges1.size === 0) return;

        this.part1();
        this.part2();
    }

    part1() {
        let root = this.edges1.get("root");
        console.log("root monkey yells:", root.asTree().getValue());
    }

    part2() {
        console.log("I yell:", this.edges2.get("humn").asTree().getValue());
    }
}

function* ids(prefix) {
    let i = 1;
    while (true) {
        yield `${prefix}${i++}`;
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