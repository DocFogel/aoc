export class Transformer {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.transformations = [];
    }

    /**
     * Adds a transformation condition to the transformer.
     *
     * @param {number} base - The starting point of the transformation range.
     * @param {number} range - The length of the transformation range.
     * @param {number} offset - The offset to apply within the transformation range.
     */
    addCondition(base, range, offset) {
        // Insert in sorted order by base
        const newCondition = { base, end: base + range - 1, offset };
        const insertionIndex = this.transformations.findIndex(t => t.base > newCondition.base);
        if (insertionIndex === -1) {
            // no condition that starts after this one
            this.transformations.push(newCondition);
        } else {
            this.transformations.splice(insertionIndex, 0, newCondition);
        }
    }

    transform(value) {
        let condition = this.transformations.find(t => value >= t.base && value <= t.end);
        if (condition) {
            return value + condition.offset;
        }
        return value;
    }
}

function isCovering(range1, range2) {
    return range1.start <= range2.start && range1.end >= range2.end;
}

function isOverlapping(range1, range2) {
    return isCovering(range1, range2)                                   // range1 completely covers range2
        || (range1.start >= range2.start && range1.start <= range2.end) // range1 starts within range2
        || (range1.end >= range2.start && range1.end <= range2.end);    // range1 ends within range2
}

export class RangeOfInterest {
    constructor() {
        this.ranges = [];
        this.length = 0;
    }
    addRange(start, end) {
        // Sanitize input
        if (end < start) {
            throw new Error("End of range must be greater than or equal to start");
        }
        const newRange = {start, end};
        // Check for overlapping ranges and issue a warning if found
        if (this.isOverlapping(newRange)) {
            console.warn("Warning: Adding an overlapping range:", newRange, "to existing ranges:", this.ranges);
            console.warn("The length property may be inaccurate.");
        }
        this.length += end - start + 1;
        this.ranges.push(newRange);
    }

    isTouching(range) {
        return this.ranges.some(r => r.start - 1 === range.end || r.end + 1 === range.start);
    }

    isOverlapping(range) {
        return this.ranges.some(r => isOverlapping(r, range));
    }

    /**
     * Splits the range of interest into consecutive subranges based off the given ranges.
     * Ranges that overlap the ROI are cut at the ROI boundaries.
     * Ranges that do not overlap the ROI are ignored.
     * Overlapping ranges within the parameter should be avoided - unpredictable results.
     * Gaps in the parameter ranges will create corresponding subranges in the output.
     * Example: 
     *  ROI:       [************] [*****] [****]  [*]  [*]
     *  Ranges:  [----][--]   [-----][--] [-]    [---]
     *  Result:    [==][==][=][=] [=][==] [=][=]  [=]  [=]
     *
     * @param ranges: Array<{start: number, end: number}> - Array of ranges with start and end properties.
     * @returns Array<{start: number, end: number}> - Array of subranges within the ROI.
     */
    subranges(ranges) {
        const result = [];

        for (const range of this.ranges) {
            const overlaps = ranges.filter(r => isOverlapping(r, range));
            const rangeResult = [];
            if (overlaps.length > 0) {
                // If there are overlapping subranges, we need to split this range
                let lastEnd = null;
                for (const overlap of overlaps) {
                    if (lastEnd === null && overlap.start > range.start) {
                        // This is the first overlap and it starts after the range - add the leading part
                        rangeResult.push({ start: range.start, end: overlap.start - 1 });
                    } else if (lastEnd !== null && overlap.start > lastEnd + 1) {
                        // There is a gap between the last overlap and this one - fill the gap
                        rangeResult.push({ start: lastEnd + 1, end: overlap.start - 1 });
                    }
                    if (isCovering(overlap, range)) {
                        // The overlap completely covers the range, so the whole range is included as is
                        rangeResult.push({ start: range.start, end: range.end });
                    } else {
                        // Split the subrange at the boundaries of the new range
                        rangeResult.push({ start: Math.max(range.start, overlap.start), end: Math.min(range.end, overlap.end) });
                    }
                    lastEnd = overlap.end;
                }
                // If the last overlap ends before the range, add the trailing part
                if (lastEnd < range.end) {
                    rangeResult.push({ start: lastEnd + 1, end: range.end });
                }
            } else {
                // No overlapping subranges, keep the original range
                rangeResult.push(range);
            }
            result.push(...rangeResult);
        }

        return result;
    }
}    

export class Part1Solution {
    constructor(seedline) {
        this.seeds = seedline.split(" ").slice(1).map(n => parseInt(n));
        this.transformer = null;
    }

    onMapStart(from, to) {
        this.transformer = new Transformer(from, to);
    }

    onRangeLine(line) {
        const [destination_start, source_start, range] = line.split(" ").map(n => parseInt(n));
        this.transformer.addCondition(source_start, range, destination_start - source_start);
    }

    onMapEnd() {
        if (this.transformer !== null) {
            this.seeds = this.seeds.map(s => this.transformer.transform(s));
            console.log("Transformed seeds:", this.seeds);
        }
        this.transformer = null;
    }

    report() {
        console.log("The lowest seed value is " + Math.min(...this.seeds));
    }
}

export class Part2Solution {
    constructor(rangeline) {
        this.roi = new RangeOfInterest();
        const values = rangeline.split(" ").slice(1).map(n => parseInt(n));
        for (let i = 0; i < values.length; i += 2) {

            this.roi.addRange(values[i], values[i] + values[i + 1] - 1);
        }
        this.transformer = null;
    }

    onMapStart(from, to) {
        this.transformer = new Transformer(from, to);
    }

    onRangeLine(line) {
        const [destination_start, source_start, range] = line.split(" ").map(n => parseInt(n));
        this.transformer.addCondition(source_start, range, destination_start - source_start);
    }

    onMapEnd() {
        // Get the subranges of the transformers conditions that fall within the ROI and transform those ranges into the new ROI
        if (this.transformer !== null) {
            const subranges = this.roi.subranges(this.transformer.transformations.map(t => ({ start: t.base, end: t.end })));
            let newRoi = new RangeOfInterest();
            for (const sr of subranges) {
                newRoi.addRange(
                    this.transformer.transform(sr.start), 
                    this.transformer.transform(sr.end)
                );
            }
            this.roi = newRoi;
            console.log("Transformations: ", this.transformer.transformations);
            console.log("Transformed ranges:", this.roi.ranges, "total length:", this.roi.length);
        }
        this.transformer = null;
    }

    report() {
        console.log("The lowest range starts at", this.roi.ranges.reduce((min, r) => min != null && min < r.start ? min : r.start, null));
    }
}

export class Context {
    constructor() {
        this.state = "seeds";
        this.p1 = null;
        this.p2 = null;
    }

    onLine(line) {
        line = line.trim();
        if (this.state === "seeds") {
            if (line === "") {
                this.state = "transforming";
            } else if (line.match(/^seeds:((\s+[0-9]+){2,})$/)) {
                this.p1 = new Part1Solution(line);
                this.p2 = new Part2Solution(line);
            }
        } else if (this.state === "transforming") {
            if (line === "") {
                this.p1.onMapEnd();
                this.p2.onMapEnd(); 
                return;
            }
            let match = line.match(/(?<from>\w+)-(?<to>\w+) map:/);
            if (match) {
                const { from, to } = match.groups;
                this.p1.onMapStart(from, to);
                this.p2.onMapStart(from, to);
            }
            match = line.match(/^\d+\s+\d+\s+\d+$/);
            if (match) {
                const [destination_start, source_start, range] = match[0].split(" ").map(n => parseInt(n));
                this.p1.onRangeLine(line);
                this.p2.onRangeLine(line);
            }
        }
    }

    onClose() {
        if (this.state === "transforming") {
            this.p1.onMapEnd();
            this.p2.onMapEnd();
        }
        this.p1.report();
        this.p2.report();
    }
}