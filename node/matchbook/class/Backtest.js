const RSI = require('technicalindicators').RSI;

function Backtest(symfonyApi) {
    let lastValue = -1;

    this.testDev = function (id, callback) {
        const $this = this;
        let percent = 0;
        let lastBet = {
            type: null,
            odd: null,
        };
        symfonyApi.getEvent(id, function (event) {
            const runners = event.markets[0].runners;
            runners.map(function (runner) {
                const inputRSI = {
                    values: [],
                    period: 28
                };
                const nbOddsRecord = runner.prices.length;
                let lastBack = null;
                runner.prices.map(function (price, index) {
                    $this.findBiggerBackLowLay(price, function (backPrice, layPrice) {
                        if (backPrice === false) {
                            if (lastBack !== null) {
                                inputRSI.values.push(lastBack.odds);
                            }
                        } else {
                            inputRSI.values.push(backPrice.odds);
                            lastBack = backPrice;
                        }
                    });
                });
                console.log(runner.name);
                const arrayToChart = RSI.calculate(inputRSI);
                arrayToChart.map(function (value, index) {
                    value = parseInt(value);
                    if (value > 80 || value < 20) {
                        $this.findBiggerBackLowLay(runner.prices[index], function (backPrice, layPrice) {
                            const time = index - nbOddsRecord;
                            if (lastValue !== value) {
                                if (backPrice.odds < 12
                                    && backPrice.odds > 1.5
                                    && backPrice.odds / layPrice.odds >= 0.95
                                    && lastValue !== -1
                                    && time > -1400) {
                                    if (value < 20 && lastValue > 80) {
                                        if (lastBet.type !== null) {
                                            const $thisPourcent = parseInt((backPrice.odds - lastBet.odd) * 100) / 100;
                                            percent += $thisPourcent;
                                            console.log(value, time, backPrice.odds, layPrice.odds, "down/back", $thisPourcent);
                                        } else {
                                            console.log(value, time, backPrice.odds, layPrice.odds, "down/back", 0);
                                        }
                                        lastBet.type = 'back';
                                        lastBet.odd = backPrice.odds;
                                    } else if (value > 80 && lastValue < 20) {
                                        if (lastBet.type !== null) {
                                            const $thisPourcent = parseInt((lastBet.odd - layPrice.odds) * 100) / 100;
                                            percent += $thisPourcent;
                                            console.log(value, time, backPrice.odds, layPrice.odds, "up/lay", $thisPourcent);
                                        } else {
                                            console.log(value, time, backPrice.odds, layPrice.odds, "up/lay", 0);
                                        }
                                        lastBet.type = 'lay';
                                        lastBet.odd = layPrice.odds;
                                    }
                                }
                            }
                            lastValue = value;
                        });
                    }
                    if (index === arrayToChart.length - 1 && lastBet.type !== null) {
                        $this.findBiggerBackLowLay(runner.prices[runner.prices.length - 1], function (backPrice, layPrice) {
                            if (lastBet.type === 'back') {
                                const $thisPourcent = parseInt((lastBet.odd - layPrice.odds) * 100) / 100;
                                percent += $thisPourcent;
                                console.log(0, backPrice.odds, layPrice.odds, "last/lay", $thisPourcent);
                            } else if (lastBet.type === 'lay') {
                                const $thisPourcent = parseInt((backPrice.odds - lastBet.odd) * 100) / 100;
                                percent += $thisPourcent;
                                console.log(0, backPrice.odds, layPrice.odds, "last/back", $thisPourcent);
                            }
                        });
                    }
                });
                lastBet = {
                    type: null,
                    odd: null,
                };
                console.log("===========================================================================");
            });
            console.log("===========================================================================");
            console.log("===========================================================================");
            console.log("===========================================================================");
            callback(percent);
        });
    };

    this.findBiggerBackLowLay = function (price, callback) {
        const backPrices = price[Object.keys(price)[0]].filter(x => x.side === 'back');
        if (backPrices.length > 0) {
            const backPrice = backPrices.reduce(function (prev, current) {
                return (prev.odds > current.odds) ? prev : current
            });
            const layPrices = price[Object.keys(price)[0]].filter(x => x.side === 'lay');
            let layPrice = JSON.parse(JSON.stringify(backPrice));
            layPrice.odds = layPrice.odds * 0.05;
            if (layPrices.length > 0) {
                layPrice = layPrices.reduce(function (prev, current) {
                    return (prev.odds < current.odds) ? prev : current
                });
            }
            callback(backPrice, layPrice);
        } else {
            callback(false, false);
        }
    }
}

module.exports = {
    Backtest,
};