'use strict';

self.importScripts("js/libs/localforage.min.js",
    "js/app/libs/api.js", 
    "sw/response-mgr.js", 
    "sw/push-mgr.js",
    "sw/invalidation-mgr.js", 
    "sw/date-mgr.js"
);

const version = "1.05",
    preCache = "PRECACHE-" + version,
    dynamicCache = "DYNAMIC-" + version,
    eventsCacheName = "events-cache-" + version,
    qrCodesCacheName = "qr-codes-cache-" + version,
    cacheList = [
        "/",
        "img/pwa-tickets-logo-320x155.png",
        "js/app/app.js",
        "js/app/libs/api.js",
        "js/app/libs/push-mgr.js",
        "js/app/pages/cart.js",
        "js/app/pages/config.js",
        "js/app/pages/contact.js",
        "js/app/pages/event.js",
        "js/app/pages/events.js",
        "js/app/pages/home.js",
        "js/app/pages/login.js",
        "js/app/pages/profile.js",
        "js/app/pages/ticket.js",
        "js/app/pages/tickets.js",
        "js/libs/localforage.min.js",
        "js/libs/mustache.min.js",
        "js/libs/utils.js",
        "css/libs/bootstrap.min.css",
        "css/app/site.css",
        "html/app-shell.html",
        "templates/cart.html",
        "templates/event-list.html",
        "templates/ticket-list.html",
        "templates/user.html",
        "templates/ticket.html",
        "templates/event.html",
        "templates/profile.html",
        "ticket/",
        "tickets/",
        "signup/",
        "profile/",
        "notfound/",
        "login/",
        "events/",
        "event/",
        "contact/",
        "config/",
        "cart/"
    ],
    apiHost = "http://localhost:15501/",
    responseManager = new ResponseManager(),
    pushManager = new PushManager(),
    invalidationManager = new InvalidationManager([{
        "cacheName": preCache,
        "invalidationStrategy": "ttl",
        "strategyOptions": {
          "ttl": 100
          //604800 //1 week
        }
      },
      {
        "cacheName": qrCodesCacheName,
        "invalidationStrategy": "maxItems",
        "strategyOptions": {
          "max": 10
        }
      }]);

/*  Service Worker Event Handlers */

function getCacheName(url) {

    var cacheName = dynamicCache;

    if (/\/event\//.test(url)) {

        cacheName = eventsCacheName;

    }

    return cacheName;

}

self.addEventListener("install", event => {

    self.skipWaiting();

    console.log("Installing the service worker!");

    caches.open(preCache)
        .then(cache => {

            return cache.addAll(cacheList);

        });

});

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(cacheNames => {
            cacheNames.forEach(value => {

                if (value.indexOf(version) < 0) {
                    caches.delete(value);
                }

            });

            console.log("service worker activated");

            return;

        })

    );

});

self.addEventListener("fetch", event => {

    let cacheName = getCacheName(event.request.url);

    event.respondWith(

        responseManager.cacheFallingBackToNetworkCache(event.request, cacheName)
        .then(response => {
    
          invalidationManager.invalidateCache(cacheName);
    
          return response;
    
        })
    
    );

});

//Push Stuff
self.addEventListener("pushsubscriptionchange", event => {

    console.log("subscription change ", event);

});


function getAppShell() {

    return fetch("html/app-shell.html")
        .then(response => {

            if (response.ok) {

                return response.text()
                    .then(html => {

                        return html;

                    });
            }

        });

}

function getParameterByName(name, url) {

    name = name.replace(/[\[\]]/g, "\\$&");

    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);

    if (!results) {
        return null;
    }

    if (!results[2]) {
        return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getEventTemplate() {

    return fetch("templates/event.html")
        .then(response => {

            if (response.ok) {

                return response.text()
                    .then(html => {

                        return html;

                    });
            }

        });

}

function getEvent(id) {

    return fetch(apiHost + "futureEvents/" + id)
        .then(function (response) {

            if (response.ok) {

                return response.json();

            } else {

                throw "event " + id + " fetch failed";
            }

        });

}

function renderEvent(event) {

    let id = getParameterByName(event.request.url, "id"),
        appShell = "",
        eventTemplate = "";

    return getAppShell()
        .then(html => {

            appShell = html;

        })
        .then(() => {

            return getEventTemplate()
                .then(html => {

                    eventTemplate = html;

                });

        }).then(() => {

            let eventShell = appShell.replace("<%template%>", eventTemplate);

            return getEvent(id)
                .then((eventObj) => {

                    let sessionPage = Mustache.render(eventShell, session);

                    //make custom response
                    let response = new Response(sessionPage, {
                            headers: {
                                'content-type': 'text/html'
                            }
                        }),
                        copy = response.clone();

                    caches.open(dynamicCache)
                        .then(cache => {
                            cache.put(event.request, copy);
                        });

                    return response;

                });

        });

};

function isAPIRequest(url) {

    return url.indexOf(apiHost) != -1;

}