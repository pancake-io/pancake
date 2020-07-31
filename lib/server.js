const express = require('express');
const path = require('path');
const fs = require('fs');
const allFiles = require('./allFiles')

let getIgnorePatterns = (path) => {

}

module.exports = (src, port) => {
    // Set defaults
    src = src || process.cwd();
    port = port || 80;

    if (!path.isAbsolute(src))
        src = path.join(process.cwd(src));

    // Check if any files have been modified once every .5 seconds.
    setInterval(() => {
        
    }, 500)
}