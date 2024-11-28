class Game {
    #id;
    #grabs;

    constructor(id, grabs) {
        this.#id = parseInt(id);
        this.#grabs = grabs.map(grab => new Grab(grab.split(', ')));

    }

    get Id() { return this.#id; }

    get Grabs() { return this.#grabs; }

    IsValidGame() {
        return this.#grabs.every(g => g.red <= 12 && g.green <= 13 && g.blue <= 14);
    }

    MinimalBag() {
        return this.#grabs.reduce((total, current) => 
            ([
                Math.max(total[0], current.red), 
                Math.max(total[1], current.green), 
                Math.max(total[2], current.blue)]), 
            [0,0,0]);
    }
}

class Grab {
    red = 0;
    green = 0;
    blue = 0;

    constructor(grab) {
        grab.map(g => g.split(' '))
            .forEach(c => {
            let count = parseInt(c[0]);
            switch (c[1]) {
                case "red":
                    this.red += count;
                    break;
                case "green":
                    this.green += count;
                    break;
                case "blue":
                    this.blue += count;
                    break;
                default:
                    console.log("unknown color", c[1]);
            }
        });
    }

    toString() {
        return `{ red: ${this.red}, green: ${this.green}, blue: ${this.blue} }`;
    }
}

class Context {
    constructor() {
        this.total = 0;
        this.totalPower = 0;
    }

    onLine(line) {
        const gamepattern = /^Game (?<game>\d+): (?<scores>.*)$/;
        const match = line.match(gamepattern);
        const game = new Game(match.groups.game, match.groups.scores.split('; '));
        const minbag = game.MinimalBag();
        const power = minbag.reduce((t, c) => t*c);
        this.total += game.IsValidGame() ? game.Id : 0;
        this.totalPower += power;
        console.log(game.Id, game.Grabs.map(g => g.toString()).join(' + '), minbag, power);
    }

    onClose() {
        console.log('total result: ', this.total, this.totalPower);
    }   
}

const processModule = require('node:process');
const strm = require('node:readline').createInterface({
    input: processModule.stdin
});
const readLines = require('./readstream').readContent;

readLines(strm,
    new Context());

// readLines(strm, 
//     processModule.argv.length === 2? new Context(2) : new Context(10));