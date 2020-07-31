const glob = require('glob');

module.exports = (path) => {
    path = path || process.cwd(); // Use either the provided path OR the current working dir of the command line.

    return glob.sync('**/*', {
        cwd: path
    }); // Return a list of all files in the current working directory and it's children.
}