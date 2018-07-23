(function () {

    function postContact(e){

        e.preventDefault();

        var nameTxt = _d.qs("[name=name]"),
        emailTxt = _d.qs("[name=email]"),
        subjectTxt = _d.qs("[name=subject]"),
        messageTxt = _d.qs("[name=message]")

        pwaTicketAPI.postContact({
            "name": nameTxt.value,
            "subject": subjectTxt.value,
            "email": emailTxt.value,
            "message": messageTxt.value
        })
        .then(function(){

            console.log("success");

            _d.qs(".confimation-panel").classList.remove("invisible");
            _d.qs(".contact-panel").classList.add("invisible");

        })
        .catch(function(err){

            console.log(err);

        });

        return false;

    }

    var btnSubmit = _d.qs(".btn-contact-submit");

    btnSubmit.addEventListener("click", postContact);

})();