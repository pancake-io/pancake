const glob = require('glob');

module.exports = (path) => {
    path = path || process.cwd();

    return glob.sync('**/*', {
        cwd: path
    }); // Return a list of all files in the current working directory and it's children.
}