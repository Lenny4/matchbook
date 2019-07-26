const Const = require('../Const.js').Const;
const request = require('request');
const util = require('util');

function SymfonyApi() {
    this.saveEventUrl = Const.SYMFONY_SAVE_EVENT;
    this.getEventUrl = Const.SYMFONY_GET_EVENT;

    this.saveEvent = function (event, afterRace = false) {
        const $this = this;
        console.log("Sending " + event.name + " event to " + $this.saveEventUrl);
        let data = {
            id: event.id,
            name: event.name,
            start: event.start,
            afterRace: afterRace,
            event: JSON.stringify(event),
        };
        if (typeof event['sport-id'] !== "undefined") {
            data['sport-id'] = event['sport-id'];
        }
        $this.request(data, $this.saveEventUrl, function (err, httpResponse, body) {
                if (typeof httpResponse !== "undefined" && typeof httpResponse.statusCode !== "undefined" && httpResponse.statusCode === 200) {
                    console.log(event.id + " has been added to database !", body);
                } else {
                    console.log("Error while saving " + event.id, httpResponse.statusCode);
                    console.log("Start to save again in 30s ...");
                    setTimeout(function () {
                        $this.saveEvent(event);
                    }, 30000)
                }
            }
        );
    };

    this.request = function (data, url, callback) {
        const $this = this;
        request.post({
            url: url,
            form: data
        }, function (err, httpResponse, body) {
            callback(err, httpResponse, body);
        });
    };

    this.getEvent = function (id, callback) {
        const $this = this;
        $this.request({
                id: id,
            }, $this.getEventUrl, function (err, httpResponse, body) {
                const event = JSON.parse(JSON.parse(body));
                callback(event);
            }
        );
    };
}

module.exports = {
    SymfonyApi,
};