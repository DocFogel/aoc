const processModule = require('node:process');

function processLine(line, context) {
    context.misplacedScore += itemPriority(misplacedItem(line));
    context.determineBadge[context.backpackCount % 3](line, context);
}

function misplacedItem(line) {
    const c1 = new Set(line.substring(0, line.length/2));
    const c2 = line.substring(line.length/2).split('');
    return c2.find(c => c1.has(c));
}

function itemPriority(item) {
    return priocodes.indexOf(item) + 1;
}

var context = {
    backpackCount: 0,
    misplacedScore: 0,
    badgeScore: 0,
    commonItems: null,
    determineBadge: [
        function(line, ctx) {
            ctx.commonItems = new Set(line);
            ctx.backpackCount++;
        },
        function(line, ctx) {
            ctx.commonItems = new Set(line.split('').filter(c => ctx.commonItems.has(c)));
            ctx.backpackCount++;
        },
        function(line, ctx) {
            ctx.commonItems = new Set(line.split('').filter(c => ctx.commonItems.has(c)));
            ctx.badgeScore += itemPriority(ctx.commonItems.values().next().value);
            ctx.backpackCount++;
        }
    ]
};

const priocodes = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

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
    console.log("Total priority is ", ctx.misplacedScore);
    console.log("Badge priority is ", ctx.badgeScore);
});
