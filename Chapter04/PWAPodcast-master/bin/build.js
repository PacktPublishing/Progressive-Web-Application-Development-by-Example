var EpisodesModule = require("./make.episodes"),
    PodcastsModule = require("./make.podcasts"),
    SiteModule = require("./site.module"),
    utils = require("./utils"),
    fs = require("fs"),
    path = require("path"),
    glob = require("glob"),
    _ = require("lodash"),
    sizeOf = require('image-size'),
    mustache = require("mustache"),
    url = require('url'),
    http = require('http'),
    https = require('https'),
    environment = {
        "production": "https://podstr.love2dev.com",
        "localhost": "http://localhost:57662/"
    },
    utf8 = 'utf-8';



// var episodes = new EpisodesModule("../data/syntax/accepting-money-on-the-internet-.json",
//     "../site/src/html/templates/episode.html");

// episodes.render("../data/", "../data/pages/");


//PodcastsModule.render();
//PodcastsModule.transformPodcasts();


 const appShell = fs.readFileSync("../site/src/html/app-shell/index.html", utf8);


glob("../data/pages/**/*.json", function (er, files) {

    for (var index = 0; index < files.length; index++) {

        let file = files[index],
            page = utils.readJSONFile(file),
            html = "";

            if (file.indexOf("episodes") > -1) {
                
                page.slug = "episode/" + page.slug;

            } else if (file.indexOf("podcasts") > -1) {
                
                page.slug = "podcast/" + page.slug;
                                                
            }
        
            page.base = environment.localhost;

            html = mustache.render(appShell, page);

            utils.createFile("../site/localhost/" + page.slug + "/index.html", html, true);
    }
    
});

