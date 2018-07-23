const fs = require("fs"),
    path = require("path"),
    faker = require("faker"),
    ba64 = require("ba64"),
    utils = require("./utils"),
    qr = require('qr-encode'),
    qrCodePath = path.resolve("../www/public/barcodes/"),
    utf8 = "utf-8";

const venues = [
        "concert-1.jpg",
        "concert-2.jpg",
        "concert-3.jpg",
        "concert-4.jpg",
        "stadium-1.jpg",
        "stadium-2.jpg",
        "stadium-3.jpg",
        "stadium-4.jpg"
    ],
    mugshots = [
        "avtar-1.jpg",
        "avtar-2.jpg",
        "avtar-3.jpg",
        "avtar-4.jpg",
        "avtar-5.jpg",
        "avtar-6.jpg",
        "avtar-7.jpg",
        "avtar-8.jpg"
    ];

//read content/article
let db = fs.readFileSync(path.resolve("../db.json"), utf8);

db = JSON.parse(db);

//fake events

db.futureEvents = [];
db.pastEvents = [];
db.tickets = [];
db.users = [];
db.contacts = [];

let count = 0;


function getClaims() {

    return {

    };

}

function generateBarCode(id) {

    let dataURI = qr(id, {
        type: 6,
        size: 6,
        level: 'Q'
    });

    //    fs.writeFileSync(qrCodePath + "/" + id + ".gif", dataURI, 'base64');

    ba64.writeImageSync(qrCodePath + "/" + id, dataURI);

    return id + ".gif";
}

function generateEvents(future) {

    let eventCount = faker.random.number(100) + 10;
    let events = [];

    future = !!future;

    for (let count = 0; count < eventCount; count++) {

        let venue = faker.random.number(8) - 1;

        if (venue < 0) {
            venue = 0;
        }

        if (venue > 7) {
            venue = 7;
        }
    
        let event = {
            "id": faker.random.uuid(),
            "image": venues[venue],
            "date": future ? faker.date.future().toDateString() : faker.date.past().toDateString(),
            "venue": faker.company.companyName(),
            "title": faker.commerce.productName(),
            "city": faker.address.city(),
            "state": faker.address.state(),
            "tickets": []
        }

        event["available-tickets"] = future ? getAvailableTickets(event) : [];

        events.push(event);

    }

    return events;

}

function getRandomEvent(future) {

    let event;

    if (future) {

        event = db.futureEvents[faker.random.number(db.futureEvents.length - 1)];

    } else {

        event = db.pastEvents[faker.random.number(db.pastEvents.length - 1)];

    }

    return Object.assign({}, event);

}

function getAvailableTickets(event) {

    let ticketCount = faker.random.number(20);
    let tickets = [];

    for (let count = 0; count < ticketCount; count++) {

        let ticket = Object.assign({}, getTicket(event));

        delete ticket.event;

        tickets.push(ticket);

    }

    return tickets;

}

function getTicket(event) {

    let _event = Object.assign({}, event);

    let id = faker.random.uuid();

    delete _event["available-tickets"];

    let ticket = {
        "id": id,
        "event": _event,
        "date": _event.date,
        "price": faker.commerce.price(),
        "barcode": generateBarCode(id),
        "section": Math.abs(faker.random.number(400) - 100),
        "row": Math.random().toString(36).replace(/[^a-z]+/g, '')[0].toUpperCase(),
        "seat": faker.random.number(36) + 1
    };


    return ticket;

}

function generateUserTickets(user) {

    let ticketCount = faker.random.number(20);
    let tickets = [];

    for (let count = 0; count < ticketCount; count++) {

        let future = faker.random.boolean();
        let event = getRandomEvent(future);

        let ticket = Object.assign({}, getTicket(event));

        delete ticket.event.tickets;
        delete ticket.user;

        addTicketToEvent(ticket, event, future);

        let user_ticket = Object.assign({}, ticket);

        let _user = Object.assign({}, user);

        delete _user.tickets;

        user_ticket.user = _user;

        db.tickets.push(user_ticket);

        //        delete ticket.event.tickets;

        tickets.push(ticket);

    }

    return tickets;

}

function addTicketToEvent(ticket, event, future) {

    console.log(event);
    console.log(event.tickets);

    let _ticket = Object.assign({}, ticket);

    delete _ticket.event;

    event.tickets.push(_ticket);

    if (future) {

        for (let count = 0; count < db.futureEvents.length; count++) {

            if (db.futureEvents[count].id = event.id) {

                db.futureEvents[count].tickets.push(ticket);
                count = db.futureEvents.length;

            }

        }

    } else {

        for (let count = 0; count < db.pastEvents.length; count++) {

            if (db.pastEvents[count].id = event.id) {

                db.pastEvents[count].tickets.push(ticket);
                count = db.pastEvents.length;

            }

        }

    }

}

//clean bar codes

utils.removeDirForce(qrCodePath + "/");
utils.MakeDirectory(qrCodePath);

db.pastEvents = generateEvents(false);
db.futureEvents = generateEvents(true);


//fake users
for (count = 0; count < faker.random.number(100); count++) {

    let mugshot = faker.random.number(8) - 1;

    if (mugshot < 0) {
        mugshot = 0;
    }

    if (mugshot > 7) {
        mugshot = 7;
    }

    let user = {
        "id": faker.random.uuid(),
        "firstName": faker.name.firstName(),
        "lastName": faker.name.lastName(),
        "mugshot": mugshots[mugshot],
        "userName": faker.internet.userName(),
        "password": faker.internet.password(),
        "streetAddress": faker.address.streetAddress(),
        "city": faker.address.city(),
        "state": faker.address.state(),
        "zipCode": faker.address.zipCode(),
        "email": faker.internet.email(),
        "phoneNumber": faker.phone.phoneNumber()
    }

    user.tickets = generateUserTickets(user);

    db.users.push(user);

}



fs.writeFileSync(path.resolve("../db.json"), JSON.stringify(db), utf8);