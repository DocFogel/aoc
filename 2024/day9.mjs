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

function fileBlockToMove(block, gap) {
    return block.content !== -1 
        && block.start > gap.start 
        && block.size <= gap.size
        && !block.relocated;
}

class Context {
    constructor() {
        this.part1map = [];
        this.part2map = [];
    }

    onLine(line) {
        let position = 0;
        line.split('').forEach((section, index) => {
            // Part 1
            let fileId = (index % 2 === 0) ? index / 2 : -1;
            let sectionSize = parseInt(section);
            this.part1map.push(...Array(sectionSize).fill(fileId));

            // Part 2
            let blocksize = parseInt(section);
            if (blocksize === 0) {
                // empty block, no need to save it
                return;
            }
            this.part2map.push(new FileSystemBlock(position, blocksize, fileId));
            position += blocksize;
        });
    }

    onClose() {
        console.log(this.checksum1, this.checksum2);
        this.compressDisk();
        console.log(this.checksum1, this.checksum2);
    }

    compressDisk() {
        this.compressPart1();
        this.compressPart2();
    }

    compressPart1() {
        // walk through the diskmap and move fileblocks from the end to the first free block
        let usedBlocks = this.part1map.reduce((acc, val) => val === -1 ? acc : acc + 1, 0);
        let lastUsedBlock = this.part1map.length - 1;
        for (let currentBlock = 0; currentBlock < usedBlocks; currentBlock++) {
            // if diskmap[currentBlock] is free (=-1), find the last used block and move it to currentBlock and set lastUsedBlock free.
            if (this.part1map[currentBlock] === -1) {
                while (this.part1map[lastUsedBlock] === -1) {
                    lastUsedBlock--;
                }
                this.part1map[currentBlock] = this.part1map[lastUsedBlock];
                this.part1map[lastUsedBlock] = -1;
            }
        }
    }

    compressPart2() {
        // Walk through free blocks from the start and fill them with fitting files from the end.
        this.part2map
            .filter(block => block.content === -1)
            .forEach(gap => {
                let fileToMove;
                while ((fileToMove = this.part2map.findLast(block => fileBlockToMove(block, gap))) != undefined) {
                    fileToMove.start = gap.start;
                    gap.size -= fileToMove.size;
                    gap.start += fileToMove.size;
                    fileToMove.relocated = true;
                }
            });
    }

    get checksum1() {
        return this.part1map.reduce((acc, val, index) => 
                acc + (val === -1 ? 0 : val * index),
            0);
    }

    get checksum2() {
        return this.part2map.reduce((acc, block) => 
                acc + (block.content === -1 ? 0 : block.content * this.arithmeticSeries(block.start, block.size)), 
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
