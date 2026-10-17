class CardStash {
    constructor() {
        this.stash = [];
    }

    stashUp(count, cards = 1) {
        if (this.stash.length < cards) {
            // Stash is too short; extend it
            this.stash.push(... Array.from({length: cards - this.stash.length}, v => 0));
        }

        this.stash.forEach((v, i) => {
            if (i < cards) {
                this.stash[i] = v + count
            };
        });
    }

    checkOut() {
        return this.stash.length ? this.stash.shift() : 0;
    }
}

export class Context {
    constructor() {
        this.part1Score = 0;
        this.part2Score = 0;
        this.stash = new CardStash();
    }

    onLine(line) {
        let p = line.split(/[:|]/);  
        let winning = splitToArray(p[1]);
        let mine = splitToArray(p[2]);

        // count the winning among my numbers
        let wins = mine.filter(n => winning.includes(n)).length;

        // total amount of cards won is this original card and any stashed up ones
        let stashedWins = 1 + this.stash.checkOut();

        // now stash up the new win: the original card and the count of stashed copies stashes up on the number of wins
        this.stash.stashUp(stashedWins, wins);

        this.part1Score += wins == 0 ? 0 : 1 << (wins - 1)
        this.part2Score += stashedWins;
    }

    onClose() {
        console.log('Part 1 total score:', this.part1Score);
        console.log('Part 2 total score:', this.part2Score);
    }
}

function splitToArray(s) {
    return s.split(' ')
        .filter(i=>i); // skip empty strings
}