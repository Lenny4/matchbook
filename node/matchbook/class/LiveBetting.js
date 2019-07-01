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
                            start: parseInt(new Date(event.start).getTime() / 1000),
                            bets: [],
                        });
                        event.markets[0].runners.map(function (runner) {
                            const $thisEvent = $this.events.find(x => x.id === event.id);
                            if (typeof $thisEvent !== "undefined") {
                                $thisEvent.bets.push({
                                    runnerName: runner.name,
                                    runnerId: runner.id,
                                    odds: [],
                                    bets: [],
                                });
                            } else {
                                console.log("error new created event not found");
                            }
                        });
                    }
                }
            });
            if ($this.events.length > 0 && $this.autoBetIsRunning === false) {
                $this.autoBet(events.events.filter(function (event) {
                    if ($this.events.find(x => x.id === event.id)) {
                        return event;
                    }
                }));
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
            }, 10000);
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
                    const $thisRunner = $thisEvent.bets.find(x => x.runnerId === runner.id);
                    if (typeof $thisRunner !== "undefined") {
                        const back = runner.prices.find(x => x.side === "back");
                        if (typeof back !== "undefined") {
                            $thisRunner.odds.push({
                                time: time,
                                back: runner.prices.find(x => x.side === "back").odds,
                            });
                        }
                    }
                });
            } else {
                console.log("error new created event not found 2");
            }
        });
        $this.bet();
    };

    this.bet = function () {
        const $this = this;
        console.log(util.inspect($this.events, false, null, true));
    };

    this.stop = function () {
        const $this = this;
        $this.events = [];
    };
}

module.exports = {
    LiveBetting,
};