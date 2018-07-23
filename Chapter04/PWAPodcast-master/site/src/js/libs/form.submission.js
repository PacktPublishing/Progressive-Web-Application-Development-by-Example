/* global $ */


(function (window, undefined) {

    "use strict";

    var formSubmission = function (node, customSettings) {

        return new formSubmission.fn.init(node, customSettings);
    };

    formSubmission.fn = formSubmission.prototype = {

        constructor: formSubmission,

        init: function (config) {

            var self = this;

            self.setupformSubmission(config);

            return self;
        },

        version: "0.0.1",

        setupformSubmission: function (config) {

            var self = this;

            //dependent on an external extend function
            self.config = $.extend({}, self.options, config);

            self.setup = (self.config.targetURL && self.config.targetURL.length > 0 &&
                self.config.form && typeof self.config.form === "string" &&
                self.config.submit && typeof self.config.submit === "string");

            var submitBtn = document.querySelector(self.config.form + " " +
                self.config.submit);

            if (submitBtn) {

                submitBtn.addEventListener("click", function (e) {

                    e.preventDefault();
                    e.stopPropagation();

                    self.submitForm();

                    return false;

                });

            }

        },

        serialize: function () {

            var self = this,
                form = document.querySelector(self.config.form),
                i, j, q = {};

            if (!form || form.nodeName !== "FORM") {
                return;
            }

            for (i = 0; i < form.elements.length; i++) {

                if (form.elements[i].name === "") {
                    continue;
                }

                switch (form.elements[i].nodeName) {
                    case 'INPUT':
                        switch (form.elements[i].type) {
                            case 'text':
                            case 'hidden':
                            case 'password':
                            case 'button':
                            case 'reset':
                            case 'submit':
                            case 'tel':
                            case 'email':
                            case 'date':
                            case 'datetime':
                            case 'range':
                            case 'number':
                            case 'url':
                            case 'search':
                                q[form.elements[i].name] = form.elements[i].value;
                                break;
                            case 'checkbox':
                            case 'radio':
                                if (form.elements[i].checked) {
                                    q[form.elements[i].name] = form.elements[i].value;
                                }
                                break;
                        }
                        break;
                    case 'file':
                        break;
                    case 'TEXTAREA':
                        q[form.elements[i].name] = form.elements[i].value;
                        break;
                    case 'SELECT':
                        switch (form.elements[i].type) {
                            case 'select-one':
                                q[form.elements[i].name] = form.elements[i].value;
                                break;
                            case 'select-multiple':
                                for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                                    if (form.elements[i].options[j].selected) {
                                        q[form.elements[i].name] = encodeURIComponent(form.elements[i].options[j].value);
                                    }
                                }
                                break;
                        }
                        break;
                    case 'BUTTON':
                        switch (form.elements[i].type) {
                            case 'reset':
                            case 'submit':
                            case 'button':
                                q[form.elements[i].name] = form.elements[i].value;
                                break;
                        }
                        break;
                }
            }

            return q;

        },

        isValid: function () {

            var self = this,
                form = document.querySelector(self.config.form);

            return form.checkValidity();

        },

        submitForm: function () {

            var self = this;

            if (self.isValid()) {

                var request = new XMLHttpRequest();

                request.open('POST', self.config.targetURL, true);
                request.setRequestHeader('Content-Type', 'application/JSON; charset=UTF-8');

                request.onload = function () {
                    if (this.status >= 200 && this.status < 400) {
                        // Success!

                        if (self.config.success) {

                            self.config.success();

                        }

                    } else {
                        // We reached our target server, but it returned an error
                        if (self.config.error) {

                            self.config.error();

                        }
                    }
                };

                request.send(JSON.stringify(self.serialize()));

            }

        },

        setup: false,

        options: {
            targetURL: "",
            form: ".your-form-selector",
            submit: ".btn-submit"
        }

    };

    // Give the init function the formSubmission prototype for later instantiation
    formSubmission.fn.init.prototype = formSubmission.fn;

    return (window.formSubmission = formSubmission);

}(window));