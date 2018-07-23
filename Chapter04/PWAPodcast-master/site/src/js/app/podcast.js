function getCategoryById(id) {

    if (!id) {
        console.log("missing product id");
        return;
    }

    fetch("./api/categories/" + id + ".json")  
        .then(   function (response) {    
            if (response.status !== 200) {     
                console.log('Looks like there was a problem. Status Code: ' +       response.status);     
                return;    
            }   

            console.log(response.headers.get('Content-Type'));   
            console.log(response.headers.get('Date'));

            console.log(response.status);   
            console.log(response.statusText);   
            console.log(response.type);   
            console.log(response.url);

            response.text().then(function (response) {
                console.log(response);
            });   
        }).catch(function (err) {   
            console.log('Fetch Error :-S', err);  
        });

}


getCategoryById(getParameterByName("category"));