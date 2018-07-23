//On user interaction

var btn = document.querySelector(".btn-contact-submit"),
	src = "api/contact.json";

btn.addEventListener("click", function (event) { 
	event.preventDefault();

	fetch(src).then(function (response) {    // /get-article-urls returns a JSON-encoded array of
		    // resource URLs that a given article depends on

		return caches.open("dynamic-cache-v2").then(function (cache) {

			cache.put(src, response.clone());   

		}).then(function () {

			return response.json();  

		});

	}); 

});

/*

fetch("https://7g46i3t1el.execute-api.us-east-1.amazonaws.com/demo/contact", {
	method: "POST", 
	mode: "cors", 
	redirect: "follow",
	headers: new Headers({
		"Content-Type": "application/json"
	}),
	body: JSON.stringify({
		"email": "contactor@gmail.com",
		"answer": "hello world"
	})
}).then(function(response) { 

    // handle response

	response.json().then(function(data){

	    console.log(data);

	});

});

*/