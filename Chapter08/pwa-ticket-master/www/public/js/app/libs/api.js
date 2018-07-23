var pwaTicketAPI = (function () {

    var api = "http://localhost:15501/",
        authToken = "auth-token";

    function saveAuthToken(token) {

        return localforage.setItem(authToken, token)
            .then(function () {

                return token;

            });

    }

    return {

        loadTemplate: function (url) {

            return fetch(url)
                .then(function (response) {

                    if (response.ok) {

                        return response.text()
                            .then(function (template) {

                                return template;

                            });

                    }

                    return;

                })

        },

        searchFutureEvents: function (term) {

            return fetch(api + "futureEvents?q=" + term)
                .then(function (response) {

                    if (response.ok) {

                        return response.json();

                    } else {

                        throw "user tickets fetch failed";
                    }

                });

        },

        getUserTickets: function (userId) {

            return fetch(api + "users/" + userId)
                .then(function (response) {

                    if (response.ok) {

                        return response.json()
                            .then(function (user) {

                                return user.tickets;

                            });

                    } else {

                        throw "user tickets fetch failed";
                    }

                });

        },

        getUserTicket: function (userId, ticketId) {

            return fetch(api + "users/" + userId)
                .then(function (response) {

                    if (response.ok) {

                        return response.json()
                            .then(function (user) {

                                var ticket = user.tickets.filter(function (tick) {

                                    return (tick.id === ticketId);

                                });

                                return ticket[0];

                            });

                    } else {

                        throw "user tickets fetch failed";
                    }

                });

        },

        getTicket: function (ticketId) {

            return fetch(api + "tickets/" + ticketId)
                .then(function (response) {

                    if (response.ok) {

                        return response.json();

                    } else {

                        throw "user tickets fetch failed";
                    }

                });

        },

        getEventTicket: function (eventId, ticketId) {

            return fetch(api + "futureEvents/" + eventId)
                .then(function (response) {

                    if (response.ok) {

                        return response.json()
                            .then(function (event) {

                                var ticket = event["available-tickets"].filter(function (tick) {

                                    return (tick.id === ticketId);

                                });

                                ticket = ticket[0];

                                ticket.event = {
                                    "id": event.id,
                                    "title": event.title,
                                    "venue": event.venue,
                                    "date": event.date,
                                    "city": event.city,
                                    "state": event.state,
                                    "image": event.image
                                };

                                return ticket;

                            });

                    } else {

                        throw "user tickets fetch failed";
                    }

                });

        },

        getUser: function (userId) {

            return fetch(api + "users/" + userId)
                .then(function (response) {

                    if (response.ok) {

                        return response.json();

                    } else {

                        throw "user tickets fetch failed";
                    }

                });

        },

        getFutureEvents: function () {

            return fetch(api + "futureEvents/")
                .then(function (response) {

                    if (response.ok) {

                        return response.json();

                    } else {

                        throw "user tickets fetch failed";
                    }

                });

        },

        getEvent: function (id, future) {

            if (future === undefined) {

                future = true;

            }

            let timeFrame = future ? "futureEvents/" : "pastEvents/";

            return fetch(api + timeFrame + id)
                .then(function (response) {

                    if (response.ok) {

                        return response.json()
                            .then(function (event) {

                                //update the tickets
                                for (var i = 0; i < event["available-tickets"].length; i++) {

                                    event["available-tickets"][i].eventid = event.id;

                                }

                                return event;

                            });

                    } else {

                        throw "user tickets fetch failed";
                    }

                });

        },

        postContact: function (contact) {

            return fetch(api + "contacts/", {
                "method": "POST",
                "cache": 'no-cache',
                "headers": {
                    'content-type': 'application/json'
                },
                "mode": "cors",
                "body": JSON.stringify(contact)
            });

        },

        updateUser: function (user) {

            return fetch({
                "method": "POST",
                "Content-Type": "application/json",
                "body": JSON.stringify(user),
                "url": api + "users/"
            });

        },

        buyTicket: function (ticket) {

            var self = this;

            return self.verifyToken()
                .then(function (token) {

                    return fetch(api + "user/" + token.id + "/tickets/", {
                        "method": "POST",
                        "cache": 'no-cache',
                        "headers": {
                            'content-type': 'application/json'
                        },
                        "mode": "cors",
                        "body": JSON.stringify(ticket)
                    });

                });

        },

        verifyToken: function () {

            return localforage.getItem(authToken)
                .then(function (token) {

                    //temporary
                    //                token = "e2beca0c-609d-4b0b-a2ba-bf42b6194f06";

                    if (token) {

                        pwaTicketAPI.token = token;

                        return token;

                        // } else {

                        //     window.location = "login/";

                    } else {

                        window.location.href = "login";
                    }

                });

        },

        login: function (credentials) {

            return fetch(api +
                    "users/?userName=" +
                    credentials.username +
                    "&password=" + credentials.password)
                .then(function (response) {

                    if (response.ok) {

                        return response.json()
                            .then(function (token) {

                                if (token.length > 0) {

                                    return saveAuthToken(token[0]);

                                }

                            });

                    } else {

                        throw "user tickets fetch failed";
                    }

                });

        },

        logout: function () {

            localforage.removeItem(authToken)
                .then(function () {

                    window.location.href = "login";

                });

        }

    };

})();