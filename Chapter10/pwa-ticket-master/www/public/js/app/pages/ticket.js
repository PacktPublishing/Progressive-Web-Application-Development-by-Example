(function () {

    var userId;

    pwaTicketAPI.loadTemplate("templates/ticket.html")
        .then(function (template) {

            if (template) {

                return pwaTicketAPI.verifyToken()
                    .then(function (token) {

                        pwaTicketAPI.getUserTicket(token.id,
                                pwaTickets.getParameterByName("id"))
                            .then(function (ticket) {

                                var target = _d.qs(".content-target");

                                target.innerHTML = Mustache.render(template, ticket);

                            });


                    });

            }

        })
        .catch(function (err) {

            console.log(err);

        });

})();