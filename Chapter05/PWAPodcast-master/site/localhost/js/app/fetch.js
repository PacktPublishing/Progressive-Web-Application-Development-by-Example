(function () {
    
        function renderResult(results) {
    
            var fetchResults = document.querySelector('.fetch-results');
    
            fetchResults.innerHTML = "<p>" + results + "</p>";
    
        }
    
        function fetchText(term) {
    
            fetch("api/simple.txt")
                .then(function (response) {
    
                    if (response.status !== 200) {     
                        console.log('Looks like there was a problem. Status Code: ' +       response.status);     
                        return;    
                    }   
    
                    return response.text();

                })
                .then(function(result){
                    renderResult(result);
                })
                .catch(function (err) {
                    console.log('Fetch Error :-S', err);
                });
    
        }
    
        fetchText();
    
    })();