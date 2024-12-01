function adjacent(symbol, part) {
    // return true if symbol is within the bounding box of part
    //console.log(`checking part ${part} against symbol ${symbol}`)
    return symbol[0] >= part[1]
        && symbol[0] <= part[2]
        && symbol[1] >= part[3] - 1
        && symbol[1] <= part[3] + 1;
}

class Context {
    constructor() {
        this.symbols = [];
        this.parts = [];
        this.total = 0;
        this.currentLine = 0;
    }

    isPartNo(part) {
        return this.symbols.find(s => adjacent(s, part)) != undefined;
    }

    onLine(line) {
        // find symbols
        this.symbols = [ 
            ...this.symbols, 
            ...Array.from(line.matchAll(/[^.0-9]/g))
                .map(match => [ match.index, this.currentLine ])];

        // find partnumbers
        this.parts = [ 
            ...this.parts, 
            ...Array.from(line.matchAll(/[0-9]+/g))
                .map(match => [
                    parseInt(match[0]),
                    match.index -1,
                    match.index + match[0].length,
                    this.currentLine
                ])];


        // Sum up valid part numbers
        let validParts = this.parts
            .filter(part => this.isPartNo(part))
            .map(p => p[0]);
        console.log("Valid parts:", validParts);
        this.total = validParts
            .reduce(
                (sum, partNo) => sum + partNo,
                this.total);
        
        // Discard parts and symbols out of scope
        this.parts = this.parts.filter(part => !this.isPartNo(part) && part[3] === this.currentLine);
        this.symbols = this.symbols.filter(s => s[1] === this.currentLine);
        this.currentLine++;
    }

    onClose() {
        console.log(`Here's what we have: ${JSON.stringify(this)}`);
    }   
}

module.exports.Context = Context;