const allFiles = require('./lib/allFiles');
const ignore = require('./lib/ignore');

console.log(ignore(allFiles(), ["node_modules", "node_modules/**/*"]));