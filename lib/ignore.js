const minimatch = require('minimatch');

/**
 * Remove any paths that match specified patterns.
 * @param {string[]} paths 
 * @param {string[]} matches 
 * @returns a list of paths that don't match any of the specified patterns.
 */
module.exports = (paths, matches) => {
    let newPaths = []; // List of paths that will be returned.

    paths.forEach(path => {
        let good = true; // Whether or not the current path doesn't match any of the patterns provided.
        matches.forEach(match => { // Loop through all of the patterns.
            let doesMatch = minimatch(path, match); // Check if the pattern matches.
            //console.log(doesMatch, match, path); - debug
            if (doesMatch)
                good = false; // Change good to false if the file matches one of the patterns.
        });

        if (good)
            newPaths.push(path); // If good is true, add the path to the newPaths array.
    });

    return newPaths;
}