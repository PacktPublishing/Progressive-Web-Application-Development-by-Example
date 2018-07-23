
/* work with the storage quota */
class StorageManager {

    constructor() {

    }

    getQuota() {

        if (navigator) {
            console.log("navigator!");

            if (navigator.storage) {
                console.log("navigator.storage!");
            }
        }


    }

    getUsage() {

        navigator.storage.estimate().then(estimate => {

            console.log(`Using ${estimate.usage} out of ${estimate.quota} bytes.`);

        });

    }

}