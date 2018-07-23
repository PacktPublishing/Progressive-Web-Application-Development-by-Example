

class DateManager{

    constructor(){}

        /*
        simple conversion function to ensure we have a valid date
        assuming this is within our service worker. Formats should be limited to
        undefined, Date (object), object, string and number.
    */
    static ensureDateType(value) {

        //maybe switch to switch statement????

        if (!value) {
            return new Date();
        }

        if (Object.prototype.toString.call(value) === "[object Date]") {
            return value;
        }

        //convert to date
        if (typeof value === "object") {
            return new Date(value);
        }

        if (typeof value === "string") {
            value = parseInt(value);
        }

        //assume the number is the number of seconds to live before becoming stale
        if (typeof value === "number") {
            return new Date(Date.now() + value);
        }

        return value;

    }

    /*
        data comparison function
        calls ensureDateType for each date value
        returns is the first date value is less than the second date value
        in the context of the service worker we are looking for a TTL (1st value) to be less than
        the current time. If so then the logic should trigger an update
    */
    static compareDates(date1, date2) {

        date1 = this.ensureDateType(date1);
        date2 = this.ensureDateType(date2);

        return (date1 < date2);

    }


    static addSecondsToDate(t, seconds){

        return new Date(t.setSeconds(t.getSeconds() + seconds));

    }

}