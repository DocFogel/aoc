const processModule = require('node:process');

const gridSize = 1000;

function processLine(line, context) {
    const square = line.match(/\d+/g).map(v=>parseInt(v));
    var op = null;
    if (line.startsWith('toggle')) 
        op = toggle;
    if (line.startsWith('turn on'))
        op = on;
    if (line.startsWith('turn off'))
        op = off;
    
    if (op != null)
        touchGrid(context, op, square);
}

function touchGrid(context, op, square) {
    const [x0, y0, x1, y1] = square;
    for (var y = y0; y <= y1; y++) {
        const touchedLights = context[y].slice(x0,x1+1).map(op);
        context[y].splice(
            x0,
            touchedLights.length,
            ...touchedLights);
    }
}

const on = (current) => current + 1;
const off = (current) => current > 0 ? current - 1 : 0;
const toggle = (current) => current + 2;

var context = Array(gridSize);
for (var i = 0; i < context.length; i++) {
    context[i] = Array(gridSize).fill(0);
}

function readLines(readstream, context, readcallback, donecallback) {  
    readstream.on('data', (chunk) => {
        readcallback(chunk, context);
    }).on('line', (line) => {
        readcallback(line, context);
    }).on('end', () => {
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

readLines(strm, context, processLine, ctx => console.log(ctx.map(row => row.reduce((sum, val) => sum + val)).reduce((tot, sum) => tot + sum), 'lights are set'));
