import { stdin } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from "../../readstream.js";

class Battery {
    constructor(initialJolts) {
        this.digits = initialJolts.length;
        this.jolts = initialJolts;
        console.log(`Creating battery from ${initialJolts} with ${this.digits} characters.`)
    }

    recharge(amount) {
        // Add amount digit to the right and then compare digits from left to right.
        // If the left digit is lower than the right, squash it and stop
        // When done keep the original length number of digits.
        this.jolts.push(amount);
        for (let i = 1; i <= this.digits; i++) {
            if (this.jolts.at(i-1) < this.jolts.at(i)) {
                this.jolts.splice(i-1, 1);
                break;
            }
        }
        this.jolts = this.jolts.slice(0, this.digits);
    }

    get charge() {
        return parseInt(this.jolts.join(''));
    }
}

class Context {
    constructor() {
        this.p1Joltage = 0;
        this.p2Joltage = 0;
    }

    onLine(line) {
        const digits = line.split('');
        const p1battery = new Battery(digits.slice(0, 2));
        const b2Battery = new Battery(digits.slice(0, 12));
        digits.slice(2).forEach(p1battery.recharge, p1battery);
        digits.slice(12).forEach(b2Battery.recharge, b2Battery);
        this.p1Joltage += p1battery.charge;
        this.p2Joltage += b2Battery.charge;
    }

    onClose() {
        console.log(`P1 Joltage: ${this.p1Joltage}`);
        console.log(`P2 Joltage: ${this.p2Joltage}`);
    }
}

const strm = createInterface({
    input: stdin
});

readContent(strm,
    new Context());
