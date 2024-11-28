function readContent(readstream, context) {  
    readstream.on('data', (chunk) => {
      if (context.onData != undefined)
        context.onData(chunk);
    }).on('line', (line) => {
      if (context.onLine != undefined)
        context.onLine(line);
    }).on('end', () => {
        if (context.onEnd != undefined)
            context.onEnd();
    }).on('close', () => {
        if (context.onClose != undefined)
            context.onClose();
    });
}

module.exports.readContent = readContent;
