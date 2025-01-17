import { stdin, argv } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from "../readstream.js";

class Context {
    ruleMode = 0;
    printMode = 1;

    constructor() {
        this.mode = this.ruleMode;
        this.rules = new Map();
        this.orderedSum = 0;
        this.correctedSum = 0;
    }

    onLine(line) {
        if (this.mode === this.ruleMode) {
            if (line === '') {
                this.mode = this.printMode;
                return;
            }
            const [key, value] = line.split('|');
            if (this.rules.has(key)) {
                this.rules.get(key).add(value.trim());
            } else {
                this.rules.set(key, new Set([value.trim()]));
            }
            return;
        }
        let pages = line.split(',');
        if (this.isOrdered(pages)) {
            this.orderedSum += parseInt(pages[Math.floor(pages.length / 2)]);
        } else {
            const corrected = this.correctedPages(pages);
            this.correctedSum += parseInt(corrected[Math.floor(corrected.length / 2)]);
        }
    }

    isOrdered(pages) {
        for (let i = 1; i < pages.length; i++) {
            const rule = this.rules.get(pages[i]);
            if (rule && pages.slice(0, i).some(p => rule.has(p))) {
                return false;
            }
        }
        return true;
    }

    correctedPages(pages) {
        // pick one page at a time and insert it in the corrected array
        let corrected = [];
        pages.forEach(element => {
            // if the element does not have a rule, just add it to the end of corrected array
            // if it has a rule, insert the element just before the first corrected element mentioned in the rule
            // if none of the corrected elements are in the rule, add it to the end
            const rule = this.rules.get(element);
            if (rule) {
                for (let i = 0; i < corrected.length; i++) {
                    if (rule.has(corrected[i])) {
                        corrected.splice(i, 0, element);
                        return;
                    }
                }
            }
            corrected.push(element);
        });
        return corrected;
    }

    onClose() {
        console.log("Sum or correct prints:", this.orderedSum);
        console.log("Sum of corrected prints:", this.correctedSum);
    }
}

const strm = createInterface({
    input: stdin
});

readContent(strm,
    new Context());
