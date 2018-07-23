var SiteModule = require("./site.module"),
    utils = require("./utils"),
    fs = require("fs"),
    path = require("path"),
    _ = require("lodash"),
    mustache = require("mustache"),
    FeedParser = require('feedparser'),
    request = require('request'),
    utf8 = 'utf-8';


class PodcastModule extends SiteModule {

    constructor(src, template) {

        super("PodcastModule", template);

        this.src = src;

    }

    static renderList(podcasts){

    }

    render(defaultObj) {

        let self = this;

        if (self.src.feedUrl && typeof self.src.feedUrl === "string") {

            var podcastObj = _.assignIn(defaultObj, self.makePageJSON(self.src));

            self.makeEpisodeList(podcastObj, function (podcast) {

                podcast.body = mustache.render(self.template, podcast).replace(/\r\n/g, "");

                console.log("title ", podcast.title);

                self.transformToPage(podcast);

            });

            //        return this.podcast = podcastObj;

        }

    }

    makeEpisodeList(podcast, callback) {

        let req = request(podcast.feedUrl);
        let feedparser = new FeedParser();

        console.log("title: ", podcast.title)

        podcast.episodes = [];

        req.on('error', function (error) {
            // handle any request errors
            console.log("error ", error);
        });

        req.on('response', function (res) {
            var stream = this; // `this` is `req`, which is a stream

            if (res.statusCode !== 200) {
                this.emit('error', new Error('Bad status code'));
            }
            else {
                stream.pipe(feedparser);
            }
        });

        feedparser.on('error', function (error) {
            // always handle errors
            console.log("error ", error);
        });

        feedparser.on('readable', function () {
            // This is where the action is!
            let stream = this, // `this` is `feedparser`, which is a stream
                meta = this.meta, // **NOTE** the "meta" is always available in the context of the feedparser instance
                item;

            while (item = stream.read()) {

                podcast.episodes.push({
                    "slug": utils.makeSlug(item.title + " " + item.guid),
                    "title": item.title,
                    "description": item.description,
                    "pubdate": item.pubdate,
                    "link": item.link,
                    "guid": item.guid,
                    "image": item.image.url,
                    "podcast": {
                        "title": item.meta.title,
                        "description": item.meta.description,
                        "image": item.meta.image.url
                    }
                });

            }

        });

        feedparser.on('end', function (fin) {
            // always handle errors
            console.log("end ", fin);

            callback(podcast);

        });

    }

    transformToPage(srcObj) {

        srcObj.published = Date.now();

        srcObj = _.assignIn(this.getDefaultPage(), srcObj);

        console.log("slug ", srcObj.slug);

        utils.createFile(path.resolve("../data/pages/podcasts/",
            srcObj.slug + ".json"),
            JSON.stringify(srcObj), true);

    }

    makePageJSON(srcObj) {

        let ret = {
            "slug": utils.makeSlug(srcObj.collectionName),
            "collectionId": srcObj.collectionId,
            "Name": srcObj.collectionName,
            "LongName": srcObj.collectionName,
            "lowerAppName": srcObj.collectionName,
            "title": srcObj.collectionName,
            "feedUrl": srcObj.feedUrl,
            "abstract": srcObj.artistName,
            "description": srcObj.artistName,
            "artwork": {
                "30": srcObj.artworkUrl30,
                "60": srcObj.artworkUrl60,
                "100": srcObj.artworkUrl100,
                "600": srcObj.artworkUrl600
            },
            "image": {
                "url": srcObj.artworkUrl600,
                "width": 600,
                "height": 600
            },
            "genres": srcObj.genres
        };

        return ret;

    }

}


module.exports = PodcastModule;



    // getDefaultPodcast() {

    //     if (this.defaultPodcast) {

    //         return this.defaultPodcast;

    //     }

    //     this.defaultPodcast = utils.readJSONFile("default.podcast.json");

    //     return this.defaultPodcast;

    // }

    // getPodcast() {

    //     if (this._podcast) {

    //         return this._podcast;

    //     }

    //     this._podcast = utils.readJSONFile(this.src);

    //     return this._podcast;

    // }
