const processModule = require('node:process');

function processLine(line, context) {
    if (line === "") {
        context.all.push(context.current);
        context.current = 0;
    } else {
        context.current += parseInt(line);
    }
}

var context = {
    all: [],
    current: 0
};

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

readLines(strm, context, processLine, ctx => { 
    processLine("", ctx); 
    ctx.all.sort((a, b) => b - a);
    console.log(ctx.all.slice(0, 3).reduce((s, c) => s + c), " is the sum of the top 3 scores");
});
