class CacheManifest {
    
        //manifest, preCacheName, cache = true
        constructor({
            manifest = [],
            cache = "manifest-cache",
            preCacheName = "pre-cache-default",
            CACHE_UPDATE_TTL_KEY = "CACHE_UPDATE_TTL_KEY",
            CACHE_MANIFEST_KEY = "cache-manifest",
            PRECACHE_UPDATE_TTL = 1000 * 60 * 60 * 24, // 24 hours,
            idbkv,
            CACHE_MANIFEST = "cache-manifest.json",
            dateMgr
        }) {
    
            let cm = this;
    
            cm.manifest = manifest;
            cm.cache = cache;
            cm.preCacheName = preCacheName;
            cm.CACHE_UPDATE_TTL_KEY = CACHE_UPDATE_TTL_KEY;
            cm.CACHE_MANIFEST_KEY = CACHE_MANIFEST_KEY;
            cm.PRECACHE_UPDATE_TTL = 1000; //PRECACHE_UPDATE_TTL;
            cm.CACHE_MANIFEST = CACHE_MANIFEST;
    
            if (!idbkv) {
                throw new Error("no idb key value class provided");
            }
    
            if (!dateMgr) {
                throw new Error("no DateManager class provided");
            }
    
            cm.dateMgr = dateMgr;
    
            cm.idbkv = idbkv;
    
            cm.canUpdateCacheManifest()
                .then(function (state) {
    
                    if (state) {
    
                        cm.fetchCacheManifest()
                            .then(function (manifest) {
    
                                cm.urlsToPreCache(manifest)
                                    .then(function (precache) {
    
                                        var updatePreCache = cm.updatePreCache(precache)
    
                                        if (updatePreCache) {
    
                                            updatePreCache.then(function () {
    
                                                cm.revPreCacheTTL();
    
                                            });
    
                                        }
    
                                    })
    
                            });
    
                    }
    
                });
    
        }
    
        /*
            Get persisted time value that indicates when the service worker is cleared to
            update the precache. The actual point in time is set in the revPreCacheTTL function.
            If it has pass the time, the function returns (resolves) true.
        */
        canUpdateCacheManifest() {
    
            var cm = this,
                now = new Date();
    
            //retrieve persisted list of precached URLs
            return cm.idbkv.get(this.CACHE_UPDATE_TTL_KEY).then(function (ret) {
    
                if (!ret) {
                    return true;
                }
    
                return cm.dateMgr.compareDates(ret, Date.now());
    
            });
    
        }
    
        updateManifestTTL(manifest) {
    
            if (!manifest) {
                return;
            }
    
            for (var i = 0; i < manifest.length; i++) {
    
                manifest[i].ttl = this.dateMgr.ensureDateType(manifest[i].ttl);
    
            }
    
            return manifest;
    
        }
    
        getManifest() {
    
            var cm = this;
    
            return new Promise((resolve, reject) => {
    
                if (cm.manifest && cm.manifest.length > 0) {
                    resolve(cm.manifest);
                }
    
                cm.fetchCacheManifest()
                    .then(function (manifest) {
    
                        resolve(manifest);
    
                    });
    
            });
    
        }
    
        /*
        fetch (get) latest cache manifest file
        */
        fetchCacheManifest() {
    
            var cm = this;
    
            // With the cache opened, load a JSON file containing an array of files to be cached
            return fetch(cm.CACHE_MANIFEST).then(function (response) {
    
                return response.json()
                    .then(function (manifest) {
    
                        cm.idbkv.put(cm.CACHE_MANIFEST_KEY, 
                            cm.updateManifestTTL(cm.transformManifest(manifest)));
    
                        cm.manifest = manifest;
    
                        // Once the contents are loaded, convert the raw text to a JavaScript object
                        return manifest;
    
                    });
    
            });
    
        }
    
        transformManifest(manifest){
    
            let objManifest = {};
    
            manifest.forEach(function(url, index){
    
                objManifest[url.url] = url;
    
            });
    
            return objManifest;
    
        }
    
        /*
            updates the PreCache Time to Live Value with a new date-time value. 
            The PRECACHE_UPDATE_TTL is a constant set in the variables defined 
            at the beginning of the script. The default or recommended value is
            24 hours, but you can vary as desired.
            The ensureDateType function will automatically add the constant
            value to the current time, so the persisted time is the point
            at which an update is permitted.
            The goal is to limit the number of times the precache is updated
            so the user agent is not checking everytime a page is loaded (assuming 
            your page uses the client-side PostMessage mechanism) or if the service 
            worker is updated frequently (rare case).
            Too much network chatter defeats the purpose of precache, especially
            on mobile.
        */
        revPreCacheTTL() {
    
            return this.idbkv.put(this.CACHE_UPDATE_TTL_KEY, this.dateMgr.ensureDateType(this.PRECACHE_UPDATE_TTL));
    
        }
    
        /*
    
            - the cacheObjs parameter is the JSON object retrieved from the server
                containing the current list of URLs to precache.
            - retrieves the persisted list (object) of urls that are precached
            - the list is an object containing meta data about each URL
            - the format should look something like:
    
                {
                    "url": "/contact",
                    "precache": true,
                    "ttl": 604800
                }
    
            - additional META values might also be added, for example caching strategy
            - the function compares the URL's meta values with current conditions to determine 
                if a URL should be requested and added to the precache
            - precache list is persisted in indexeddb
            - one of the primary reasons for this technique is not having full access to response
                headers in the response object. Otherwise headers could be used instead of 
                persisting the list.
            - The persisted object uses a little conversion logic (near the end of the function)
                to create an associative array (object).
            - note: an object is used rather than an array because an object is an associative
                array. Setting a property name to the url slug makes matching much simpler than
                continually doing loops looking for a match.
    
            TODO: add logic to determine if a response should be purged from precache
            TODO: this is sort of a long function so it might need some refactoring
    
        */
        urlsToPreCache(cacheObjs) {
    
            var cm = this,
                objToCache = [],
                now = new Date();
    
            //retrieve persisted list of precached URLs
            return cm.idbkv.get(cm.CACHE_MANIFEST_KEY).then(function (ret) {
    
                //if nothing persisted yet, then create an empty object
                if (ret === undefined) {
                    ret = {};
                }
    
                //loop through the latest URL list
                for (var i = 0; i < cacheObjs.length; i++) {
    
                    var url = cacheObjs[i];
    
                    //a URL must be a precache URL and have become stale (TTL)
                    if ((url.strategy === "precache_dependency") &&
                        (!ret[url.url] ||
                            cm.dateMgr.compareDates(ret[url.url].ttl, now))) {
    
                        //update the Time to Live value
    
                        if(ret[url.url]){
    
                        url.ttl = cm.dateMgr.ensureDateType(url.ttl);
    
                        }else{
    
                            url.ttl = Date.now();
    
                        }
    
                        ret[url.url] = url;
    
                        //add URL to cache to an array of URL strings
                        //this will later be passed to the cache.addAll function.
                        objToCache.push(url.url);
    
                    }
    
                }
    
                //update the persisted object list
                //  idbkv.put(PRECACHE_KEY, ret);
    
                return objToCache;
    
            });
    
        }
    
        /*
    
            used to remove the persisted list of URLs
            should only be called when there is an exception
            in the cache.addAll function.
            This cleans the list to trigger an update next time around.
    
            TODO: remove the TTL value to trigger updates
    
            Note: limited to the list of URLs being precached now, NOT
                    nessecarily the full list
    
        */
        cleanPreCachedURLs(urls) {
    
            return idbkv.get(this.CACHE_MANIFEST_KEY).then(function (ret) {
    
                if (ret === undefined) {
                    return;
                }
    
                for (var i = 0; i < urls.length; i++) {
    
                    delete ret[urls[i]];
    
                }
    
                idbkv.put(CACHE_MANIFEST_KEY, ret);
    
            });
    
        }
    
        /*
    
            - check IDB for manifest TTL value
            - if stale then retrieve from network
    
        */
        updatePreCache(cacheList) {
    
            //ensure we have URLs to add to the precache
            if (cacheList && cacheList.length > 0) {
    
                return caches.open(PRECACHE_NAME)
                    .then(function (cache) {
    
                        cache.addAll(cacheList)
                            .catch(function (err) {
    
                                //if the addAll fails (typically 4xx or 5xx)
                                //then clean the URLs from the persisted list
                                if (err.message === "Request failed") {
    
                                    cleanPreCachedURLs(cacheList).then(function () {
    
                                        console.error("error precaching assets : ", err);
    
                                    });
    
                                }
    
                            });
    
                    });
    
            }
    
        }
    
    }
    