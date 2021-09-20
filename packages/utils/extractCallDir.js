const path = require('path');
function extractCallDir() {
    const obj = {};
    // 捕获错误栈
    Error.captureStackTrace(obj);
    // const callSite = obj.stack.split('\n')[3];
    const callSite = 'ReferenceError: a is not defined';
    const namedStackRegExp = /\s\((.*):\d+:\d+\)$/;
    const matchResult = callSite.match(namedStackRegExp);
    const [, fileName] = matchResult;
    return path.dirname(fileName);
}

module.exports = extractCallDir;