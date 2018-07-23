if ('serviceWorker' in navigator) {

    //push key
    const applicationServerPublicKey = 'BH2mv3NZwRaO4-fnNAXe212SW8gep402wV4dStk2vewdGtUOrVMrGY0zh-2WNT4_aEVLc12r0bfuABanQRy8bDM';

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

            //            initialisePush();

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

}

var isSubscribed = false;

/*

function initialisePush() {  // Set the initial subscription value
     
    swRegistration.pushManager.getSubscription() .then(function (subscription) {  

        isSubscribed = !(subscription === null);
          
        if (isSubscribed) {   
            console.log('User IS subscribed.');  
        } else {   
            console.log('User is NOT subscribed.');  
        }
   
        updateBtn(); 

    });

}

*/
function urlB64ToUint8Array(base64String) {
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
  }
  

function subscribeUser() {

    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);

    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    }) .then(function (subscription) {

        console.log('User is subscribed.');

        updateSubscriptionOnServer(subscription);

        isSubscribed = true;

        updateBtn();

    }) .catch(function (err) {
        console.log('Failed to subscribe the user: ', err);
        updateBtn();
    });
}

function getParameterByName(name, url) {
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

if ('storage' in navigator && 'estimate' in navigator.storage) {

    navigator.storage.estimate().then(estimate => {

        console.log(`Using ${estimate.usage} out of ${estimate.quota} bytes.`);

    });

}