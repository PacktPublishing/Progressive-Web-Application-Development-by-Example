(function () {

    return pwaTicketAPI.verifyToken()
        .then(function (token) {

            pwaTicketAPI.loadTemplate("templates/event-list.html")
                .then(function (template) {

                    if (template) {

                        pwaTicketAPI.getFutureEvents()
                            .then(function (events) {

                                var target = _d.qs(".events-target");

                                target.innerHTML = Mustache.render(template, {
                                    events: events
                                });

                            });

                    }

                })
                .catch(function (err) {

                    console.log(err);

                });


            function getTickets() {


                return pwaTicketAPI.getUserTickets(token.id);

            }

            pwaTicketAPI.loadTemplate("templates/ticket-list.html")
                .then(function (template) {

                    if (template) {

                        getTickets()
                            .then(function (tickets) {

                                var target = _d.qs(".tickets-target");

                                target.innerHTML = Mustache.render(template, {
                                    tickets: tickets
                                });

                            });

                    }

                })
                .catch(function (err) {

                    console.log(err);

                });

        });

})();