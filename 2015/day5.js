const processModule = require('node:process');

function processLine(line, context) {
    const threeVowels = /([aeiou][^aeiou]*){3,}/;
    const doubleChar = /(.)\1/;
    const forbidden = /ab|cd|pq|xy/;
    if (threeVowels.test(line) &&
        doubleChar.test(line) &&
        !forbidden.test(line))
        context.lines++;
}

function newRules(line, context) {
    const doubleGroups = /(\w\w).*\1/;
    const wow = /(.).\1/;
    if (doubleGroups.test(line) &&
        wow.test(line))
        context.lines++;
}

var context = { lines: 0 };

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

var rules_to_use = processModule.argv.length === 2 ? processLine : newRules;

readLines(strm, context, rules_to_use, ctx => console.log(ctx.lines, "lines are nice"));