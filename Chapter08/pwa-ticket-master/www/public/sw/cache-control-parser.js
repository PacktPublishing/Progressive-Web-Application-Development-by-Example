// repurposed from : https://raw.githubusercontent.com/roryf/parse-cache-control/master/index.js

class cacheControl {

    constructor(value) {

        if (typeof value !== 'string') {
            throw "must supply Cache-Control value";
        }

        parseCacheControl(value);

    }

    header = {};

    parseCacheControl(headerValue) {

        /*
            Cache-Control   = 1#cache-directive
            cache-directive = token [ "=" ( token / quoted-string ) ]
            token           = [^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+
            quoted-string   = "(?:[^"\\]|\\.)*"
          */

        //                             1: directive                                        =   2: token                                              3: quoted-string
        const regex = /(?:^|(?:\s*\,\s*))([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)(?:\=(?:([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)|(?:\"((?:[^"\\]|\\.)*)\")))?/g;

        let parser = this;

        headerValue.replace(regex, function ($0, $1, $2, $3) {

            let value = $2 || $3;

            parser.header[$1] = value ? value.toLowerCase() : true;

            return '';
        });

        if (parser.header['max-age']) {

            try {

                let maxAge = parseInt(header['max-age'], 10);

                if (isNaN(maxAge)) {
                    return null;
                }

                parser.header['max-age'] = maxAge;

            } catch (err) {}
        }

    }


    maxAge() {

        return this.header['max-age'];

    }

}