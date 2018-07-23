var utils = require("./utils"),
    path = require("path"),
    glob = require("glob"),
    fs = require("fs"),
    template = require("mustache"),
    urls = [],
    siteURLS = [],
    utf8 = 'utf-8',
    appShell = "",
    layouts = {},
    css = "",
    scripts = "";

function loadAppShell() {

    appShell = fs.readFileSync(path.resolve("../www/public/html/app-shell.html"), utf8);

}


function renderPage(page) {

    console.log(page);

    let body = fs.readFileSync(path.resolve(page), utf8),
        slug = path.basename(page, ".html"),
        pageObj = utils.readJSON(path.resolve("public/" + slug + ".json")),
        pageHTML, pageSlug,
        name = slug;

    if (slug === "home") {
        slug = "";
    }

    console.log(pageObj);

    pageHTML = appShell.replace("<%template%>", body);
    pageSlug = path.resolve("../www/public/", slug);

    pageHTML = template.render(pageHTML, pageObj);

    utils.createFile(path.join(pageSlug, "index.html"), pageHTML, true);

    utils.createFile("public/" + name + ".json", JSON.stringify({
        "name": name,
        "slug": slug,
        "scripts": [
            "js/app/pages/" + name + ".js"
        ],
        "css": []
    }), true);

}


function readPageFiles() {

    loadAppShell();

    glob(path.resolve("../www/public/html/pages/*.html"), (er, files) => {

        console.log(files.length);

        files.forEach(file => {

            renderPage(file, utf8);

        });

    });


}


readPageFiles();