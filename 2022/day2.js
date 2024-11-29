const processModule = require('node:process');

function processLine(line, context) {
    if (scores.has(line)) 
        context.score += scores.get(line.trim());
}

const firstscores = new Map([
    ['A X', 3 + 1],
    ['A Y', 6 + 2],
    ['A Z', 0 + 3],
    ['B X', 0 + 1],
    ['B Y', 3 + 2],
    ['B Z', 6 + 3],
    ['C X', 6 + 1],
    ['C Y', 0 + 2],
    ['C Z', 3 + 3]
]);
const secondscores = new Map([
    ['A X', 0 + 3],
    ['A Y', 3 + 1],
    ['A Z', 6 + 2],
    ['B X', 0 + 1],
    ['B Y', 3 + 2],
    ['B Z', 6 + 3],
    ['C X', 0 + 2],
    ['C Y', 3 + 3],
    ['C Z', 6 + 1]
]);

var context = {
    score: 0
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

const scores = processModule.argv.length === 2 ? firstscores : secondscores;

readLines(strm, context, processLine, ctx => { 
    console.log("Your score is ", ctx.score);
});
