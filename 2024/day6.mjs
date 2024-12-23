class Stretch {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    get direction() {
        if (this.start.x === this.end.x) {
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
}

class Guard {
    constructor(room) {
        this.room = room;
        this.position = { ...room.start };
        this.totalCrosses = 0;
        this.walkedStretches = [];
        this.fullStretches = [];
        this.vulnerablePoints = [];
    }

    nextStretch() {
        if (this.exited) {
            return null;
        }
        let otherWay = (this.position + 2) % 2;

        const destination = this.getNextTo(this.room.findObstacle(this.position), this.position.direction);
        let thisStretch = new Stretch(this.position, destination);
        this.totalCrosses += this.walkedStretches.filter(walked => thisStretch.crossing(walked) != null).length;
        this.walkedStretches.push(thisStretch);
        let vulnerableCrossings = this.fullStretches
            .map(f_stretch => f_stretch.direction === this.turnRight(thisStretch.direction) ? thisStretch.crossing(f_stretch) : null)
            .filter(p => p !== null);
        this.vulnerablePoints.push(...vulnerableCrossings);

        this.fullStretches.push(
            new Stretch(
                this.getNextTo(this.room.findObstacle({ ...this.position, direction: otherWay}), otherWay),
                destination));
        this.position = destination;
        this.position.direction = this.turnRight(this.position.direction);
        return thisStretch;
    }

    turnRight(direction) {
        return (direction + 1) % 4;
    }

    get exited() {
        return this.position.x <= 0 || this.position.x >= this.room.dimensions.x - 1 || this.position.y <= 0 || this.position.y >= this.room.dimensions.y - 1;
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
}

export { Context, Guard, Stretch };