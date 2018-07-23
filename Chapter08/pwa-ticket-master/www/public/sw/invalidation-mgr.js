class InvalidationManager {

    constructor(invalidationRules = []) {

        this.invalidationRules = invalidationRules;

        this.cacheCleanUp();
    }

cacheCleanUp() {

    let invMgr = this;

    invMgr.invalidationRules.forEach((value) => {

        switch (value.invalidationStrategy) {

            case "ttl":

                invMgr.updateStaleEntries(value);

                break;

            case "maxItems":

                invMgr.maxItems(value);

                break;

            default:
                break;
        }

    });

}

    maxItems(options) {

        self.caches.open(options.cacheName)
            .then(cache => {

                cache.keys().then(keys => {

                    if (keys.length > options.strategyOptions.max) {

                        let purge = keys.length - options.strategyOptions.max;

                        for (let i = 0; i < purge; i++) {
                            cache.delete(keys[i]);
                        }

                    }

                });

            });

    }

    updateStaleEntries(rule) {

        self.caches.open(rule.cacheName)
            .then(cache => {

                cache.keys().then(keys => {

                    keys.forEach((request, index, array) => {

                        cache.match(request).then(response => {

                            let date = new Date(response.headers.get("date")),
                                current = new Date(Date.now());

                            //300 === 5 minutes
                            //3600 === 1 Hour
                            //86400 === 1 day
                            //604800 === 1 week

                            if (!DateManager.compareDates(current,
                                    DateManager.addSecondsToDate(date,
                                        rule.strategyOptions.ttl))) {

                                cache.delete(request);

                            }

                        });

                    });

                });

            });

    }

    invalidateCache(cacheName) {

        let invMgr = this;

        invMgr.invalidationRules.forEach((value) => {

            if (value.cacheName === cacheName) {

                switch (value.invalidationStrategy) {

                    case "ttl":

                        invMgr.updateStaleEntries(value);

                        break;

                    case "maxItems":

                        invMgr.maxItems(value);

                        break;

                    default:
                        break;
                }

            }

        });


    }

}