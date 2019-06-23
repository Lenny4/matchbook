const Const = require('../Const.js').Const;
const request = require('request');

function SymfonyApi() {
    this.saveEventUrl = Const.SYMFONY_SAVE_EVENT;

    this.saveEvent = function (event) {
        const $this = this;
        console.log("Sending " + event.id + " event to " + $this.saveEventUrl);
        $this.request({
                id: event.id,
                name: event.name,
                start: event.start,
                'sport-id': event['sport-id'],
                event: event
            }, $this.saveEventUrl, function (err, httpResponse, body) {
                if (typeof httpResponse !== "undefined" && typeof httpResponse.statusCode !== "undefined" && httpResponse.statusCode === 200) {
                    console.log(event.id + " has been added to database !");
                } else {
                    console.log("Error while saving " + event.id, err);
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