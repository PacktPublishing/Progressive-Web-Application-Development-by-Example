var PodcastModule = require("./make.podcast"),
    path = require("path"),
    fs = require("fs"),
    _ = require("lodash"),
    mustache = require("mustache"),
    utils = require("./utils");

class Podcasts {

    static transformPodcasts() {

        let postcasts = [],
            podcastList = utils.readJSONFile("../data/podcasts/javascript.podcasts.json"),
            template = fs.readFileSync("../site/src/html/templates/podcast-list-item.html", "utf-8");

        //        for (let i = 0; i < podcastList.results.length; i++) {

        let i = 0;

        if (podcastList.results[i].feedUrl && typeof podcastList.results[i].feedUrl === "string") {

            postcasts.push(PodcastModule.makePageJSON(podcastList.results[i]));

        }

        //        }

        let page = this.getDefaultPage();

        page.slug = "/";
        page.body = mustache.render(template, {
            "podcasts": postcasts
        }).replace(/\r\n/g, "").replace(/  /g, " ");

        utils.createFile(path.resolve("../data/pages/home.json"),
            JSON.stringify(page), true);

    }

    static transformToPage(srcObj) {

        srcObj.published = Date.now();

        srcObj = _.assignIn(this.getDefaultPage(), srcObj);

        console.log("slug ", srcObj.slug);

        utils.createFile(path.resolve("../data/pages/podcasts/",
            srcObj.slug + ".json"),
            JSON.stringify(srcObj), true);

    }

    static getDefaultPage() {

        return utils.readJSONFile("home.json");

    }

    static render() {

        const defaultPodcast = utils.readJSONFile("default.podcast.json");

        let podcastList = utils.readJSONFile("../data/podcasts/javascript.podcasts.json");

        //        for (let i = 0; i < podcastList.results.length; i++) {

        //            console.log(podcastList.results[i].collectionName);

        
        //read content/article
        let podcastModule = new PodcastModule(podcastList.results[30],
            "../site/src/html/templates/podcast.html");

        podcastModule.render(defaultPodcast);

        //      }

    }

}


module.exports = Podcasts;