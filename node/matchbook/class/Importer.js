const Env = require('../Env.js').Env;
const Event = require('./Event.js').Event;
const util = require('util');

function Importer(matchbookApi, symfonyApi) {
    this.eventsToImport = [];
    this.matchbookApi = matchbookApi;
    this.symfonyApi = symfonyApi;
    this.autoImportConfig = Env.AUTO_IMPORT_CONFIF;

    this.init = function () {
        const $this = this;
        const resetTime = Math.max.apply(Math, $this.autoImportConfig.map(function (o) {
            return o.updateTime;
        }));
        const reImportTime = Math.min.apply(Math, $this.autoImportConfig.map(function (o) {
            return o.updateTime;
        }));
        $this.autoImportEvent(0, $this.autoImportConfig, resetTime, reImportTime);
    };

    this.addImport = function (eventIds, callback) {
        const $this = this;
        $this.matchbookApi.getEventsId(eventIds, function (events) {
            console.log("Adding events to the importer ...");
            let nbAddedEvent = 0;
            events.map(function (event, index) {
                if (typeof $this.eventsToImport.find(x => x.id === event.id) === "undefined") {
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
        const now = parseInt(new Date().getTime() / 1000);
        currentTime += 1;
        const arrayToImport = [];
        config.map(function (x) {
            if (currentTime % x.updateTime === 0) {
                arrayToImport.push(x);
            }
        });
        $this.getEventsToUpdate(arrayToImport, function (eventsToUpdate) {
            if (eventsToUpdate.length > 0) {
                const eventsToUpdateId = eventsToUpdate.map(x => x.id);
                $this.matchbookApi.getEventsId(eventsToUpdateId, function (events) {
                    let nbEventsSave = 0;
                    events.map(function (event, index) {
                        const eventToUpdate = eventsToUpdate.find(x => x.id === event.id);
                        if (typeof eventToUpdate !== "undefined") {
                            const time = now - eventToUpdate.start;
                            eventToUpdate.update(event, time, function (result) {
                                if (result === true) {
                                    nbEventsSave++;
                                } else {
                                    $this.saveEvent(eventToUpdate);
                                }
                            });
                        }
                    });
                    console.log(nbEventsSave + " events auto updated !");
                });
            }
        });
        if (currentTime >= resetTime) {
            currentTime = 0;
        }
        setTimeout(function () {
            $this.autoImportEvent(currentTime, config, resetTime, 1);
        }, 1000); //Matchbook API recommend not exceed 60 call per minute
    };

    this.saveEvent = function (event) {
        const $this = this;
        console.log("Start save event ... " + event.id);
        //Sending event to symfonyApi
        const cloneEvent = JSON.parse(JSON.stringify(event));
        $this.symfonyApi.saveEvent(cloneEvent);
        //delete event from eventsToImport
        const index = $this.eventsToImport.findIndex(x => x.id === event.id);
        $this.eventsToImport.splice(index, 1);
        console.log("event " + cloneEvent.id + " deleted from eventsToImport");
    };

    this.getEventsToUpdate = function (arrayToImport, callback) {
        const $this = this;
        const now = parseInt(new Date().getTime() / 1000);
        const events = $this.eventsToImport.filter(function (event) {
            const diff = event.start - now;
            if (typeof arrayToImport.find(x => diff >= x.from && diff < x.to) !== "undefined") {
                return event;
            }
        });
        callback(events);
    };
}

module.exports = {
    Importer,
};