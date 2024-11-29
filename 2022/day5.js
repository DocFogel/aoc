const processModule = require('node:process');

function processLine(line, context) {
    switch (context.stage) {
        case 0:
            if (line.trim().length !== 0) {
                context.crateDefinitions.push(line);
            } else {
                context.buildStacks();
            }
            break;
        case 1:
            if (line.trim().length !== 0) {
                context.moveStacks(...line.match(/\d+/g).map(v=>parseInt(v)));
            }
            break;
        default:
            console.warn('unexpected stage: ', context.stage);
            break;
    }
}


class Context {
    constructor() {
        this.stage = 0;
        this.crateDefinitions = new Array();
        this.crateStacks;
    }

    buildStacks() {
        const stacks = this.crateDefinitions.pop().trim().split(/ +/).length;
        this.crateStacks = new Array();
        for (var stack = 0; stack < stacks; stack++) {
            this.crateStacks.push(new Array());
        }

        var crateLayer;
        while(crateLayer = this.crateDefinitions.pop()) {
            for (var stack = 0; stack < stacks; stack++) {
                const crate = crateLayer[stack * 4 + 1];
                if (crate !== ' ') {
                    this.crateStacks[stack].push(crate);
                }
            }
        }
        this.stage++;
    }

    moveStacks(crates, fromStack, toStack) {
        for (;crates > 0; crates--) {
            this.crateStacks[toStack - 1].push(this.crateStacks[fromStack - 1].pop());
        }
    }
}

class Context9001 extends Context {
    moveStacks(crates, fromStack, toStack) {
        const toMove = this.crateStacks[fromStack - 1].splice(-crates, crates);
        this.crateStacks[toStack - 1].push(...toMove);
    }
}


function readLines(readstream, context, readcallback, donecallback) {  
    readstream.on('data', (chunk) => {
        readcallback(chunk, context);
    }).on('line', (line) => {
        readcallback(line, context);
    }).on('end', () => {
        console.log('Nothing more to see!');
        if (donecallback !== undefined)
            donecallback(context);
    }).on('close', () => {
        if (donecallback !== undefined)
            donecallback(context);
    });
}

const strm = require('node:readline').createInterface({
    input: processModule.stdin
});

readLines(strm, 
    processModule.argv.length === 2? new Context() : new Context9001(), 
    processLine, ctx => { 
        console.log(ctx.crateStacks.reduce((tops, stack)=>tops + stack[stack.length-1],'top stacks: '));
        console.log();
    });
