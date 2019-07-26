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
            events.events = events.events.filter(x => x["allow-live-betting"] === true);
            if ((typeof events !== "undefined" && events.events.length > 0) || $this.events.length > 0) {
                const eventStart = parseInt(new Date(events.events[0].start).getTime() / 1000);
                if (now - eventStart < 600) {
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
            } else {
                setTimeoutS = 60 * 1000;
                setTimeout(function () {
                    $this.watch();
                }, setTimeoutS);
            }
        }, true);
    };

    this.updateThisEvents = function (events, now, callback) {
        const $this = this;
        const indexToDelete = [];
        $this.events.map(function (myEvent, indexEvent) {
            const event = events.find(x => x.id === myEvent.id);
            const time = myEvent.start - now;
            // FOR DEV
            let name = "undefined";
            if (typeof event !== "undefined") name = event.name;
            console.log(time, event, time, typeof event !== "undefined", event.status === "open");
            // FOR DEV
            if (typeof event !== "undefined" && event.status === "open") {
                if (time < 1) {
                    myEvent.runners.map(function (myRunner) {
                        const market = event.markets[0];
                        if (typeof market !== "undefined") {
                            const runner = market.runners.find(x => x.id === myRunner.id);
                            let push = {
                                time: time,
                                back: null,
                                back2: null,
                                lay: null,
                                lay2: null,
                            };
                            if (typeof runner !== "undefined") {
                                const backs = runner.prices.filter(x => x.side === "back");
                                const lays = runner.prices.filter(x => x.side === "lay");
                                if (backs.length > 0) {
                                    const back = backs.reduce(function (prev, current) {
                                        return (prev.odds > current.odds) ? prev : current
                                    });
                                    const back2 = backs.reduce(function (prev, current) {
                                        return (prev.odds < current.odds) ? prev : current
                                    });
                                    if (typeof back !== "undefined") {
                                        push.back = back.odds;
                                    }
                                    if (typeof back2 !== "undefined") {
                                        push.back2 = back2.odds;
                                    }
                                }
                                if (lays.length > 0) {
                                    const lay = lays.reduce(function (prev, current) {
                                        return (prev.odds < current.odds) ? prev : current
                                    });
                                    const lay2 = lays.reduce(function (prev, current) {
                                        return (prev.odds > current.odds) ? prev : current
                                    });

                                    if (typeof lay !== "undefined") {
                                        push.lay = lay.odds;
                                    }
                                    if (typeof lay2 !== "undefined") {
                                        push.lay2 = lay2.odds;
                                    }
                                }
                                myRunner.prices.push(push);
                            } else {
                                myRunner.prices.push(push);
                            }
                        }
                    });
                }
            } else {
                indexToDelete.push(indexEvent);
            }
        });
        indexToDelete.map(function (index) {
            const eventToSave = JSON.parse(JSON.stringify($this.events[index]));
            $this.events.splice(index, 1);
            $this.saveEvent(eventToSave);
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
            if (eventStart - now > 5 && eventStart - now < 600 && event["allow-live-betting"] === true) {
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