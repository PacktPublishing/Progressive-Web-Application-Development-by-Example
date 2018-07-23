(function () {

    var userId;

    function getTickets() {

        return pwaTicketAPI.verifyToken()
            .then(function(token){

                return pwaTicketAPI.getUserTickets(token.id);

            });

    }

    pwaTicketAPI.loadTemplate("templates/ticket-list.html")
        .then(function (template) {

            if (template) {

                getTickets()
                    .then(function (tickets) {

                        var target = _d.qs(".content-target");

                        target.innerHTML = Mustache.render(template, {
                            tickets: tickets
                        });

                    });

            }

        })
        .catch(function (err) {

            console.log(err);

        });


})();