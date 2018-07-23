    //push notification feature detection
    if ("PushManager" in window) {

        window.pushMgr = {

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

        };

    }