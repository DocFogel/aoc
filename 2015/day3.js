function address(pos) {
    return `${pos.x},${pos.y}`;
}

var santa = {x:0, y:0};
var robosanta = {...santa};
var santaMoves = true;
var visitedHouses = new Set();
visitedHouses.add(address(santa));

var moves = new Map();
moves.set('^', function (cp) { return { ...cp , y: cp.y + 1 }});
moves.set('v', function (cp) { return { ...cp , y: cp.y - 1 }});
moves.set('>', function (cp) { return { ...cp , x: cp.x + 1 }});
moves.set('<', function (cp) { return { ...cp , x: cp.x - 1 }});

function guideSanta(position, move) {
    const nexthouse = move(position);
    visitedHouses.add(address(nexthouse));
    return nexthouse;
}

(function () {
    require('node:process').stdin
    .on('data', (chunk) => {
        for (const instruction of chunk.toString('utf-8')) {
            if (!moves.has(instruction)) continue;
            if (santaMoves) {
                santa = guideSanta(santa, moves.get(instruction));
            } else {
                robosanta = guideSanta(robosanta, moves.get(instruction));
            }
            santaMoves = !santaMoves;
        }
    }).on('end', () => {
        console.log('Nothing more to see!');
        console.log(`Santa visited ${visitedHouses.size} houses`);
    });
})();

