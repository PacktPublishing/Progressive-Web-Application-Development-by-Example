var utils = require("./utils"),
fs = require("fs"),
path = require("path"),
glob = require("glob"),
ncp = require("ncp"),
template = require("mustache"),
stripBom = require("strip-bom"),
_ = require("lodash"),
appShell = "",
products = [],
utf8 = "utf-8";



/*

    app shell
    product template

*/
function loadPageTemplates() {
    
        appShell = fs.readFileSync("./cat-app-shell.html", utf8);
    
        var categoryTemplate = fs.readFileSync("./category.template.html", utf8);
    
        appShell = appShell.replace("product-html", categoryTemplate);
    
    }


