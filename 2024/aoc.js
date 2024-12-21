import { stdin, argv } from 'node:process';
import { createInterface } from 'node:readline';
import pgk from "../readstream.js";
const readLines = pgk.readContent;
const strm = createInterface({
    input: stdin
});

//const readLines = require('../readstream').readContent;

// console.log("process arguments:", processModule.argv);
// console.log("argv0:", processModule.argv0);

// import { Context } from `./${processModule.argv[2]}.mjs`;
// var context = new Context();

import(`./${argv[2]}.mjs`)
    .then(module => {
       const context = new module.Context();
        context.on("origin", point => {
            console.log("starting point was found:", point);
        });
        context.on("walk", point => {
            console.log("walking:", point);
        });
        context.on("close", result => {
            console.log("result:", result);
        });

        readLines(strm,
            context);
    })
    .catch(err => {
        console.error(err);
    });
