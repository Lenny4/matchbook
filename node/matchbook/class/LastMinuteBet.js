const Env = require('../Env.js').Env;
const util = require('util');

function LastMinuteBet(matchbookApi, symfonyApi, saveData = false) {
    this.matchbookApi = matchbookApi;
    this.symfonyApi = symfonyApi;
    this.saveData = saveData;
    this.events = [];

    this.watch = function () {
        const $this = this;
        const now = parseInt(new Date().getTime() / 1000);
        const nowTimeOut = new Date().getTime();
        let setTimeoutS = 1000;//s
        const data = [
            {name: "sport-ids", value: 24735152712200},
            {name: "after", value: (now - 1200)},
        ];
        $this.matchbookApi.getEventsView(data, function (events) {
            if (typeof events !== "undefined" && events.total > 0) {
                $this.addEventsToThisEvents(events.events, now, function () {
                    $this.updateThisEvents(events.events, now, function () {
                        // console.log(util.inspect($this.events, false, null, true));


                        //watch again
                        const beforeTimeOut = new Date().getTime();
                        setTimeoutS = setTimeoutS - (beforeTimeOut - nowTimeOut);
                        if (setTimeoutS < 0) {
                            setTimeoutS = 0;
                        }
                        setTimeout(function () {
                            $this.watch();
                        }, setTimeoutS);
                    });
                });
            } else {
                if (typeof events !== "undefined" && events.total === 0) {
                    setTimeoutS = 1000 * 600;
                }
                setTimeout(function () {
                    $this.watch();
                }, setTimeoutS);
            }
        }, true);
    };

    this.updateThisEvents = function (events, now, callback) {
        const $this = this;
        $this.events.map(function (myEvent, indexEvent) {
            const event = events.find(x => x.id === myEvent.id);
            const time = myEvent.start - now;
            if (typeof event !== "undefined" && event.status === "open") {
                if (time < 10) {
                    myEvent.runners.map(function (myRunner) {
                        const runner = event.markets[0].runners.find(x => x.id === myRunner.id);
                        let push = {
                            time: time,
                            back: 0,
                            lay: 0,
                        };
                        if (typeof runner !== "undefined") {
                            const back = runner.prices.find(x => x.side === "back");
                            const lay = runner.prices.find(x => x.side === "lay");
                            if (typeof back !== "undefined") {
                                push.back = back.odds;
                            }
                            if (typeof lay !== "undefined") {
                                push.lay = lay.odds;
                            }
                            myRunner.prices.push(push);
                        } else {
                            myRunner.prices.push(push);
                        }
                    });
                }
            } else {
                const eventToSave = JSON.parse(JSON.stringify(myEvent));
                $this.events.splice(indexEvent, 1);
                $this.saveEvent(eventToSave);
            }
        });
        callback();
    };

    this.saveEvent = function (event) {
        const $this = this;
        if ($this.saveData === true) {
            $this.symfonyApi.saveEvent(event, true);
        }
    };

    this.addEventsToThisEvents = function (events, now, callback) {
        const $this = this;
        events.map(function (event) {
            const eventStart = parseInt(new Date(event.start).getTime() / 1000);
            if (eventStart - now > 10 && eventStart - now < 600) {
                if (typeof $this.events.find(x => x.id === event.id) === "undefined") {
                    let newEvent = {
                        id: event.id,
                        name: event.name,
                        start: eventStart,
                    };
                    newEvent.runners = [];
                    event.markets[0].runners.map(function (runner) {
                        if (runner.status === "open") {
                            const newRunner = {
                                id: runner.id,
                                name: runner.name,
                                prices: [],
                            };
                            newEvent.runners.push(newRunner);
                        }
                    });
                    if (newEvent.runners.length > 0) {
                        console.log(newEvent.name, "start to record soon");
                        $this.events.push(newEvent);
                    }
                }
            }
        });
        callback();
    };
}

module.exports = {
    LastMinuteBet,
};