const RSI = require('technicalindicators').RSI;
const MACD = require('technicalindicators').MACD;
const util = require('util');

function Backtest(symfonyApi) {

    this.testDevRsi = function (id, callback) {
        const $this = this;
        let percent = 0;
        let lastValue = -1;
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

    this.testDevSurbet = function (id) {
        const $this = this;
        const arraySurbet = [];
        symfonyApi.getEvent(id, function (event) {
            let oneDaySureBetBack = 0;
            let oneDaySureBetLay = 0;
            let alreadyOneDaySureBetBack = false;
            let alreadyOneDaySureBetLay = false;
            const runners = event.markets[0].runners;
            runners.map(function (runner, index) {
                runner.prices.map(function (price) {
                    const time = Object.keys(price)[0];
                    if (index === 0) {
                        arraySurbet.push({
                            time: time,
                            eventName: event.name,
                            oddsBack: [],
                            surBetValueBack: null,
                            oddsLay: [],
                            surBetValueLay: null,
                        });
                    }
                    const obj = arraySurbet.find(x => x.time === time);
                    if (typeof obj !== "undefined") {
                        const backOdd = price[time].find(x => x.side === "back");
                        const LayOdd = price[time].find(x => x.side === "lay");
                        if (typeof backOdd !== "undefined") {
                            obj.oddsBack.push(backOdd.odds);
                        }
                        if (typeof LayOdd !== "undefined") {
                            obj.oddsLay.push(LayOdd.odds);
                        }
                    }
                });
            });
            arraySurbet.map(function (odds) {
                let surBetValueBack = 0;
                let surBetValueLay = 0;
                odds.oddsBack.map(function (oddBack) {
                    surBetValueBack += (1 / oddBack);
                });
                if (surBetValueBack < 1) {
                    if (alreadyOneDaySureBetBack === false) {
                        alreadyOneDaySureBetBack = true;
                        oneDaySureBetBack += 1 - surBetValueBack;
                        console.log(parseInt(oneDaySureBetBack * 100) / 100);
                        console.log(odds.time, odds.eventName, odds.oddsBack, surBetValueBack, "back");
                    }
                }
                odds.surBetValueBack = surBetValueBack;
                odds.oddsLay.map(function (oddLay) {
                    surBetValueLay += (1 / oddLay);
                });
                if (surBetValueLay > 1) {
                    if (alreadyOneDaySureBetLay === false) {
                        alreadyOneDaySureBetLay = true;
                        oneDaySureBetLay += surBetValueLay - 1;
                        console.log(parseInt(oneDaySureBetLay * 100) / 100);
                        console.log(odds.time, odds.eventName, odds.oddsLay, parseInt(surBetValueLay * 100) / 100, "lay");
                    }
                }
                odds.surBetValueLay = surBetValueLay;
            });
        });
        console.log("=============");
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
    };

    this.chartMACD = function (prices, callback) {
        const macdInput = {
            values: [],
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        };
        prices.map(function (obj, index) {
            const odd = obj[Object.keys(obj)[0]].find(x => x.side === "back");
            if (typeof odd !== "undefined") {
                macdInput.values.push(obj[Object.keys(obj)[0]].find(x => x.side === "back").odds);
            }
        });
        const arrayToChart = MACD.calculate(macdInput);
        callback(arrayToChart);
    }
}

module.exports = {
    Backtest,
};