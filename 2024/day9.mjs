import { stdin, argv } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from "../readstream.js";

class Context {
    constructor() {
        this.diskmap = []
    }

    onLine(line) {
        line.split('').forEach((section, index) => {
            let fileId = index % 2 === 0 ? index / 2 : -1;
            let sectionSize = parseInt(section);
            this.diskmap.push(...Array(sectionSize).fill(fileId));
        });
    }

    onClose() {
        console.log(this.checksum);
        this.compressDisk();
        console.log(this.checksum);
    }

    compressDisk() {
        // walk through the diskmap and move fileblocks from the end to the first free block
        let usedBlocks = this.diskmap.reduce((acc, val) => val === -1 ? acc : acc + 1, 0);
        let lastUsedBlock = this.diskmap.length - 1;
        for (let currentBlock = 0; currentBlock < usedBlocks; currentBlock++) {
            // if diskmap[currentBlock] is free (=-1), find the last used block and move it to currentBlock and set lastUsedBlock free.
            if (this.diskmap[currentBlock] === -1) {
                while (this.diskmap[lastUsedBlock] === -1) {
                    lastUsedBlock--;
                }
                this.diskmap[currentBlock] = this.diskmap[lastUsedBlock];
                this.diskmap[lastUsedBlock] = -1;
            }
        }
        // When this is ready the current block should be free, all blocks before it should be used and all blocks after it should be free.

    }

    get checksum() {
        return this.diskmap.reduce((acc, val, index) => 
                acc + (val === -1 ? 0 : val * index),
            0);
    }
}

const strm = createInterface({
    input: stdin
});

readContent(strm,
    new Context());
