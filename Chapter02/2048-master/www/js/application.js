"use strict"; //https://love2dev.com/blog/javascript-strict-mode/

(function () {

  // Wait till the browser is ready to render the game (avoids glitches)
  window.requestAnimationFrame(function () {
    new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
  });



  var deferredPrompt;

  window.addEventListener('beforeinstallprompt', function (e) {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;

    showAddToHomeScreen();

  });

function showAddToHomeScreen() {

  var a2hsBtn = document.querySelector(".ad2hs-prompt");

  a2hsBtn.style.display = "flex";

  a2hsBtn.addEventListener("click", addToHomeScreen);

}

  function addToHomeScreen() {

    var a2hsBtn = document.querySelector(".ad2hs-prompt");

    // hide our user interface that shows our A2HS button
    a2hsBtn.style.display = 'none';

    if (deferredPrompt) {
      // Show the prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice
        .then(function (choiceResult) {

          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
          } else {
            console.log('User dismissed the A2HS prompt');
          }

          deferredPrompt = null;

        });

    }

  }

  showAddToHomeScreen();

  window.addEventListener('appinstalled', function (evt) {
    console.log('a2hs', 'installed');
  });


})();