const Env = require('../Env.js').Env;
const util = require('util');

function Martingale(matchbookApi, symfonyApi) {
    this.events = [];
    this.matchbookApi = matchbookApi;
    this.loss = 0;
    this.betAmount = 1;//EUR min 2
    this.startBefore = 1200;//TODO change
    this.startAfter = 600;//TODO change
    this.maxGlobalOdd = 1.02;//1.02 //TODO change
    this.lowLimitOdd = 0.85;
    this.highLimitOdd = 0.95;
    this.minAmountMatchbook = 0.1;//EUR

    this.start = function () {
        const $this = this;
        $this.findEvents();
    };

    this.findEvents = function () {
        const $this = this;
        // console.log("Live Betting finding events ...");
        const now = parseInt(new Date().getTime() / 1000);
        const data = [
            {name: "sport-ids", value: 24735152712200},
            {name: "after", value: now},
        ];
        $this.matchbookApi.getEventsView(data, function (events) {
            events.events.map(function (event) {
                const start = parseInt(new Date(event.start).getTime() / 1000);
                if (start - now < $this.startBefore && start - now > $this.startAfter) {
                    if (typeof $this.events.find(x => x.id === event.id) === "undefined") {
                        $this.events.push({
                            id: event.id,
                            name: event.name,
                            start: parseInt(new Date(event.start).getTime() / 1000),
                            offer: null,
                            runners: [],
                        });
                        event.markets[0].runners.map(function (runner) {
                            const $thisEvent = $this.events.find(x => x.id === event.id);
                            if (typeof $thisEvent !== "undefined" && runner.status === "open") {
                                $thisEvent.runners.push({
                                    name: runner.name,
                                    id: runner.id,
                                    odds: {},
                                });
                            } else {
                                console.log("error new created event not found");
                            }
                        });
                    }
                }
            });
            if ($this.events.filter(event => event.offer === null).length > 0) {
                const eventsToBet = events.events.filter(function (event) {
                    if ($this.events.find(x => x.id === event.id) && event.offer === null) {
                        return event;
                    }
                });
                console.log("Adding " + eventsToBet.length + " new events", eventsToBet.map(x => x.name));
                $this.autoBet(eventsToBet);
            } else {
                // console.log("Adding 0 new event");
            }
        }, true);
        setTimeout(function () {
            $this.findEvents();
        }, 60 * 1000);//5min
    };

    this.autoBet = function (events = null) {
        const $this = this;
        $this.autoBetIsRunning = true;
        if (events === null) {
            const data = [];
            $this.events.map(function (event) {
                data.push(event.id);
            });
            $this.matchbookApi.getEventsId(data, function (eventsWS) {
                $this.addNewDatas(eventsWS);
            }, true);
        } else {
            $this.addNewDatas(events);
        }
        if ($this.events.length > 0) {
            setTimeout(function () {
                $this.autoBet();
            }, 2000);
        } else {
            $this.autoBetIsRunning = false;
        }
    };

    this.addNewDatas = function (events) {
        const $this = this;
        const now = parseInt(new Date().getTime() / 1000);
        if (Array.isArray(events)) {
            events.map(function (event) {
                const $thisEvent = $this.events.find(x => x.id === event.id);
                if (typeof $thisEvent !== "undefined") {
                    const time = now - $thisEvent.start;
                    event.markets[0].runners.map(function (runner) {
                        const $thisRunner = $thisEvent.runners.find(x => x.id === runner.id);
                        if (typeof $thisRunner !== "undefined") {
                            const back = runner.prices.find(x => x.side === "back");
                            let newData = {
                                time: time,
                            };
                            if (typeof back !== "undefined") {
                                newData.back = back.odds;
                                newData.amount = back["available-amount"];
                                $thisRunner.odds = newData;
                            }
                        }
                    });
                } else {
                    console.log("error new created event not found 2");
                }
            });
        }
        $this.bet(true);
    };

    this.bet = function (dev = false) {
        const $this = this;
        const now = parseInt(new Date().getTime() / 1000);
        $this.events.map(function (event) {
            if (event.offer === null) {
                event.runners = event.runners.sort((a, b) => (a.odds.back > b.odds.back) ? 1 : ((b.odds.back > a.odds.back) ? -1 : 0));
                let globalOdd = 0;
                let limitOdd = 0;
                const indexToBet = [];
                event.runners.map(function (runner, indexRunner) {
                    if (runner.odds.back > 1) {
                        globalOdd += 1 / runner.odds.back;
                        if (limitOdd + (1 / runner.odds.back) < $this.highLimitOdd) {
                            limitOdd += 1 / runner.odds.back;
                            indexToBet.push(indexRunner);
                        }
                    }
                });
                if (globalOdd < $this.maxGlobalOdd && limitOdd > $this.lowLimitOdd && event.start - now > $this.startAfter) {
                    const arrayOdds = [];
                    const arrayBets = [];
                    let multiplier = 0;
                    event.runners.map(function (runner, indexRunner) {
                        if (indexToBet.includes(indexRunner)) {
                            arrayOdds.push({
                                runnerId: runner.id,
                                percent: 1 / runner.odds.back,
                                odds: runner.odds.back,
                            });
                            multiplier += 1 / runner.odds.back;
                        }
                    });
                    multiplier = 1 / multiplier;
                    let redistribution = 0;
                    arrayOdds.map(function (el) {
                        const bet = (el.percent * multiplier) * ($this.betAmount + $this.loss);
                        if (bet >= $this.minAmountMatchbook) {
                            arrayBets.push({
                                runnerId: el.runnerId,
                                stack: bet,
                                odds: el.odds,
                            });
                        } else {
                            redistribution += bet;
                        }
                    });
                    if (arrayBets.length > 0) {
                        //redistribue les paris en dessous de 0.1 car pas possible sur matchbook
                        $this.redistribution(arrayBets, redistribution, function (arrayBets) {
                            console.log(arrayBets);
                            $this.back(event, arrayBets, function (result) {

                            });
                        });
                    }
                }
            }
        });
    };

    this.back = function (event, array, callback) {
        const $this = this;
        const submitOffers = {
            "odds-type": "DECIMAL",
            "exchange-type": "back-lay",
            "offers": []
        };
        array.map(function (bet) {
            submitOffers["offers"].push({
                "runner-id": bet.runnerId,
                "side": "back",
                "odds": bet.odds,
                "stake": parseInt((bet.stack * 100)) / 100,
                "keep-in-play": true
            });
        });
        console.log(submitOffers["offers"]);
        // $this.matchbookApi.submitOffers(submitOffers, function (result) {
        //     if (result !== false) {
        //         event.offer = result;
        //         callback(true);
        //     } else {
        //         callback(false);
        //     }
        // });
    };

    this.redistribution = function (array, value, callback) {
        if (value > 0) {
            array.map(function (bet) {
                bet.stack = bet.stack + (bet.stack * (value));
            });
            callback(array);
        } else {
            callback(array);
        }
    }
}

module.exports = {
    Martingale,
};