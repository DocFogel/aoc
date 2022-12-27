const { it } = require("node:test");

class Item {
    constructor(worryLevel, wraparoundLevel) {
        this.worry = worryLevel;
        this.wraparoundLevel = wraparoundLevel;
    }

    inspect(worryLevel) {
        return this.worry = worryLevel % this.wraparoundLevel;
    }

    toString() {
        return this.worry.toString();
    }
}

class Monkey {
    constructor(name, items, worryFunction, test, yesMonkey, noMonkey) {
        this.name = name;
        this.items = Array.from(items);
        this.worry = worryFunction;
        this.test = test;
        this.yesMonkey = yesMonkey;
        this.noMonkey = noMonkey;
        this.inspectedCount = 0;
    }

    playRound() {
        while (this.items.length !== 0) {
            const item = this.items.shift();
            this.test(this.inspect(item)) ? this.yesMonkey().catchItem(item) : this.noMonkey().catchItem(item);
        }
    }

    inspect(item) {
        this.inspectedCount++;
        return item.inspect(this.worry(item));
    }

    catchItem(item) {
        this.items.push(item);
    }

    toString() {
        return `Monkey { name: '${this.name}', items: ${this.items}, inspectedCount: ${this.inspectedCount} }`;
    }
}

class KeepAway {
    constructor() {
        this.monkeys = new Array();
    }

    initialize() {
        const leastCommonWorry = 3 * 13 * 19 * 17 * 5 * 7 * 11 * 2;
        this.monkeys.push(
            new Monkey(
                // Starting items: 54, 98, 50, 94, 69, 62, 53, 85
                // Operation: new = old * 13
                // Test: divisible by 3
                //   If true: throw to monkey 2
                //   If false: throw to monkey 1
                'M0',
                [54, 98, 50, 94, 69, 62, 53, 85].map(i => new Item(i, leastCommonWorry)),
                (item) => item.worry * 13,
                (wl) => wl % 3 === 0,
                () => this.findMonkey('M2'),
                () => this.findMonkey('M1')
            ));
        this.monkeys.push(
            new Monkey(
                // Starting items: 71, 55, 82
                // Operation: new = old + 2
                // Test: divisible by 13
                //     If true: throw to monkey 7
                //     If false: throw to monkey 2
                'M1',
                [71, 55, 82].map(i => new Item(i, leastCommonWorry)),
                (item) => item.worry + 2,
                (wl) => wl % 13 === 0,
                () => this.findMonkey('M7'),
                () => this.findMonkey('M2')
            )
        );
        this.monkeys.push(
            new Monkey(
                // Starting items: 77, 73, 86, 72, 87
                // Operation: new = old + 8
                // Test: divisible by 19
                //   If true: throw to monkey 4
                //   If false: throw to monkey 7
                'M2',
                [77, 73, 86, 72, 87].map(i => new Item(i, leastCommonWorry)),
                (item) => item.worry + 8,
                (wl) => wl % 19 === 0,
                () => this.findMonkey('M4'),
                () => this.findMonkey('M7')
            )
        );
        this.monkeys.push(
            new Monkey(
                // Starting items: 97, 91
                // Operation: new = old + 1
                // Test: divisible by 17
                //   If true: throw to monkey 6
                //   If false: throw to monkey 5
                'M3',
                [97, 91].map(i => new Item(i, leastCommonWorry)),
                (item) => item.worry + 1,
                (wl) => wl % 17 === 0,
                () => this.findMonkey('M6'),
                () => this.findMonkey('M5')
            )
        );
        this.monkeys.push(
            new Monkey(
                // Starting items: 78, 97, 51, 85, 66, 63, 62
                // Operation: new = old * 18
                // Test: divisible by 5
                //   If true: throw to monkey 6
                //   If false: throw to monkey 3
                'M4',
                [78, 97, 51, 85, 66, 63, 62].map(i => new Item(i, leastCommonWorry)),
                (item) => item.worry * 17,
                (wl) => wl % 5 === 0,
                () => this.findMonkey('M6'),
                () => this.findMonkey('M3')
            )
        );
        this.monkeys.push(
            new Monkey(
                // Starting items: 88
                // Operation: new = old + 3
                // Test: divisible by 7
                //   If true: throw to monkey 1
                //   If false: throw to monkey 0
                'M5',
                [88].map(i => new Item(i, leastCommonWorry)),
                (item) => item.worry + 3,
                (wl) => wl % 7 === 0,
                () => this.findMonkey('M1'),
                () => this.findMonkey('M0')
            )
        );
        this.monkeys.push(
            new Monkey(
                // Starting items: 87, 57, 63, 86, 87, 53
                // Operation: new = old ** 2
                // Test: divisible by 11
                //   If true: throw to monkey 5
                //   If false: throw to monkey 0
                'M6',
                [87, 57, 63, 86, 87, 53].map(i => new Item(i, leastCommonWorry)),
                (item) => item.worry ** 2,
                (wl) => wl % 11 === 0,
                () => this.findMonkey('M5'),
                () => this.findMonkey('M0')
            )
        );
        this.monkeys.push(
            new Monkey(
                // Starting items: 73, 59, 82, 65
                // Operation: new = old + 6
                // Test: divisible by 2
                //   If true: throw to monkey 4
                //   If false: throw to monkey 3
                'M7',
                [73, 59, 82, 65].map(i => new Item(i, leastCommonWorry)),
                (item) => item.worry + 6,
                (wl) => wl % 2 === 0,
                () => this.findMonkey('M4'),
                () => this.findMonkey('M3')
            )
        );
    }

    initializeTest() {
        const leastCommonWorry = 23 * 19 * 13 * 17
        this.monkeys.push(
            new Monkey(
                // Starting items: 79, 98
                // Operation: new = old * 19
                // Test: divisible by 23
                //   If true: throw to monkey 2
                //   If false: throw to monkey 3
                'M0',
                [79, 98].map(i => new Item(i, leastCommonWorry)),
                (item) => item.worry * 19,
                (wl) => wl % 23 === 0,
                () => this.findMonkey('M2'),
                () => this.findMonkey('M3')
            ));
        this.monkeys.push(
            new Monkey(
                // Starting items: 54, 65, 75, 74
                // Operation: new = old + 6
                // Test: divisible by 19
                //     If true: throw to monkey 2
                //     If false: throw to monkey 0
                'M1',
                [54, 65, 75, 74].map(i => new Item(i, leastCommonWorry)),
                (item) => item.worry + 6,
                (wl) => wl % 19 === 0,
                () => this.findMonkey('M2'),
                () => this.findMonkey('M0')
            )
        );
        this.monkeys.push(
            new Monkey(
                // Starting items: 79, 60, 97
                // Operation: new = old * old
                // Test: divisible by 13
                //   If true: throw to monkey 1
                //   If false: throw to monkey 3
                'M2',
                [79, 60, 97].map(i => new Item(i, leastCommonWorry)),
                (item) => item.worry ** 2,
                (wl) => wl % 13 === 0,
                () => this.findMonkey('M1'),
                () => this.findMonkey('M3')
            )
        );
        this.monkeys.push(
            new Monkey(
                // Starting items: 74
                // Operation: new = old + 3
                // Test: divisible by 17
                //   If true: throw to monkey 0
                //   If false: throw to monkey 1
                'M3',
                [new Item(74, leastCommonWorry)],
                (item) => item.worry + 3,
                (wl) => wl % 17 === 0,
                () => this.findMonkey('M0'),
                () => this.findMonkey('M1')
            )
        );
    }

    findMonkey(name) {
        return this.monkeys.find(m => m.name === name);
    }

    runRounds(count = 1) {
        while (count-- > 0) {
            this.monkeys.forEach(m => m.playRound());
        }
    }

    monkeyBusiness() {
        return this.monkeys.sort((a, b) => b.inspectedCount - a.inspectedCount).slice(0,2).reduce((p, m) => p * m.inspectedCount, 1);
    }
}

const processModule = require('node:process');
const iterations = processModule.argv.length >= 3 ? parseInt(processModule.argv[2]) : 1;
const useTest = processModule.argv.length >= 4 ? processModule.argv[3] === 'test' : false;

const game = new KeepAway();
if (useTest) { 
    game.initializeTest();
} else { 
    game.initialize(); 
}

game.runRounds(iterations);
console.log(game.monkeys.map(m => m.toString()).join(', \n'));
console.log('Monkey business: ', game.monkeyBusiness());