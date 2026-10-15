
export class Context {
    constructor() {
        this.score = 0;
    }

    onLine(line) {
        let p = line.split(/[:|]/);  
        let winning = splitToArray(p[1]);
        let mine = splitToArray(p[2]);

        // count the winning among my numbers
        let wins = mine.filter(n => winning.includes(n)).length;

        this.score += wins == 0 ? 0 : 1 << (wins - 1)
    }

    onClose() {
        console.log('total score:', this.score);
    }
}

function splitToArray(s) {
    return s.split(' ')
        .filter(i=>i); // skip empty strings
}