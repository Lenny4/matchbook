const Env = require('../Env.js').Env;
const util = require('util');
const RSI = require('technicalindicators').RSI;

function LiveBetting(matchbookApi, symfonyApi) {
    this.events = [];
    this.isRunning = false;
    this.matchbookApi = matchbookApi;
    this.autoBetIsRunning = false;
    this.symfonyApi = symfonyApi;
    this.autoImportConfig = Env.AUTO_IMPORT_CONFIF;

    this.start = function (callback) {
        const $this = this;
        console.log("Start live betting ...");
        if ($this.isRunning === false) {
            $this.isRunning = true;
            $this.findEvents();
        }
        callback(true);
    };

    this.findEvents = function () {
        const $this = this;
        console.log("Live Betting finding events ...");
        const now = parseInt(new Date().getTime() / 1000);
        const data = [
            {name: "sport-ids", value: 24735152712200},
            {name: "after", value: now},
        ];
        $this.matchbookApi.getEventsView(data, function (events) {
            events.events.map(function (event) {
                const start = parseInt(new Date(event.start).getTime() / 1000);
                if (start - now < 3600 && start - now > 1400) {
                    if (typeof $this.events.find(x => x.id === event.id) === "undefined") {
                        $this.events.push({
                            id: event.id,
                            name: event.name,
                            start: parseInt(new Date(event.start).getTime() / 1000),
                            runners: [],
                        });
                        event.markets[0].runners.map(function (runner) {
                            const $thisEvent = $this.events.find(x => x.id === event.id);
                            if (typeof $thisEvent !== "undefined") {
                                $thisEvent.runners.push({
                                    name: runner.name,
                                    id: runner.id,
                                    odds: [],
                                    bets: [],
                                    lastValue: -1,
                                });
                            } else {
                                console.log("error new created event not found");
                            }
                        });
                    }
                }
            });
            if ($this.events.length > 0 && $this.autoBetIsRunning === false) {
                const eventsToBet = events.events.filter(function (event) {
                    if ($this.events.find(x => x.id === event.id)) {
                        return event;
                    }
                });
                console.log("Adding " + eventsToBet.length + " new events", eventsToBet.map(x => x.name));
                $this.autoBet(eventsToBet);
            } else {
                console.log("Adding 0 new event");
            }
        }, true);
        setTimeout(function () {
            $this.findEvents();
        }, 300 * 1000);//5min
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
            }, 1000);
        } else {
            $this.autoBetIsRunning = false;
        }
    };

    this.addNewDatas = function (events) {
        const $this = this;
        const now = parseInt(new Date().getTime() / 1000);
        events.map(function (event) {
            const $thisEvent = $this.events.find(x => x.id === event.id);
            const time = now - $thisEvent.start;
            if (typeof $thisEvent !== "undefined") {
                event.markets[0].runners.map(function (runner) {
                    const $thisRunner = $thisEvent.runners.find(x => x.id === runner.id);
                    if (typeof $thisRunner !== "undefined") {
                        const back = runner.prices.find(x => x.side === "back");
                        const lay = runner.prices.find(x => x.side === "lay");
                        let newData = {
                            time: time,
                        };
                        if (typeof lay !== "undefined") {
                            newData.lay = lay.odds;
                        }
                        if (typeof back !== "undefined") {
                            newData.back = back.odds;
                            $thisRunner.odds.push(newData);
                        }
                    }
                });
            } else {
                console.log("error new created event not found 2");
            }
        });
        $this.bet(true);
    };

    this.bet = function (dev = false) {
        const $this = this;
        const now = parseInt(new Date().getTime() / 1000);
        $this.events.map(function (event, indexEvent) {
            const start = parseInt(new Date(event.start).getTime());
            event.runners.map(function (runner, indexRunner) {
                // if (indexRunner === 0 && indexEvent === 0 && dev) {
                const inputRSI = {
                    values: [],
                    period: 28
                };
                runner.odds.map(function (odds) {
                    inputRSI.values.push(odds.back);
                });
                const arrayToChart = RSI.calculate(inputRSI);
                if (arrayToChart.length > 1) {
                    const lastValue = runner.lastValue;
                    const value = arrayToChart[arrayToChart.length - 1];
                    // console.log("========================================================");
                    // console.log(runner.name, lastValue, value);
                    if ((value > 80 || value < 20) && lastValue !== value) {
                        const lastOdd = runner.odds[runner.odds.length - 1];
                        const backOdd = lastOdd.back;
                        const layOdd = lastOdd.lay;
                        const time = lastOdd.time;
                        if (typeof time !== "undefined") {
                            if ((backOdd < 12) && (runner.lastValue !== -1) && (backOdd / layOdd >= 0.95) && (time > -1400)) {
                                if (value < 20 && lastValue > 80) {
                                    //down => back
                                    $this.back(runner);
                                } else if (value > 80 && lastValue < 20) {
                                    //up => lay
                                    $this.lay(runner);
                                }
                            }
                        }
                        runner.lastValue = value;
                    }
                }
                // }
            });
            if (now - start > -1) {
                $this.remove(event.id);
            }
        });
        // console.log(util.inspect($this.events, false, null, true));
    };

    this.back = function (runner, callback = null) {
        const $this = this;
        if (runner.odds[runner.odds.length - 1].type === "lay") {
            runner.bets.push({
                type: "back",
                odd: runner.odds[runner.odds.length - 1].back,
                time: runner.odds[runner.odds.length - 1].time,
            });
            //TODO add function submit offer
        }
        if (callback !== null) callback();
    };

    this.lay = function (runner, callback = null) {
        const $this = this;
        if (runner.odds[runner.odds.length - 1].type === "back") {
            runner.bets.push({
                type: "lay",
                odd: runner.odds[runner.odds.length - 1].lay,
                time: runner.odds[runner.odds.length - 1].time,
            });
            //TODO add function submit offer
        }
        if (callback !== null) callback();
    };

    this.lastBet = function (runner, callback) {
        const $this = this;
        if (runner.odds[runner.odds.length - 1].type === "lay") {
            $this.back(runner, function () {
                callback();
            });
        } else {
            $this.lay(runner, function () {
                callback();
            });
        }
    };

    this.remove = function (eventId) {
        const $this = this;
        const index = $this.events.findIndex(event => event.id === eventId);
        console.log("=============================REMOVE=============================");
        console.log("=============================REMOVE=============================");
        console.log("=============================REMOVE=============================");
        console.log($this.events[index].name);
        $this.events[index].runners.map(function (runner) {
            if (runner.bets.length % 2 !== 0) {
                $this.lastBet(runner, function () {
                    if (runner.bets.length > 0) {
                        console.log(runner.name);
                        console.log(runner.bets);
                        console.log("==========================================================");
                    }
                });
            } else {
                if (runner.bets.length > 0) {
                    console.log(runner.name);
                    console.log(runner.bets);
                    console.log("==========================================================");
                }
            }
        });
        $this.events.splice(index, 1);
    };

    this.stop = function () {
        const $this = this;
        $this.events = [];
    };
}

module.exports = {
    LiveBetting,
};