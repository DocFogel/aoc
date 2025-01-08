import { stdin, argv } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from "../readstream.js";

class ClawMachine {
    constructor() {
        this.A = null;
        this.B = null;
        this.P = null;
    }

    onLine(line) {
        const [cmd, value] = line.split(':');
        let x, y;

        switch (cmd) {
            case 'Button A':
                this.A = this.steps(value.trim());
                break;
            case 'Button B':
                this.B = this.steps(value.trim());
                break;
            case 'Prize':
                [x, y] = value.trim().split(', ').map(v => parseInt(v.substring(2)));
                this.P = { x, y };
                break;
        }        
    }

    steps(input) {
        const [x, y] = input.split(', ').map(v => parseInt(v.substring(1)));
        return { x, y };
    }

    get cost() {
        if (this.A === null || this.B === null || this.P === null) {
            return 0;
        }
        const d = this.A.x * this.B.y - this.A.y * this.B.x;
        const ai = this.B.y * this.P.x - this.B.x * this.P.y;
        const bi = this.A.x * this.P.y - this.A.y * this.P.x;
        const a = ai / d;
        const b = bi / d;
        if (a !== Math.round(a)) return 0;
        if (b !== Math.round(b)) return 0;
        return a*3 + b;
    }
}

class PartIIClaw extends ClawMachine {
    get cost() {
        if (this.P === null) {
            return 0;
        }
        this.P.x += 10000000000000;
        this.P.y += 10000000000000;
        return super.cost;
    }
}

class Context {
    constructor() {
        this.c1 = new ClawMachine();
        this.c2 = new PartIIClaw();

        this.c1Cost = 0;
        this.c2Cost = 0;
    }

    onLine(line) {
        if (line === '') {
            this.c1 = new ClawMachine();
            this.c2 = new PartIIClaw();
            return;
        }
        this.c1.onLine(line);
        this.c2.onLine(line);
        this.c1Cost += this.c1.cost;
        this.c2Cost += this.c2.cost;
    }

    onClose() {
        console.log('onClose');

        console.log('Cost:', this.c1Cost);
        console.log('Cost 2:', this.c2Cost);
    }
}

const strm = createInterface({
    input: stdin
});

readContent(strm,
    new Context());
