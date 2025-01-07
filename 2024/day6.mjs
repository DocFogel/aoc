class Vulnerability {
    constructor(obstacle, sidetrack) {
        this.obstacle = obstacle;
        this.leadOut = Array.from(sidetrack.keys()).filter(k => sidetrack.get(k) === 1).map(s => Stretch.fromString(s));
        this.loop = Array.from(sidetrack.keys()).filter(k => sidetrack.get(k) > 1).map(s => Stretch.fromString(s));
    }
}

class Stretch {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    static fromString(str) {
        let [start, end] = str.split("->");
        let [sx, sy] = start.match(/\d+/g);
        let [ex, ey] = end.match(/\d+/g);
        return new Stretch({ x: parseInt(sx), y: parseInt(sy) }, { x: parseInt(ex), y: parseInt(ey) });
    }

    get direction() {
        if (this.start.x === this.end.x) {
            if (this.start.y === this.end.y) {
                return this.start.direction;
            }
            return this.start.y > this.end.y ? 1 : 3;
        } 
        return this.start.x > this.end.x ? 0 : 2;
    }

    get length() {
        if (this.direction % 2 === 0) {
            return Math.abs(this.end.x - this.start.x);
        }
        return Math.abs(this.end.y - this.start.y);
    }

    toString() {   
        return `(${this.start.x},${this.start.y})->(${this.end.x},${this.end.y})`;
    }
    
    *stretchPoints() {
        const step = this.unitStep;
        for (let i = 0; i < this.length; i++) {
            yield { x: this.start.x + i * step.x, y: this.start.y + i * step.y };
        }
    }

    get unitStep() {
        let unitStep;
        switch (this.direction) {
            case 0:
                unitStep = { x: -1, y: 0 };
                break;
            case 1:
                unitStep = { x: 0, y: -1 };
                break;
            case 2:
                unitStep = { x: 1, y: 0 };
                break;
            case 3:
                unitStep = { x: 0, y: 1 };
                break;
        };
        return unitStep;
    }

    crossing(stretch) {
        if (this.direction % 2 === stretch.direction % 2) {
            // both stretches are horizontal or vertical, they can't cross
            return null;
        }
        if (this.start.x === stretch.end.x && this.start.y === stretch.end.y) {
            // stretch ending on this's start does not cross
            return null;
        }
        if (this.direction % 2 === 0
            && Math.min(this.start.x, this.end.x) <= stretch.start.x && Math.max(this.start.x, this.end.x) >= stretch.start.x
            && Math.min(stretch.start.y, stretch.end.y) <= this.start.y && Math.max(stretch.start.y, stretch.end.y) >= this.start.y) {
            // this stretch is horizontal and crossing
            return { x: stretch.start.x, y: this.start.y };
        } else if (this.direction % 2 !== 0
            && Math.min(stretch.start.x, stretch.end.x) <= this.start.x && Math.max(stretch.start.x, stretch.end.x) >= this.start.x
            && Math.min(this.start.y, this.end.y) <= stretch.start.y && Math.max(this.start.y, this.end.y) >= stretch.start.y) {
            // this stretch is vertical and crossing
            return { x: this.start.x, y: stretch.start.y };
        }

        // stretches are not crossing
        return null;
    }

    onStretch(point) {
        if (this.direction % 2 === 0) {
            return point.y === this.start.y
            && point.x >= Math.min(this.start.x, this.end.x)
            && point.x <= Math.max(this.start.x, this.end.x);
        }
        return point.x === this.start.x
            && point.y >= Math.min(this.start.y, this.end.y)
            && point.y <= Math.max(this.start.y, this.end.y);
    }
}

class Guard {
    constructor(room) {
        this.room = room;
        this.position = { ...room.start };
        this.totalCrosses = 0;
        this.walkedStretches = [];
        this.vulnerableCells = [];
    }

    testForLoops(thisStretch) {
        let sidetrackDirection = this.turnRight(thisStretch.direction);
        const vulnerabilities = [];

        for (let p of thisStretch.stretchPoints()) {
            p.direction = sidetrackDirection;
            const simulatedObstacle = this.getNextTo(p, this.turnRight(sidetrackDirection))
            if (!this.walkedStretches.some(walked => walked.onStretch(simulatedObstacle))) {
                // simulated obstacle is not on any walked stretch, so this is not a treaded path
                this.room.simulateObstacle(simulatedObstacle);
                let sidetrack = new Map();
                let start = p;
                while (!this.room.ob(start)) {
                    let destination = this.getNextTo(this.room.findObstacle(start), start.direction);
                    let stretch = new Stretch(start, destination);
                    if (sidetrack.has(stretch.toString())) {
                        sidetrack.set(stretch.toString(), sidetrack.get(stretch.toString()) + 1);
                        if (sidetrack.get(stretch.toString()) >= 3) {
                            vulnerabilities.push(new Vulnerability(simulatedObstacle, sidetrack));
                            break;
                        }
                    } else {
                        sidetrack.set(stretch.toString(), 1);
                    }
                    start = { ...destination, direction: this.turnRight(stretch.direction) };
                }
            }
        }

        this.room.simulateObstacle(null);
        return vulnerabilities;
    }

    walkFrom(start) {
        while (!this.room.ob(start)) {
            const destination = this.getNextTo(this.room.findObstacle(start), start.direction);
            let thisStretch = new Stretch(start, destination);
            this.totalCrosses += this.walkedStretches.filter(walked => thisStretch.crossing(walked) != null).length;
            this.vulnerableCells.push(...this.testForLoops(thisStretch));
            
            this.walkedStretches.push(thisStretch);

            start = { ...destination, direction: this.turnRight(thisStretch.direction) };
        }
    }

    turnRight(direction) {
        return (direction + 1) % 4;
    }

    getNextTo(obstacle, direction) {
        switch (direction) {
            case 0:
                return { x: obstacle.x + 1, y: obstacle.y, direction: direction };
            case 1:
                return { x: obstacle.x, y: obstacle.y + 1, direction: direction };
            case 2:
                return { x: obstacle.x - 1, y: obstacle.y, direction: direction };
            case 3:
                return { x: obstacle.x, y: obstacle.y - 1, direction: direction };
        }
    }
}

var Context = class {
    Directions = "<^>v";

    constructor() {
        this.dimensions = { x: 0, y: 0 };
        this.obstacles = [];
        this.start;
        this.extraObstacle = false;
    }

    simulateObstacle(point) {
        if (this.extraObstacle) {
            this.obstacles.pop();
            this.extraObstacle = false;
        }
        if (point !== null) {
            this.obstacles.push(point);
            this.extraObstacle = true;
        } 
    }

    onLine(line) {
        if (line === "") {
            return;
        }
        let match = line.match(`[${this.Directions}]`);
        if (match) {
            this.start = {
                x: match.index,
                y: this.dimensions.y,
                direction: this.Directions.indexOf(match[0])
            };
        }

        if (this.dimensions.y === 0) {
            this.dimensions.x = line.length;
        }
        const obstacles = line.matchAll(/[#]/g);
        for (const obstacle of obstacles) {
            this.obstacles.push({
                x: obstacle.index,
                y: this.dimensions.y
            });
        }
        this.dimensions.y++;
    }

    findObstacle(position) {
        switch (position.direction) {
            case 0:
                return this.obstacles.filter(o => o.x < position.x && o.y === position.y).sort((a, b) => b.x - a.x).at(0)
                    ?? { x: -1, y: position.y, direction: position.direction };
            case 1:
                return this.obstacles.filter(o => o.y < position.y && o.x === position.x).sort((a, b) => b.y - a.y).at(0)
                    ?? { x: position.x, y: -1, direction: position.direction };
            case 2:
                return this.obstacles.filter(o => o.x > position.x && o.y === position.y).sort((a, b) => b.x - a.x).at(-1)
                    ?? { x: this.dimensions.x, y: position.y, direction: position.direction };
            case 3:
                return this.obstacles.filter(o => o.y > position.y && o.x === position.x).sort((a, b) => b.y - a.y).at(-1)
                    ?? { x: position.x, y: this.dimensions.y, direction: position.direction };
        }
    }

    ob(point) { 
        return point.x <= 0 
            || point.x >= this.dimensions.x - 1 
            || point.y <= 0 
            || point.y >= this.dimensions.y - 1;
    }
}

export { Context, Guard, Stretch };