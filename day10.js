class Context {
    constructor() {
      this.cycle = 0;
      this.signal = 1;
      this.accumulatedStrength = 0;
      this.interestingCycles = new Set([20, 60, 100, 140, 180, 220]);
    }

    onLine(line) {
      this.cycle++;
      let [cmd, arg] = line.split(' ');
      this.collectSignal();
      if (cmd == 'addx') {
        this.cycle++;
        this.collectSignal();
        this.signal += parseInt(arg);
      }
    }

    collectSignal() {
      if (this.interestingCycles.has(this.cycle)) {
        this.accumulatedStrength += this.cycle * this.signal;
      }
    }

    onClose() {
      console.log('Program is', this.cycle, 'cycles.');
      console.log('Accumulated signal strength:', this.accumulatedStrength);
    }
}

const processModule = require('node:process');
const strm = require('node:readline').createInterface({
    input: processModule.stdin
});
const readLines = require('./readstream').readContent;

readLines(strm, 
    new Context());
