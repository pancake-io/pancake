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
    console.log("GENERATING PAGE", fp, cp);
    if (fs.statSync(fp).isFile()) {
        eta.templates.define('contents', () => {
            return '<pre>' + hljs.highlightAuto(fs.readFileSync(fp).toString()).value + '</pre>';
        });
        //eta.compile(hljs.highlightAuto(fs.readFileSync(fp).toString()/*.replace(/\n/g, '<br>')*/).value
        return eta.render(fs.readFileSync(path.join(__dirname, '../template.html')).toString(), {
            isFile: true,
        });
    }
    if (fs.statSync(fp).isDirectory()) {
        let files = fs.readdirSync(fp)
        let contents = {};

        files.forEach(filename => {
            try {
                if (fs.statSync(path.join(fp, filename)).isDirectory()) {
                    contents[path.basename(filename) + '/'] = '/pancake/' + path.join(cp, filename) + '/';
                } else {
                    contents[path.basename(filename)] = '/pancake/' + path.join(cp, filename) + '/';
                }
            } catch(e) {
                console.warn(`Potential bug, error accessing file '${path.join(fp, filename)}'.`)
            }
        });
        //console.log(contents);

        return eta.render(fs.readFileSync(path.join(__dirname, '../template.html')).toString(), {
            isFile: false,
            contents
        });
    }
}

module.exports = (src, port) => {
    console.log(process.cwd()); // debug log the current working dir

    if (!path.isAbsolute(src))
        src = path.join(process.cwd(src));

    // Run server.
    let app = express();
    let pancake = express.Router();
    
    pancake.get('*', function(req, res) {
        let output = '';
        let rpath = req.path;

        if (rpath[-1] == '/') {
            rpath = rpath.substr(0, -1);
        }

        console.log(`Inbound request at '${rpath}'; ${new Date().toUTCString()}; IP: ${req.ip}`);

        let subPath = rpath.split('/').slice(1).filter(Boolean).join('/'); // Remove the first segment (/pancake)
        let data = generatePage(path.join(src, subPath), subPath)
        res.send(data);
    });

    app.use('/pancake', pancake);
    app.listen(port, () => {
        console.log(`Started Pancake server at port http://localhost:${port}/pancake`);
    });
}