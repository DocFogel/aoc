const { timeStamp } = require('node:console');

class Context {
    constructor() {
        this.grove = new Array();
        this.width = 0;
        this.depth = 0;
    }

    onLine(line) {
        this.width = line.length;
        this.depth++;
        this.grove.push(...line.split('').map(v => ({ 
            height: parseInt(v), 
            visibility: 0,
            score: { north: 0, south: 0, east:0, west:0 }
        })));
    }

    onClose() {
        this.grove.forEach((tree, index) => {
            tree.score.east = this.viewEast(index);
            if (tree.score.east <= 0) {
                tree.visibility += 1;
            }
            tree.score.north = this.viewNorth(index);
            if (tree.score.north <= 0) {
                tree.visibility += 2;
            }
            tree.score.west = this.viewWest(index);
            if (tree.score.west <= 0) {
                tree.visibility += 4;
            }
            tree.score.south = this.viewSouth(index);
            if (tree.score.south <= 0) {
                tree.visibility += 8;
            }
        })
        console.log(this.grove.reduce((tot, tree)=>tot += Math.sign(tree.visibility), 0), "trees are visible")
        console.log(Math.max(...this.grove.map(t => Math.abs(t.score.east * t.score.west * t.score.north * t.score.south))));
    }
     
    viewWest(index) {
        let row = Math.trunc(index / this.width);
        return this.viewScore(index, -1, row * this.width, (row + 1) * this.width - 1);
    }

    viewEast(index) {
        let row = Math.trunc(index / this.width);
        return this.viewScore(index, 1, row * this.width, (row + 1) * this.width - 1);
    }

    viewSouth(index) {
        return this.viewScore(index, this.width, 0, this.grove.length - 1);
    }

    viewNorth(index) {
        return this.viewScore(index, -this.width, 0, this.grove.length - 1);
    }

    viewScore(index, step, lowerBounds, upperBounds) {
        let score = 0;
        let viewHeight = this.grove.at(index).height;
        index += step;
        while (index >= lowerBounds && index <= upperBounds) {
            score++;
            if (this.grove.at(index).height >= viewHeight) {
                return score;
            }
            index += step;
        }
        return -score;
    }
}

const strm = require('node:readline').createInterface({
    input: require('node:process').stdin
});
const readLines = require('../readstream').readContent;
readLines(strm, 
    new Context());
