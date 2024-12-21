class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(...args));
        }
    }
};

var Context = class extends EventEmitter {
    Directions = "<^>v";

    constructor() {
        super();
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
            this.emit("origin", this.start);
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

    onClose() {
        this.emit("ready", { dimensions: this.dimensions, start: this.start, obstacles: this.obstacles });
    }

    walkTheGuard() {
        let guard = this.start;
        let obstacle = this.findObstacle(guard);
        console.log("Found first obstacle at", obstacle);
        while (obstacle) {
            guard = this.walkTo(obstacle, guard);
            guard.direction = this.turnRight(guard.direction);
            obstacle = this.findObstacle(guard);
        }
        guard = this.walkTo(this.findBorderFrom(guard), guard);
        this.emit("secured", guard);
    }

    findObstacle(position) {
        switch (position.direction) {
            case 0:
                return this.obstacles.filter(o => o.x < position.x && o.y === position.y).sort((a,b) => b.x - a.x).at(0);
            case 1:
                return this.obstacles.filter(o => o.y < position.y && o.x === position.x).sort((a, b) => b.y - a.y).at(0);
            case 2:
                return this.obstacles.filter(o => o.x > position.x && o.y === position.y).sort((a, b) => b.x - a.x).at(-1);
            case 3:
                return this.obstacles.filter(o => o.y > position.y && o.x === position.x).sort((a, b) => b.y - a.y).at(-1);            
        }
    }

    turnRight(direction) {
        return (direction + 1) % 4;
    }

    walkTo(obstacle, position) { 
        let dx = 0;
        let dy = 0;
        switch (position.direction) {
            case 0:
                dx = obstacle.x + 1 - position.x;
                break;
            case 1:
                dy = obstacle.y + 1 - position.y;
                break;
            case 2:
                dx = obstacle.x - 1 - position.x;
                break;
            case 3:
                dy = obstacle.y - 1 - position.y;
                break;
        }
        this.emit("walk", { dx, dy, position });
        return { x: position.x + dx, y: position.y + dy, direction: position.direction };
    }

    findBorderFrom(position) {
        switch (position.direction) {
            case 0:
                return { x: -1, y: position.y, direction: position.direction };
            case 1: 
                return { x: position.x, y: -1, direction: position.direction };
            case 2: 
                return { x: this.dimensions.x + 1, y: position.y, direction: position.direction };
            case 3: 
                return { x: position.x, y: this.dimensions.y, direction: position.direction };
        }
    }
}

export { Context };