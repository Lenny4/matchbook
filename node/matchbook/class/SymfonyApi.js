const Const = require('../Const.js').Const;
const request = require('request');
const util = require('util');

function SymfonyApi() {
    this.saveEventUrl = Const.SYMFONY_SAVE_EVENT;

    this.saveEvent = function (event) {
        const $this = this;
        console.log("Sending " + event.id + " event to " + $this.saveEventUrl);
        // console.log(util.inspect(event, false, null, true));
        // console.log(util.inspect(JSON.stringify(event), false, null, true));
        $this.request({
                id: event.id,
                name: event.name,
                start: event.start,
                'sport-id': event['sport-id'],
                event: JSON.stringify(event),
            }, $this.saveEventUrl, function (err, httpResponse, body) {
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
        )
        ;
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
}

module.exports = {
    SymfonyApi,
};