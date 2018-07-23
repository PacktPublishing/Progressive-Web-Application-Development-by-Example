(function () {

    function renderResults(results) {

        var template = document.getElementById("search-results-template"),
            searchResults = document.querySelector('.search-results');

        if (template && searchResults) {

            searchResults.innerHTML = Mustache.render(template.innerHTML, results);

        }

    }

    function fetchSearch(term) {

        fetch("api/search.json?term=" + term)
            .then(function (response) {

                if (response.status !== 200) {     
                    console.log('Looks like there was a problem. Status Code: ' +       response.status);     
                    return;    
                }   

                return response.json();

            }).then(function (results) {

                renderResults(results);

            })
            .catch(function (err) {
                console.log('No CORS Fetch Error :-S', err);
            });

    }

    fetchSearch(utils.getParameterByName("term"));

})();