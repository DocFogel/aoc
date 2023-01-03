class Cell {
  constructor(name) {
    this.name = name;
    this.setHeight(name);
    this.distance = undefined;
    if (name === 'S') this.setHeight('a');
    if (name === 'E') this.setHeight('z');
  }

  setHeight(height) {
    this.height = height.charCodeAt(0) - 'a'.charCodeAt(0);
  }

  isWithinReach(other) {
    return other.height <= this.height + 1;
  }

  claim(dist) {
    if (!this.isClaimed()) {
      this.distance = dist;
      return true;
    }
    return false;
  }

  isClaimed() {
    return this.distance != undefined;
  }

  toString() {
    return this.distance ? this.distance.toString() : this.name;
  }
}

class HeightMap {
  constructor() {
    this.grid = new Array();
    this.width = 0;
    this.height = 0;
    this.startIndex = null;
    this.endIndex = null;
  }

  addRow(row) {
    this.width = Math.max(this.width, row.length);
    this.grid.push(...row.map(h => new Cell(h)))
    if (this.startIndex == null) {
      let idx = row.findIndex(c => c === 'S');
      if (idx !== -1) {
        this.startIndex = this.toIndex([idx, this.height]);
      }
    }
    if (this.endIndex == null) {
      let idx = row.findIndex(c => c === 'E');
      if (idx !== -1) {
        this.endIndex = this.toIndex([idx, this.height]);
      }
    }
    this.height++;
  }

  *rows() {
    for (let i = 0; i < this.grid.length; i += this.width) {
      yield this.grid.slice(i, i + this.width);
    }
  }

  showMap() {
    for (const row of this.rows()) {
      console.log(row.map(c => c.toString()).join(', '));
    }
  }

  mapDistanceFrom(startIndexes) {
    let candidates = startIndexes.slice();
    let distance = 0;

    while (candidates.length !== 0) {
      candidates = this.claimAndGrowFromCells(candidates, distance);
      distance++;
    }
    return distance - 1;
  }

  claimAndGrowFromCells(candidates, distance) {
    let toClaim = Array.from(new Set(candidates));
    toClaim.forEach(i => this.grid[i].claim(distance));
    const newCandidates = new Set();
    toClaim.forEach(i => {
      this.candidatesFromCell(i).forEach(c => newCandidates.add(c));
    });
    return Array.from(newCandidates);
  }

  get endCell() {
    return this.grid[this.endIndex];
  }

  candidatesFromCell(index) {
    return this.neighborsOnMap(index)
      .filter(i => !this.grid[i].isClaimed())
      .filter(i => this.grid[index].isWithinReach(this.grid[i]));
  }

  toCoordinates(index) {
    return [index % this.width, Math.trunc(index / this.width)];
  }

  toIndex(coords) {
    return coords[0] + this.width * coords[1];
  }

  neighborsOnMap(index) {
    let [x, y] = this.toCoordinates(index);
    let neighbors = [];
    if (x - 1 >= 0) neighbors.push(index - 1);
    if (x + 1 < this.width) neighbors.push(index + 1);
    if (y - 1 >= 0) neighbors.push(index - this.width);
    if (y + 1 < this.height) neighbors.push(index + this.width);
    return neighbors;
  }
}
