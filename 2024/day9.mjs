import { stdin, argv } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from "../readstream.js";

class FileSystemBlock {
    // This structure quickly gets out of hand when the disk is large and gets fragmented. 
    // Then we will not save memory compared to having all blocks in an array.
    constructor(start, size, fileId) {
        this.start = start;
        this.size = size;
        this.content = fileId;
    }
}

class Context {
    constructor() {
        this.diskmap = []
    }

    onLine(line) {
        let position = 0;
        line.split('').forEach((c, i) => {
            let blocksize = parseInt(c);
            let fileId = (i % 2 === 0) ? i / 2 : -1;
            if (blocksize === 0) {
                // empty block, no need to save it
                return;
            }
            this.diskmap.push(new FileSystemBlock(position, blocksize, fileId));
            position += blocksize;
        });
    }

    onClose() {
        let disksize = this.diskmap.reduce((acc, block) => acc + block.size, 0);
        console.log(this.diskmap);
        console.log(this.diskmap.length, disksize, this.getChecksum());
    }

    get checksum() {
        return this.diskmap.reduce((acc, block) => 
                acc + (block.content === -1 ? 0 : block.content * this.arithmeticSeries(block.start, block.size)), 
            0);
    }

    getChecksum() {
        return this.diskmap.reduce((acc, block) => {
                let blocksum = block.content != -1 ? block.content * this.arithmeticSeries(block.start, block.size) : 0;
                console.log(block.content, block.start, block.size, blocksum);
                return acc + blocksum; 
            },
            0);
    }

    arithmeticSeries(a1, n, d = 1) {
        return n * (2 * a1 + (n - 1) * d) / 2;
    }
}

const strm = createInterface({
    input: stdin
});

readContent(strm,
    new Context());
