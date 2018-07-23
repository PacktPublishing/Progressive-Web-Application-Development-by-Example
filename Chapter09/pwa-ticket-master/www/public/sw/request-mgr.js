class RequestManager {

    constructor({
        cacheManifest = undefined,
        strategyManager = undefined
    }) {

        if (!cacheManifest) {

            throw new Error("No CacheManager supplied to the RequestManager");
        }

        if (!strategyManager) {

            throw new Error("No strategyManager supplied to the RequestManager");

        }

        this.cacheManifest = cacheManifest;
        this.strategyManager = strategyManager;

        this.setup();

    }

    setup() {

        var rm = this;

        rm.cacheManifest.getManifest()
            .then(function (manifest) {

                rm.parseManifest(manifest);

            });

    }

    parseManifest(manifest) {

        var routes = "",
            preCache = [],
            strategies = [];

        for (var i = 0; i < manifest.length; i++) {

            if (!/precache/g.test(manifest[i].strategy)) {

                routes += routes === "" ? "({route})".replace(/{route}/, manifest[i].url) :
                    "|({route})".replace(/{route}/, manifest[i].url);

                strategies.push(manifest[i].strategy);

            } else {

                //a pre-cache asset
                preCache.push(manifest[i].url);

            }

        }

        this.routes = routes;
        this.strategies = strategies;
        this.preCache = preCache;
        this.setupFinished = true;

    }

    isPreCache(url) {

        url = new URL(url);

        return this.preCache.indexOf(url.pathname) > -1;

    }

    processDynamicRequest(request) {

        var routeTest = new RegExp(this.routes),
            result = routeTest.exec(request.url);

        if (result) {

            var match = result.shift(),
                index = result.indexOf(match);

            console.log(this.strategies[index - 1]);

            //return request handler. Should be a promise.
            return this.strategyManager[this.strategies[index - 1]](request);

        } else {

            //default to pass-through
            return fetch(request);

        }

    }

    processPreCachedRequest(request) {

        return this.strategyManager.cacheFirst(request);

    }

    fetch(request) {

        if (!this.setupFinished) {

            setTimeout(function () {

                console.log("looping request: ", request.url);

                fetch(request);

            }, 100);

        } else {

            if (typeof request === 'string') {

                request = new Request(request);

            }

            if (this.isPreCache(request.url)) {

                return this.processPreCachedRequest(request);

            } else {

                return this.processDynamicRequest(request);

            }

        }

    }

}