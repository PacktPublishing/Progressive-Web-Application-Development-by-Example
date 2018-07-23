(function () {

    var userId;

    pwaTicketAPI.loadTemplate("templates/profile.html")
        .then(function (template) {

            if (template) {

                return pwaTicketAPI.verifyToken()
                    .then(function (token) {

                        var target = _d.qs(".content-target");

                        target.innerHTML = Mustache.render(template, token);

                    });

            }

        })
        .catch(function (err) {

            console.log(err);

        });

})();