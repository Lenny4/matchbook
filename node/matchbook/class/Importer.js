const Env = require('../Env.js').Env;
const Event = require('./Event.js').Event;
const util = require('util');

function Importer(matchbookApi) {
    this.eventsToImport = [];
    this.matchbookApi = matchbookApi;
    this.autoImportConfig = Env.AUTO_IMPORT_CONFIF;

    this.init = function () {
        const $this = this;
        const resetTime = Math.max.apply(Math, $this.autoImportConfig.map(function (o) {
            return o.updateTime;
        }));
        const reImportTime = Math.min.apply(Math, $this.autoImportConfig.map(function (o) {
            return o.updateTime;
        }));
        $this.autoImportEvent(1, $this.autoImportConfig, resetTime, reImportTime);
    };

    this.addImport = function (eventIds, callback) {
        const $this = this;
        $this.matchbookApi.getEventsId(eventIds, function (events) {
            console.log("Adding events to the importer ...");
            let nbAddedEvent = 0;
            events.map(function (event, index) {
                if (typeof $this.eventsToImport.find(x => x.id === event.id) === "undefined" && index === 0) {
                    const newEvent = new Event();
                    newEvent.init(event, function (result) {
                        if (result === true) {
                            $this.eventsToImport.push(newEvent);
                            nbAddedEvent++;
                        }
                    });
                }
            });
            console.log(nbAddedEvent + " events added to importer !");
        });
        callback(true);
    };

    this.autoImportEvent = function (currentTime, config, resetTime) {
        const $this = this;
        currentTime += 1;
        const arrayToImport = [];
        config.map(function (x) {
            if (currentTime % x.updateTime === 0) {
                arrayToImport.push(x);
            }
        });
        //TODO with arrayToImport update the good $this.eventsToImport (need to call API)
        // console.log(arrayToImport);
        // console.log(util.inspect($this.eventsToImport, false, null, true));
        if (currentTime >= resetTime) {
            currentTime = 1;
        }
        setTimeout(function () {
            $this.autoImportEvent(currentTime, config, resetTime, 1);
        }, 1000); //Matchbook API recommend not exceed 60 call per minute
    }
}

module.exports = {
    Importer,
};