(function () {

    //push key
    var applicationServerPublicKey = 'BH2mv3NZwRaO4-fnNAXe212SW8gep402wV4dStk2vewdGtUOrVMrGY0zh-2WNT4_aEVLc12r0bfuABanQRy8bDM';

    var listenLater = {

        getEpisode: function (episode) {

            //retrieve stored audio file from IDB

        }

    }

    //push notification feature detection
    if ("PushManager" in window) {

        var pushMgr = {

            swRegistration: undefined,

            _isSubscribed: false,

            askPermission: function () {
                return new Promise(function (resolve, reject) {
                    const permissionResult = Notification.requestPermission(function (result) {
                        resolve(result);
                    });

                    if (permissionResult) {
                        permissionResult.then(resolve, reject);
                    }
                });
                // .then(function (permissionResult) {
                //     if (permissionResult !== 'granted') {
                //         throw new Error('We weren\'t granted permission.');
                //     }
                // });
            },

            updateSubscriptionOnServer: function (subscription) {
                // TODO: Send subscription to application server

                console.log("user subscription state set ", !!subscription);

                return;
            },

            getSubscription: function () {

                return navigator.serviceWorker.getRegistration()
                    .then(function (registration) {

                        return registration.pushManager.getSubscription();

                    });

            },

            getIsSubscribed: function () {

                var self = this;

                return new Promise(function (resolve, reject) {

                    self.getSubscription()
                        .then(function (subscription) {

                            self._isSubscribed = (subscription);

                            resolve(self._isSubscribed);

                        });

                });

            },

            initialisePush: function () {  // Set the initial subscription value

                var self = this;

                if (self.swRegistration) {

                    self.getSubscription()
                        .then(function (subscription) {

                            if (!subscription) {
                                self.subscribeUser();
                            }

                        });

                }

            },

            urlB64ToUint8Array: function (base64String) {
                //assume const support if push is supported ;)
                const padding = '='.repeat((4 - base64String.length % 4) % 4);
                const base64 = (base64String + padding)
                    .replace(/\-/g, '+')
                    .replace(/_/g, '/');

                const rawData = window.atob(base64);
                const outputArray = new Uint8Array(rawData.length);

                for (let i = 0; i < rawData.length; ++i) {
                    outputArray[i] = rawData.charCodeAt(i);
                }
                return outputArray;
            },

            unsubscribeUser: function () {

                var self = this;

                self.getSubscription()
                    .then(function (subscription) {

                        return subscription.unsubscribe();

                    })
                    .catch(function (error) {
                        console.log('Error unsubscribing', error);
                    })
                    .then(function () {

                        self.updateSubscriptionOnServer(null);

                        self.isSubscribed = false;

                    });

            },

            subscribeUser: function () {

                var self = this;

                self.getIsSubscribed()
                    .then(function (subscription) {

                        self.askPermission()
                            .then(function (permission) {

                                if (permission) {

                                    self.swRegistration.pushManager.subscribe({
                                        userVisibleOnly: true,
                                        applicationServerKey: self.urlB64ToUint8Array(applicationServerPublicKey)
                                    }) .then(function (subscription) {

                                        console.log('User is subscribed.');

                                        self.updateSubscriptionOnServer(subscription);

                                        self._isSubscribed = true;

                                    }) .catch(function (err) {
                                        console.log('Failed to subscribe the user: ', err);
                                    });

                                }

                            });

                    });

            }

        }

    }

    if ('serviceWorker' in navigator) {

        navigator.serviceWorker.register('/sw.js').then(reg => {

            // reg.installing; // the installing worker, or undefined
            // reg.waiting; // the waiting worker, or undefined
            // reg.active; // the active worker, or undefined   

            console.log("Registration was successful");

            reg.addEventListener('updatefound', () => {   // A wild service worker has appeared in reg.installing!

                const newWorker = reg.installing;

                console.log("newWorker.state: ", newWorker.state);
                // "installing" - the install event has fired, but not yet complete
                // "installed"  - install complete
                // "activating" - the activate event has fired, but not yet complete
                // "activated"  - fully active
                // "redundant"  - discarded. Either failed install, or it's been
                //                replaced by a newer version

                newWorker.addEventListener('statechange', () => {
                    // newWorker.state has changed

                    console.log("service worker state change");
                });

            });

            //push notification feature detection
            if ("PushManager" in window) {

                pushMgr.swRegistration = reg;

                pushMgr.initialisePush();

            }


            if ("sync" in reg) {

                reg.sync.register('get-episode');

            }

        });

        navigator.serviceWorker.addEventListener('controllerchange',
            function () {

                // This fires when the service worker controlling this page
                // changes, eg a new worker has as skipped waiting and become
                // the new active worker.
                console.log('serviceWorker.onControllerchange',
                    navigator.serviceWorker.controller.scriptURL);

            });

        if ('storage' in navigator && 'estimate' in navigator.storage) {

            navigator.storage.estimate().then(estimate => {

                console.log(`Using ${estimate.usage} out of ${estimate.quota} bytes.`);

            });

        }

        window.addEventListener('beforeinstallprompt', function(e) {
            console.log('beforeinstallprompt Event fired');
            // e.preventDefault();
            // return false;
          });

    }

    var utils = {

        getParameterByName: function (name, url) {
            if (!url) {
                url = window.location.href;
            }
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

    }

    window.utils = utils;
    window.pushMgr = pushMgr;

})();