const Env = require('../Env.js').Env;
const util = require('util');

function LastMinuteBet(matchbookApi, symfonyApi, saveData = false) {
    this.matchbookApi = matchbookApi;
    this.symfonyApi = symfonyApi;
    this.saveData = saveData;
    this.events = [];

    this.watch = function () {
        console.log("===================");
        const $this = this;
        const now = parseInt(new Date().getTime() / 1000);
        const nowTimeOut = new Date().getTime();
        let setTimeoutS = 1000;//s
        const data = [
            {name: "sport-ids", value: 24735152712200},
            {name: "after", value: (now - 1200)},
        ];
        console.log(1);
        $this.matchbookApi.getEventsView(data, function (events) {
            console.log(2);
            if (typeof events === "object" && Array.isArray(events.events)) {
                console.log(3);
                events.events = events.events.filter(x => x["allow-live-betting"] === true);
            }
            console.log(4);
            if ((typeof events === "object" && events.events.length > 0) || $this.events.length > 0) {
                console.log(5);
                let eventStart = 0;
                if (typeof events === "object" && events.events.length > 0) {
                    console.log(51);
                    eventStart = parseInt(new Date(events.events[0].start).getTime() / 1000);
                } else {
                    console.log(52);
                    events = {
                        events: [],
                    }
                }
                if ((eventStart - now < 70 && eventStart - now > 5) || $this.events.length > 0) {
                    console.log(6);
                    $this.addEventsToThisEvents(events.events, now, function () {
                        console.log(7);
                        $this.updateThisEvents(events.events, now, function () {
                            console.log(8);
                            const beforeTimeOut = new Date().getTime();
                            console.log(setTimeoutS, beforeTimeOut, nowTimeOut, "before");
                            setTimeoutS = setTimeoutS - (beforeTimeOut - nowTimeOut);
                            console.log(setTimeoutS, "before2");
                            if (setTimeoutS < 0) {
                                setTimeoutS = 0;
                            }
                            setTimeout(function () {
                                console.log(9);
                                $this.watch();
                            }, setTimeoutS);
                        });
                    });
                } else {
                    console.log(10);
                    setTimeoutS = 1000 * 60;
                    console.log("timeOut1", setTimeoutS);
                    setTimeout(function () {
                        $this.watch();
                    }, setTimeoutS);
                }
            } else {
                console.log(13, $this.events.length);
                if (events !== false) setTimeoutS = 60 * 1000;
                console.log("timeOut2", setTimeoutS);
                setTimeout(function () {
                    $this.watch();
                }, setTimeoutS);
            }
        }, true);
    };

    this.updateThisEvents = function (events, now, callback) {
        const $this = this;
        const indexToDelete = [];
        console.log($this.events.length);
        $this.events.map(function (myEvent, indexEvent) {
            const event = events.find(x => x.id === myEvent.id);
            const time = myEvent.start - now;
            if (typeof event !== "undefined") console.log(typeof event, event.status, myEvent.name);
            else console.log(typeof event, myEvent.name);
            if (typeof event !== "undefined" && event.status === "open") {
                if (event["in-running-flag"] === true) {
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
                if (typeof event !== "undefined") {
                    console.log(indexEvent, "index to delete");
                    indexToDelete.push(indexEvent);
                }
            }
        });
        indexToDelete.map(function (index) {
            const eventToSave = JSON.parse(JSON.stringify($this.events[index]));
            console.log("delete", $this.events[index].name);
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
            if (eventStart - now > 5 && eventStart - now < 70 && event["allow-live-betting"] === true) {
                if (typeof $this.events.find(x => x.id === event.id) === "undefined") {
                    let newEvent = {
                        id: event.id,
                        name: event.name,
                        start: eventStart,
                        "category-id": event["category-id"],
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