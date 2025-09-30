export class Context {
    constructor() {
        this.keys = [];
        this.locks = [];
        this.currentObject = null;
    }

    onLine(line) {
        // if line is empty reset currentObject
        line = line.trim();
        if (line === "") {
            this.currentObject = null;
            return;
        } else if (this.currentObject === null) {
            // create a new object
            this.currentObject = [0, 0, 0, 0, 0];

            // if line starts with "#" it's a lock
            if (line.startsWith("#")) {
                this.locks.push(this.currentObject);
            } else {
                this.keys.push(this.currentObject);
            }
        }
        Array.from(line).forEach((e, i) => {
            this.currentObject[i] += e === '#' ? 1 : 0;
        });
    }

    onClose() {
        console.log("Keys:", this.keys);
        console.log("Locks:", this.locks);
        // count how many keys may open locks
        console.log("Count:", this.locks.reduce((lockOpenings, lock) => {
            return lockOpenings + this.keys.reduce((keyOpenings, key) => {
                if (key.every((v, i) => v + lock[i] < 8)) {
                    console.log("Key", key, "opens lock", lock);
                    return keyOpenings + 1;
                }
                return keyOpenings;
                // return keyOpenings + (key.every((v, i) => v + lock[i] < 8) ? 1 : 0);
            }, 0);
        }, 0));
    }
}