'use strict';

var glob = require("glob"),
    fs = require("fs"),
    path = require("path"),
    _ = require("lodash/core"),
    stripBom = require("strip-bom"),
    template = require("mustache"),
    mkdirp = require('mkdirp'),
    utf8 = 'utf-8';


module.exports = {

    unixifyPath: function (filepath) {
        if (isWindows) {
            return filepath.replace(/\\/g, '/');
        } else {
            return filepath;
        }
    },

    MakeDirectory: function (target) {

        // if (!fs.existsSync(target)) {
        //     fs.mkdirSync(target);
        // }

        return mkdirp.sync(target);

    },

    copyFileSync: function (srcFile, destFile, override) {

        override = override || this.project.overwrite;

        if (!fs.existsSync(target) || override) {

            this.createFile(destFile, fs.readFileSync(srcFile, utf8), override);

        }
    },

    capitalizeFirstLetter: function (string) {

        if (!string || string === "") {
            return "";
        }

        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    makeSlug: function (src) {

        if (typeof src === "string") {

            return src.replace(/ +/g, "-")
                .replace(/\'/g, "")
                .replace(/[^\w-]+/g, "")
                .replace(/-+/g, "-")
                .toLowerCase();

        }

        return "";

    },

    createFile: function (target, body, override) {

        override = override || false;

        if (!fs.existsSync(target) || override) {

            this.MakeDirectory(path.dirname(target));

            fs.writeFileSync(target, body, utf8);
        }

    },

    generateFile: function (src, dest, data, override) {

        override = override || false;

        if (!fs.existsSync(dest) || override) {

            var content = fs.readFileSync(src, utf8);

            this.createFile(dest, template.render(content, data), override);

        }

    },

    parse: function (value) {

        if (!value) {
            return {};
        }

        if (typeof value === "string") {

            value = JSON.parse(value);

        }

        return value;

    },

    readJSON: function (src) {

        let body = fs.readFileSync(src, utf8);

        return JSON.parse(body);

    },

    //https://gist.githubusercontent.com/liangzan/807712/raw/1175dbe60b94cc9601c99a674a7f94d08e7421da/recursiveRemoveFiles.js
    // path should have trailing slash
    removeDirForce: function (dirPath) {

        fs.readdir(dirPath, function (err, files) {
            if (err) {
                console.log(JSON.stringify(err));
            } else {

                if (files.length === 0) {

                    fs.rmdir(dirPath, function (err) {

                        if (err) {
                            console.log(JSON.stringify(err));
                        } else {
                            var parentPath = path.normalize(dirPath + '/..') + '/';
                            if (parentPath != path.normalize(rootPath)) {
                                removeDirForce(parentPath);
                            }
                        }

                    });

                } else {

                    files.forEach(function (file) {

                        var filePath = dirPath + file;

                        fs.stat(filePath, function (err, stats) {

                            if (err) {
                                console.log(JSON.stringify(err));
                            } else {

                                if (stats.isFile()) {
                                    fs.unlink(filePath, function (err) {
                                        if (err) {
                                            console.log(JSON.stringify(err));
                                        }
                                    });
                                }

                                if (stats.isDirectory()) {
                                    removeDirForce(filePath + '/');
                                }
                            }
                        });
                    });
                }
            }
        });
    }

};