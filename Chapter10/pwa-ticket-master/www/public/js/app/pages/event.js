(function () {

    //no need to render if service workers are supported
    //unless the service worker is not in control of the page yet.
    //test if the loader element exists. If so then fetch the data to render
    if (_d.qs(".loader")) {

        pwaTicketAPI.loadTemplate("templates/event.html")
            .then(function (template) {

                if (template) {

                    pwaTicketAPI.getEvent(pwaTickets.getParameterByName("id"))
                        .then(function (event) {

                            var target = _d.qs(".content-target");

                            target.innerHTML = Mustache.render(template, event);

                        });

                }

            })
            .catch(function (err) {

                console.log(err);

            });

    }

})();