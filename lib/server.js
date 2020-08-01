const express = require('express');
const path = require('path');
const fs = require('fs');
const allFiles = require('./allFiles');
const ignore = require('./ignore');
const hljs = require('highlight.js');
const eta = require('eta');

let getIgnorePatterns = (readPath) => {
    let aignorePath = path.join(readPath, '.pancakeignore');

    if (fs.existsSync(aignorePath)) {
        let fileContents = fs.readFileSync(aignorePath).toString();
        let entries = fileContents.split('\n');

        return entries.map(String.prototype.trim);
    } else
        return [];
}

let getFiles = (readPath) => {
    return ignore(allFiles(readPath), getIgnorePatterns(readPath));
}

let generatePage = (fp, cp) => {
    if (fs.statSync(fp).isFile()) {
        eta.templates.define('contents', () => {
            return '<pre>' + hljs.highlightAuto(fs.readFileSync(fp).toString()).value + '</pre>';
        });
        //eta.compile(hljs.highlightAuto(fs.readFileSync(fp).toString()/*.replace(/\n/g, '<br>')*/).value
        return eta.render(fs.readFileSync(path.join(__dirname, '../template.html')).toString(), {
            isFile: true,
            contents: '<pre>' + hljs.highlightAuto(fs.readFileSync(fp).toString()).value.replace(/\n/g, '\<br\>') + '</pre>'
        });
    } else if (fs.statSync(fp).isDirectory()) {
        let files = fs.readdirSync(fp)
        let contents = {};

        files.forEach(filename => {
            if (fs.statSync(path.join(fp, filename)).isDirectory()) {
                contents[path.basename(filename) + '/'] = '/pancake/' + path.join(cp, filename) + '/';
            } else {
                contents[path.basename(filename)] = '/pancake/' + path.join(cp, filename) + '/';
            }
        });
        console.log(contents);

        return eta.render(fs.readFileSync(path.join(__dirname, '../template.html')).toString(), {
            isFile: false,
            contents
        });
    }
}

module.exports = (src, port) => {
    // Set defaults
    src = src === undefined ? src : process.cwd();
    port = port === undefined ? port : 80;

    let files = getFiles(src);

    if (!path.isAbsolute(src))
        src = path.join(process.cwd(src));

    // Check if any files have been modified once every .5 seconds.

    fs.watch(src, {recursive: true}, (event) => {
        //console.log(event, "MODIFIED")
        files = getFiles(src);
    });

    // Run server.
    let app = express();
    let pancake = express.Router();
    
    pancake.get('*', function(req, res) {
        let output = '';
        let rpath = req.path;
        console.log(`Inbound request at '${path}'; ${new Date().toUTCString()}; IP: ${req.ip}`);

        let subPath = rpath.split('/').slice(1).join('/'); // Remove the first segment (/pancake)
        let data = generatePage(path.join(src, subPath), subPath)
        console.log(data);
        res.send(data);
    });

    app.use('/pancake', pancake);
    app.listen(port, () => {
        console.log(`Started Pancake server at port http://localhost:${port}/pancake`);
    });
}

module.exports(process.cwd(), process.env.PORT);