const util = require('util');
const fs = require('fs');

function JustBet(matchbookApi) {
    this.matchbookApi = matchbookApi;
    this.eventsAlreadyBet = [];
    this.betAmount = 1;//EUR min 1
    this.startBefore = 600;//TODO change
    this.startAfter = 60;//TODO change
    this.maxGlobalOdd = 1.02;//1.02 //TODO change
    this.lowLimitOdd = 0.85;
    this.highLimitOdd = 0.95;
    this.minAmountMatchbook = 0.1;//EUR

    this.start = function () {
        const $this = this;
        $this.watch();
    };

    this.watch = function () {
        const $this = this;
        const now = parseInt(new Date().getTime() / 1000);
        const data = [
            {name: "sport-ids", value: 24735152712200},
            {name: "after", value: now},
        ];
        let alreadySubmitOffer = false;
        $this.matchbookApi.getEventsView(data, function (events) {
            if (events.total > 0) {
                events.events.map(function (event) {
                    if (alreadySubmitOffer === false && !$this.eventsAlreadyBet.includes(event.id)) {
                        const start = parseInt(new Date(event.start).getTime() / 1000);
                        if (start - now < $this.startBefore && start - now > $this.startAfter && event.markets.length > 0) {
                            $this.calculeBet(event.markets[0].runners, function (result) {
                                if (Array.isArray(result)) {
                                    const submitOffers = {
                                        "odds-type": "DECIMAL",
                                        "exchange-type": "back-lay",
                                        "offers": []
                                    };
                                    result.map(function (runner) {
                                        submitOffers["offers"].push({
                                            "runner-id": runner.runnerId,
                                            "side": "back",
                                            "odds": runner.odds,
                                            "stake": parseInt((runner.stack * 100)) / 100,
                                            "keep-in-play": true
                                        });
                                    });
                                    alreadySubmitOffer = true;
                                    $this.matchbookApi.submitOffers(submitOffers, function (result) {
                                        if (result !== false) {
                                            $this.eventsAlreadyBet.push(event.id);
                                            $this.checkEventIsOver();
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
            if (alreadySubmitOffer === false) {
                $this.checkEventIsOver();
            }
        }, true);
        setTimeout(function () {
            $this.watch();
        }, 5000);
    };

    this.checkEventIsOver = function () {
        const $this = this;
        $this.eventsAlreadyBet.map(function (eventId, index) {
            $this.matchbookApi.getSettledBet([eventId], function (result) {
                if (typeof result !== "undefined" && typeof result['net-profit-and-loss'] !== "undefined") {
                    if (result.total === 1) {
                        $this.eventsAlreadyBet.splice(index, 1);
                    }
                }
            });
        });
    };

    this.calculeBet = function (runners, callback) {
        const $this = this;
        let arrayBack = [];
        let globalOdd = 0;
        runners.map(function (runner) {
            const back = runner.prices.find(x => x.side === "back");
            if (typeof back !== "undefined") {
                globalOdd += 1 / back.odds;
                arrayBack.push({
                    runnerId: runner.id,
                    runnerName: runner.name,
                    back: back.odds,
                    percent: 1 / back.odds,
                });
            }
        });
        if (globalOdd < $this.maxGlobalOdd) {
            let limitOdd = 0;
            arrayBack = arrayBack.sort((a, b) => (a.back > b.back) ? 1 : ((b.back > a.back) ? -1 : 0));
            const arrayOdds = [];
            let multiplier = 0;
            arrayBack.map(function (runner) {
                if (limitOdd + runner.percent < $this.highLimitOdd) {
                    limitOdd += runner.percent;
                    arrayOdds.push(runner);
                    multiplier += runner.percent;
                }
            });
            multiplier = 1 / multiplier;
            if (limitOdd > $this.lowLimitOdd) {
                let redistribution = 0;
                const arrayBets = [];
                arrayOdds.map(function (el) {
                    const bet = (el.percent * multiplier) * ($this.betAmount);
                    if (bet >= $this.minAmountMatchbook) {
                        arrayBets.push({
                            runnerId: el.runnerId,
                            runnerName: el.runnerName,
                            stack: bet,
                            odds: el.back,
                        });
                    } else {
                        redistribution += bet;
                    }
                });
                if (arrayBets.length > 0) {
                    //redistribue les paris en dessous de 0.1 car pas possible sur matchbook
                    $this.redistribution(arrayBets, redistribution, function (arrayBets) {
                        callback(arrayBets);
                    });
                } else {
                    callback(false);
                }
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    };

    this.redistribution = function (array, value, callback) {
        let sumStack = 0;
        array.map(function (runner) {
            sumStack += runner.stack;
        });
        array.map(function (runner) {
            runner.stack = parseInt((runner.stack + (value * (runner.stack / sumStack))) * 100) / 100;
        });
        callback(array);
    };
}

module.exports = {
    JustBet,
};