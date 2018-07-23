(function () {

    var _ticket;

    function renderCart(template) {

        pwaTicketAPI.getEventTicket(pwaTickets.getParameterByName("eventid"),
                pwaTickets.getParameterByName("ticketid"))
            .then(function (ticket) {

                var target = _d.qs(".content-target");

                target.innerHTML = Mustache.render(template, ticket);

                _ticket = ticket;

                initBuyButton();

            });

    }

    function initBuyButton(){

        _d.qs(".purchase-btn").addEventListener("click", 
            function(evt){

                evt.preventDefault();

                pwaTicketAPI.buyTicket(_ticket);

                return false;

            });

    }

    pwaTicketAPI.loadTemplate("templates/cart.html")
        .then(function (template) {

            if (template) {

                return pwaTicketAPI.verifyToken()
                    .then(function (token) {

                        renderCart(template);

                    });

            }

        })
        .catch(function (err) {

            console.log(err);

        });

})();