var fs = require('fs');
var readline = require('readline');

var requiredWrapping = [];

function estimatePaper(box) {
    const sides = [ box[0]*box[1], box[0]*box[2], box[1]*box[2] ];
    return 2*sides.reduce((t,s)=>t+s) + Math.min(...sides);
};

function estimateRibbon(box) {
    const bow = box.reduce((t,s)=>t*s);
    return bow + box.slice(0,2).reduce((t,s)=>t+s)*2;
}

(function () {
    readline.createInterface({
        input: fs.createReadStream('day2.input.txt'),
        terminal: false
    }).on('line', function(line) {
        const box = line.split('x').map(side=>parseInt(side)).sort((a,b)=>a-b);
        requiredWrapping.push([ estimatePaper(box), estimateRibbon(box) ]);
    }).on('close', () => console.log(requiredWrapping.reduce((t,r)=>[ t[0]+r[0], t[1]+r[1] ])));
})();

