class Position {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    getDistance(to) {
        return new Position(to.x - this.x, to.y - this.y);
    }

    toString() { return `${this.x},${this.y}`; }
}

class Knot {
    constructor(name, starPosition) {
        this.name = name;
        this.position = starPosition;
        this.tail = null;
        this.visited = new Set();
        this.visited.add(this.position.toString());
    }

    addTail(knot) {
        if (this.tail == null) {
            this.tail = knot;
            return knot;
        } else {
            return this.tail.addTail(knot);
        }
    }

    getKnot(name) {
        return this.name === name ? this : this.tail?.getKnot(name);
    }

    move(direction, steps) {
        const cp = this.position;
        switch (direction) {
            case 'U':
                this.position = new Position(cp.x, cp.y + steps);
                break;

            case 'D':
                this.position = new Position(cp.x, cp.y - steps);
                break;

            case 'L':
                this.position = new Position(cp.x - steps, cp.y);
                break;

            case 'R':
                this.position = new Position(cp.x + steps, cp.y);
                break;

            default:
                console.log('unexpected direction: ', direction);
        }
    }

    tugTail() {
        this.tail?.follow(this);
    }

    follow(head) {
        let delta = this.position.getDistance(head.position);
        
        while (Math.abs(delta.x) > 1 || Math.abs(delta.y) > 1) {
            let move = new Position(Math.sign(delta.x), Math.sign(delta.y));
            this.position = new Position(this.position.x + move.x, this.position.y + move.y);
            this.visited.add(this.position.toString());
            delta = new Position(delta.x - move.x, delta.y - move.y);
        }

        this.tugTail();
    }
}

class Context {
    constructor(knots) {
        this.head = new Knot("head", new Position());
        for (let i = 1; i < knots - 1; i++)
            this.head.addTail(new Knot(i, new Position()));
        this.head.addTail(new Knot('last', new Position()));
    }

    onLine(line) {
        let direction, steps;
        [direction, steps] = line.split(' ');
        for (let i = parseInt(steps); i > 0; i--) {
            this.head.move(direction, 1);
            this.head.tugTail();
        }
    }

    onClose() {
        const tailsVisited = Array.from(this.head.getKnot('last')?.visited);
        console.log('Tails visited cells:', tailsVisited.length);
        console.log(tailsVisited);
    }
}

const processModule = require('node:process');
const strm = require('node:readline').createInterface({
    input: require('node:process').stdin
});
const readLines = require('../readstream').readContent;

readLines(strm, 
    processModule.argv.length === 2? new Context(2) : new Context(10));