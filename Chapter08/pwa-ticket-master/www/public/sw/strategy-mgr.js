
/**
 * StrategyManager contains methods for the primary cache 
 * [strategies](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/).
 * 
 * The service worker should examine the request and compare it to the cache rules, defined
 * in the cache configuration file. Based on the urls matching strategy the corresponding 
 * function should be called.
 *
 * @example
 * 
 * var manager = new StrategyManager();
 * 
 * manager.cacheFirst(event);
 * 
 * 
 * event is a FetchEvent, passed to the fetch event handler.
 *
 * 
 * TODO: 
 *  - add construction parameter to map cache names to routes
 * 
 */

class StrategyManager {

    constructor({
            cacheName = "dynamic-cache"
        }) {

        this.cacheName = cacheName;

    }

    async getCache() {

        if (!this._cache) {
            this._cache = await caches.open(this.cacheName);
        }

        return this._cache;

    }

    isResponseCacheable(response) {

        return [0, 200].includes(response.status);

    }

    isResponseNotFound(response) {

        return response.status === 404;

    }


    fetchFromCache(request) {

        return caches.match(request).then(response => {

            if (!response) {
                //fall back to the network fetch here
                throw Error(request.url + " not found in cache");
            }

            console.log("returning from fetchFromCache");

            return response;

        });

    }

    fetchAndCache(request) {

        var sm = this;

        return fetch(request)
            .then(function (response) {

                return sm.addToCache(request, response);

            });

    }

    //abstract the add to cache functionality to a common function
    addToCache(request, response) {

        //don't cache a 404 because the URL may become 200, etc
        //chrome-extension requests can't be cached
        //0 & 200 are good responses that can be cached
        if (this.isResponseNotFound(response) ||
            request.url.indexOf("chrome-extension") === -1 ||
            !this.isResponseCacheable(response)) {

            console.log(response.status + " " + request.url);

            return response;

        }

        var copy = response.clone();

        this.getCache().then(cache => {
            cache.put(request, copy);
        });

        return response;

    }

    cacheFirst(request) {

        const sm = this;

        return sm.fetchFromCache(request)
            .catch(() => fetch(request)
                .then(response => sm.addToCache(request, response)));

    }

    cacheOnly(request) {

        return this.fetchFromCache(request);

    }

    networkOnly(request) {

        return fetch(request);

    }

    cacheNetworkRace(request) {

        const promises = [];
        let timeoutId;

        promises.push(new Promise((resolve) => {

            resolve(this.fetchFromCache(request));

        }));

        promises.push(this.fetchAndCache(request)
            .then((response) => {

                return response ? response :
                    Promise.reject("no response received");

            }).catch(() => this.fetchFromCache(request)));

        return Promise.race(promises);

    }

    networkFirst(request) {

        return fetch(request).catch(function () {
            return caches.match(request);
        });

    }

    networkFallback(request) {

        return fetch(request).then(function (response) {    // Fall back to network

            return response;

        }).catch(function () {    // If both fail, show a generic fallback:

            return this.genericFallback(request);
        });

    }

    cacheFallback(request) {

        return caches.match(request).then(function (response) {    // Fall back to network

            return response;

        }).catch(function () {    // If both fail, show a generic fallback:

            return this.genericFallback(request);
        });

    }

    networkCacheFallback(request, requestConfig) {

        return fetch(request).then(function (response) {    // Fall back to network

            return response || caches.match(request);

        }).catch(function () {    // If both fail, show a generic fallback:

            return this.genericFallback(request);
        });

    }

    cacheNetworkFallback(request) {

        return caches.match(request).then(function (response) {    // Fall back to network

            return response || fetch(request);

        }).catch(function () {    // If both fail, show a generic fallback:

            return this.genericFallback(request);
        });

    }

    genericFallback(request) {

        this.fetchFromCache(request);

    }

    swTemplate(request) {

        throw new Error("not implemented");

    }

    staleWhileRevalidate(request) {

        return cache.match(request).then(function (response) {

            var fetchPromise = fetch(request).then(function (networkResponse) {

                cache.put(request, networkResponse.clone());

                return networkResponse;

            });

            return response || fetchPromise;

        });

    }

}
