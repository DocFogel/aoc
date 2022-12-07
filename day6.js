const processModule = require('node:process');


class Context {
    constructor() {
      this.codesRead = 0;
      this.codes = new Array(14);
    }

    onData(chunk) {
      if (this.hasStartSequence()) {
        return;
      }
      for (const c of chunk) {
        this.addCode(c);
        if (this.hasStartSequence()) {
          return;
        }
      }
    }

    onClose() {
      console.log(this.codesRead, this.codes);
    }

    addCode(c) {
      const len = this.codes.length;
      this.codes[this.codesRead++ % len] = c;
    }

    hasStartSequence() {
      const len = this.codes.length;
      if (this.codesRead < len) return false;
      return Array.from(new Set(this.codes)).length === len;
    }
}

function readLines(readstream, context) {  
    readstream.on('data', (chunk) => {
      if (context.onData != undefined)
        context.onData(chunk);
    }).on('line', (line) => {
      if (context.onLine != undefined)
        context.onLine(line);
    }).on('end', () => {
        if (context.onEnd != undefined)
            context.onEnd();
    }).on('close', () => {
        if (context.onClose != undefined)
            context.onClose();
    });
}

const strm = processModule.stdin;

readLines(strm, 
    new Context());
