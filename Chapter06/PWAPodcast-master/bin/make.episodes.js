var EpisodeModule = require("./make.episode"),
    path = require("path"),
    glob = require("glob");



//loop through the source folder for json files

/*

    glob

        foreach

            var episode = new EpisodeModule("../data/syntax/accepting-money-on-the-internet-.json",
    "../site/src/html/templates/episode.html");

episode = episode.render();

*/

class MakeEpisodes {

    render(src, target) {

        glob(src + "/**/*.json", function (er, files) {

            var articles = [];

            for (var i = 0; i < files.length; i++) {

                //read content/article
                let episode = new EpisodeModule(path.resolve(files[i]),
                    "../site/src/html/templates/episode.html");

                episode = episode.render();

            }

        });

    }

}


module.exports = MakeEpisodes;