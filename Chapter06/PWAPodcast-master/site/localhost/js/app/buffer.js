(function () {


    var audioCtx = new(window.AudioContext || window.webkitAudioContext)(),
        source,
        play = document.querySelector('.play'),
        stop = document.querySelector('.stop');


    // use fetch to load an audio track, and
    // decodeAudioData to decode it and stick it in a buffer.
    // Then we put the buffer into the source
    function getData() {
        source = audioCtx.createBufferSource();

        fetch('./viper.ogg')
            .then(function (response) {
                return response.arrayBuffer();
            })
            .then(function (buffer) {
                audioCtx.decodeAudioData(buffer, function (decodedData) {
                    source.buffer = decodedData;
                    source.connect(audioCtx.destination);
                });
            });
    };

    // wire up buttons to stop and play audio
    play.onclick = function () {
        getData();
        source.start(0);
        play.setAttribute('disabled', 'disabled');
    }

    stop.onclick = function () {
        source.stop(0);
        play.removeAttribute('disabled');
    }


})();