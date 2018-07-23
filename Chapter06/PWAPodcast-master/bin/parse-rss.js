var FeedParser = require('feedparser'),
    fs = require("fs");
var request = require('request'); // for fetching the feed

var req = request('https://backtofrontshow.com/feed/');
var feedparser = new FeedParser();

function makeSlug(src) {

    if (typeof src === "string") {

        return src.replace(/ +/g, "-")
            .replace(/\'/g, "")
            .replace(/[^\w-]+/g, "")
            .replace(/-+/g, "-")
            .toLowerCase();

    }

    return "";

}

function createFile(target, body) {

    fs.writeFileSync(target, body, "utf-8");

}

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
    var stream = this; // `this` is `feedparser`, which is a stream
    var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
    var item,
        items = 0;

    while (item = stream.read()) {

        createFile("The Back to Front Show/" + makeSlug(item.title) + ".json", JSON.stringify({
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
        }));

        items += 1;

    }

    console.log(items);

});


feedparser.on('end', function (fin) {
    // always handle errors
    console.log("end ", fin);
});
