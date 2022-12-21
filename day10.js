class Context {
    constructor() {
      this.cycle = 0;
      this.signal = 1;
      this.accumulatedStrength = 0;
      this.interestingCycles = new Set([20, 60, 100, 140, 180, 220]);

      this.screen = new Array();
    }

    onLine(line) {
      let [cmd, arg] = line.split(' ');
      this.collectSignal();
      this.drawScreen();
      this.cycle++;
      if (cmd == 'addx') {
        this.collectSignal();
        this.drawScreen();
        this.signal += parseInt(arg);
        this.cycle++;
      }
    }

    collectSignal() {
      if (this.interestingCycles.has(this.cycle + 1)) {
        this.accumulatedStrength += (this.cycle + 1) * this.signal;
      }
    }

    drawScreen() {
      const hpos = this.cycle % 40;
      if ((this.signal - 1 <= hpos) && (hpos <= this.signal + 1)) {
        // sprite overlaps the current pixel
        this.screen.push('#');
      } else {
        this.screen.push('.');
      }
    }

    onClose() {
      console.log('Program is', this.cycle, 'cycles.');
      console.log('Accumulated signal strength:', this.accumulatedStrength);
      for (let row = 0; row < 6; row++) {
        console.log(this.screen.slice(40 * row, 40 * (row + 1)).join(''));
      }
    }
}

const processModule = require('node:process');
const strm = require('node:readline').createInterface({
    input: processModule.stdin
});
const readLines = require('./readstream').readContent;

readLines(strm, 
    new Context());
