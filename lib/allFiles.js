const glob = require('glob');

module.exports = () => {
    return glob.sync('**/*'); // Return a list of all files in the current working directory and it's children.
}