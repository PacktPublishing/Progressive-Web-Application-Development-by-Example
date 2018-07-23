class PushManager {

    constructor() {

        this.registerPush()

    }

    registerPush() {

        var pm = this;

        self.addEventListener("push", event => {

            pm.handlePush(event);

        });

        pm.registerResponse();

    }

    handlePush(event) {

        console.log('[Service Worker] Push Received.');
        console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

        try {
            //        var episode = JSON.parse(event.data.text());

            const title = "Special Sale on Bedroom Suites";
            const options = {
                body: "Don't miss this limited time sale. Save up to 20%, 1 week only.",
                icon: 'meta/72370e8a-992c-9032-7ef3-18d40a22d681.webPlatform.png',
                badge: 'meta/72370e8a-992c-9032-7ef3-18d40a22d681.webPlatform.png',
                image: 'images/mobile/1.jpg',
                vibrate: [200, 100, 200, 100, 200, 100, 200],
                actions: [{
                    action: "view",
                    title: "View Now",
                    icon: 'img/cart.png'
                },
                {
                    action: "later",
                    title: "Not Now",
                    icon: 'img/cancel.png'
                }]
            };

            event.waitUntil(self.registration.showNotification(title, options));

        }
        catch (e) {
            console.log('invalid json - notification supressed');
        }


    }

    registerResponse() {

        var that = this;

        self.addEventListener('notificationclick', event => {

            that.handleResponse(event);

        });

    }


    handleResponse(event) {

        console.log('[Service Worker] Notification click Received. ${event}');

        if (event.action === "view") {

            clients.openWindow('/category/bedroom/');

        } else if (event.action === "later") {

            //dismissNotification(event.notification);

        }

        event.notification.close();

    }

}