function* numbers() {
    var i = 0;
    while (true) yield i++;
}

function md5(payload) {
    hash = require('node:crypto').createHash('MD5');
    hash.update(payload);
    return hash.digest('hex');
}

for (const i of numbers()) {
    if (md5(`iwrupvqb${i}`).startsWith('000000')) {
        console.log(i);
        break;
    }
}
