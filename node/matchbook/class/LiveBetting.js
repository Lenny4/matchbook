const Env = require('../Env.js').Env;
const util = require('util');
const RSI = require('technicalindicators').RSI;

function LiveBetting(matchbookApi, symfonyApi) {
    this.eventIdsToImport = [];
    this.isRunning = false;
    this.matchbookApi = matchbookApi;
    this.symfonyApi = symfonyApi;
    this.autoImportConfig = Env.AUTO_IMPORT_CONFIF;

    this.start = function (callback) {
        const $this = this;
        console.log("Start live betting ...");
        if ($this.isRunning === false) {
            $this.isRunning = true;
            $this.findEvents();
            $this.autoBet();
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
                if (start - now < 1900 && start - now > 1400) {
                    if (typeof $this.eventIdsToImport.find(x => x.id === event.id) === "undefined") {
                        $this.eventIdsToImport.push({
                            id: event.id,
                            bets: [],
                        });
                    }
                }
            });
            console.log($this.eventIdsToImport);
        });
        setTimeout(function () {
            $this.findEvents();
        }, 300 * 1000);//5min
    };

    this.autoBet = function () {

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

    this.stop = function () {
        this.eventsToImport = [];
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
}

module.exports = {
    LiveBetting,
};