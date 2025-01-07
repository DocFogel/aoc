import { stdin, argv } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from "../readstream.js";
import { Context, Guard, Stretch } from "./day6.mjs";

const strm = createInterface({
    input: stdin
});

function walk() {
    const guard = new Guard(ctx);
    const start = guard.position;
    guard.walkFrom(start);
    console.log("Guard walked", guard.walkedStretches.reduce((t, s) => t + s.length, 1) - guard.totalCrosses, "cells with", guard.totalCrosses, "overlaps");
    console.log("Found", guard.vulnerableCells.length, "vulnerable points");
    console.log("Removing duplicates...");
    const unique = [...new Set(guard.vulnerableCells.map(v => v.obstacle.x + "," + v.obstacle.y))];
    console.log("Unique vulnerable points:", unique.length);
}

const ctx = new Context();
ctx.onClose = walk;

readContent(strm, ctx);
