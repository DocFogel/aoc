import { stdin } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from "../../readstream.js";

class Context {
    constructor() {
        this.zeropasses = 0;
        this.zerostops = 0;
        this.dial = 50;
    }

    onLine(line) {
        let dialChange = parseInt(line.slice(1));
        this.zeropasses += Math.trunc(dialChange / 100);
        dialChange = dialChange % 100;

        if (dialChange !== 0) {
            if (line.at(0) === 'L') {
                this.dial -= dialChange;
            } else if (line.at(0) === 'R') {
                this.dial += dialChange;
            }

            if (this.dial < 0) {
                if (this.dial + dialChange !== 0) {
                    // did not dial from 0
                    this.zeropasses++;
                }
                this.dial += 100;
            } else if (this.dial === 0) {
                this.zeropasses++;
            } else if (this.dial === 100) {
                this.zeropasses++;
                this.dial = 0;
            } else if (this.dial > 100) {
                this.dial -= 100;
                this.zeropasses++;
            }

            if (this.dial === 0) {
                this.zerostops++;
            }
        }
        
        console.log(`Stats: dial=${this.dial} passes=${this.zeropasses} stops=${this.zerostops}`);
    }

    onClose() {
        console.log(`Final dial position: ${this.dial % 100}`);
        console.log(`Number of zero passes: ${this.zeropasses}`);
        console.log(`Number of zero stops: ${this.zerostops}`);
    }
}

const strm = createInterface({
    input: stdin
});

readContent(strm,
    new Context());
