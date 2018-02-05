// Writes errors to stderr and to ./error.txt
require('./date.js')
const errorStream = require('fs').createWriteStream('./error.txt', {flags: 'a'})
const EOL = require('os').EOL
module.exports = function(...texts) {
    console.error(...texts)
    errorStream.write(new Date().full() + ' | ' + Array.prototype.join.call(arguments, ' ') + EOL)
}