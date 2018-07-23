(function () {

    var cbNotifications = undefined;

    function initializeView() {

        cbNotifications = document.getElementById("cbNotifications");

        initializeNotificationState();

    }


    function initializeNotificationState() {

        pushMgr.getIsSubscribed()
            .then(function (isSubscribed) {

                cbNotifications.checked = isSubscribed;

                cbNotifications.addEventListener("change", function (e) {

                    e.preventDefault();

                    if (e.target.checked) {

                        pushMgr.subscribeUser();

                    } else {

                        pushMgr.unsubscribeUser();
                    }

                });

            });

    }

    initializeView();

})();