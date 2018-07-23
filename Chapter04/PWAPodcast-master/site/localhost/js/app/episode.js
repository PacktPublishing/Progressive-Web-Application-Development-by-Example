(function () {

    var listenLater = document.querySelector(".btn-listen-later");

    if (listenLater) {

        listenLater.addEventListener("click", function (evt) {

            var guid = listenLater.getAttribute("data-id");

            if (guid) {

            }

        });

    }

    function saveEpisodeData(guid) {

        var episodeSource = "api/episodes/" + guid + ".json";

        fetch(episodeSource)
            .then(function (response) {

                if (response && response.ok) {

                    caches.open("LISTEN_LATER").then(
                        cache => {

                            cache.put(episodeSource, response);

                        });

                }

            });

    }

})();