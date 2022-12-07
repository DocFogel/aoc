const processModule = require('node:process');

function processLine(line, context) {
    const overlap = areOverlapping(parseRanges(line));
    context.push(overlap);
}

function parseRanges(line) {
    return line.split(',').map(r=>r.split('-').map(c=>parseInt(c)));
}

function areOverlapping(ranges) {
    if ((ranges[0][0] <= ranges[1][0] && ranges[0][1] >= ranges[1][1]) ||
        (ranges[0][0] >= ranges[1][0] && ranges[0][1] <= ranges[1][1])) {
        return 2;
    }

    if ((ranges[0][0] < ranges[1][0] && ranges[0][1] >= ranges[1][0] && ranges[0][1] < ranges[1][1]) ||
        (ranges[1][0] < ranges[0][0] && ranges[1][1] >= ranges[0][0] && ranges[1][1] < ranges[0][1])) {
        return 1;
    }
    return 0;
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

readLines(strm, new Array(), processLine, ctx => { 
    console.log("Overallocated elves: ", ctx.filter(v=>v === 2).length);
    console.log("Overlapping allocations: ", ctx.filter(v=> v !== 0).length);
});
