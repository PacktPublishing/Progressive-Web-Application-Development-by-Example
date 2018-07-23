(function () {

    function login(e) {

        e.preventDefault();

        var username = _d.qs("[name=Username]"),
            password = _d.qs("[name=Password]");

            pwaTicketAPI.login({
                username: username.value,
                password: password.value
            })
            .then(function(result){

                if(result){

                    window.location.href = "/";

                }

            });

        return false;

    }

    function init() {

        var loginBtn = _d.qs(".btn-login");

        loginBtn.addEventListener("click", login);

    }

    init();

})();