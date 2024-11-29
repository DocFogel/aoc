class Folder {
    constructor(name) {
        this.name = name;
        this.folders = new Array();
        this.files = new Array();
    }

    addFolder(name) {
        const newFolder = new Folder(name)
        this.folders.push(newFolder);
        return newFolder;
    }

    addFile(fileName, fileSize) {
        this.files.push({name: fileName, size: fileSize});
    }

    getSize() {
        return this.files.reduce((t, f) => t + f.size, 0);
    }
}

class Context {
    constructor() {
        this.rootNode = null;
        this.currentFolder = null;
        this.parents = new Array();
        this.directorySizes = new Array();

    }

    onLine(line) {
        if (line.startsWith('$ cd ..')) {
            this.currentFolder = this.parents.pop();
        } else if (line.startsWith('$ cd /')) {
            this.rootNode = new Folder('root');
            this.currentFolder = this.rootNode;
            this.parents.push(this.rootNode);
        } else if (line.startsWith('$ cd')) {
            const newFolder = this.currentFolder.addFolder(line.substring(5));
            this.parents.push(this.currentFolder);
            this.currentFolder = newFolder;
        } else if (/^\d+/.test(line)) {
            const [ sizeStr, name ] = line.split(' ');
            this.currentFolder.addFile(name, parseInt(sizeStr));
        }
    }

    onClose() {
        const rootsize = this.walkFolders(this.rootNode);
        const reclaimSize = rootsize - (70000000 - 30000000);
        const smallFolderTotal = this.directorySizes
            .filter(s => s < 100000)
            .reduce((t, s) => t + s);
        const deleteCandidates = this.directorySizes
            .filter(s => s > reclaimSize);
        const smallestToDelete = Math.min(...deleteCandidates);

        console.log('Sum om small folders:', smallFolderTotal);
        console.log('Smallest to delete: ', smallestToDelete);
    }

    walkFolders(folder, basepath = '') {
        var totalSize = folder.getSize();
        const folderPath = basepath + '/' + folder.name;
        for (const f of folder.folders) {
            const childSize = this.walkFolders(f, folderPath);
            this.directorySizes.push(childSize);
            totalSize += childSize;
        }
        return totalSize;
    }
}

const strm = require('node:readline').createInterface({
    input: require('node:process').stdin
});
const readLines = require('../readstream').readContent;
readLines(strm, 
    new Context());
