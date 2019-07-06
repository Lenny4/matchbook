const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('../')(server);
const port = process.env.PORT || 3000;
const scrapeIt = require("scrape-it");
//console.log(util.inspect(myObject, false, null, true));
const util = require('util');
// app.use(express.urlencoded());
// app.use(express.json());

const Env = require('./Env.js').Env;
const Const = require('./Const.js').Const;
const SymfonyApi = require('./class/SymfonyApi.js').SymfonyApi;
const MatchbookApi = require('./class/MatchbookApi.js').MatchbookApi;
const Importer = require('./class/Importer.js').Importer;
const Backtest = require('./class/Backtest.js').Backtest;
const LiveBetting = require('./class/LiveBetting.js').LiveBetting;

const symfonyApi = new SymfonyApi();
const matchbookApi = new MatchbookApi(Env.USERNAME, Env.PASSWORD, Env.APP_ENV);
const importer = new Importer(matchbookApi, symfonyApi);
const liveBetting = new LiveBetting(matchbookApi, symfonyApi);
const backtest = new Backtest(symfonyApi);

function init() {
    console.log('\033[2J');
    console.log('Server listening at port %d', port);
    console.log('Verifying IP location ...');
    scrapeIt("https://iplocation.com/", {
        country: "table.result-table span.country_name"
    }).then(({data, response}) => {
        if (typeof response !== "undefined" && typeof response.statusCode !== "undefined" && typeof data !== "undefined" && typeof data.country !== "undefined") {
            if (data.country === Env.AVAILABLE_COUNTRY) {
                console.log('Your are in Finland !');
                if (Env.APP_ENV === Const.DEV || Env.APP_ENV === Const.PROD) {
                    if (Env.APP_ENV === Const.DEV) matchbookApi.headers['session-token'] = Env.DEV_SESSION_TOKEN;
                    matchbookApi.login(Env.APP_ENV, function (result) {
                        if (result === false) {
                            console.log("Error while starting server starting back in 30s");
                            setTimeout(function () {
                                init();
                            }, 30000);
                        } else {
                            importer.init();
                            // RSI TEST
                            // let percent = 0;
                            // const ids = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
                            // ids.map(function (id, index) {
                            //     setTimeout(function () {
                            //         backtest.testDevRsi(id, function (returnPercent) {
                            //             percent += returnPercent;
                            //             if (index === ids.length - 1) {
                            //                 console.log(percent);
                            //             }
                            //         });
                            //     }, 10000 * (id - 2))
                            // });

                            // SURBET_TEST
                            // const ids = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
                            // ids.map(function (id, index) {
                            //     setTimeout(function () {
                            //         backtest.testDevSurbet(id, function () {
                            //         });
                            //     }, (5000 * (id - 2)) - 5000);
                            // });

                            // STOCKFISH_TEST
                            // const ids = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
                            const ids = [3];
                            ids.map(function (id, index) {
                                setTimeout(function () {
                                    backtest.testStockfish(id, function () {
                                    });
                                }, (5000 * (id - 2)) - 5000);
                            });
                        }
                    });
                } else {
                    console.log('APP_ENV can only be "prod" or "dev", please change and restart server');
                }
            } else {
                console.log('Your are not located in Finland');
            }
        } else {
            console.log('Error with iplocation.com');
        }
    })
}

server.listen(port, () => {
    init();
});

io.on('connection', (socket) => {
    socket.on('generate_new_token_dev', function (data, fn) {
        matchbookApi.generateNewTokenDev(function (result) {
            fn(result);
        });
    });

    socket.on('get_sports', function (data, fn) {
        matchbookApi.getSports(function (result) {
            fn(result);
        });
    });

    socket.on('start_live_betting', function (data, fn) {
        liveBetting.start(function (result) {
            fn(result);
        });
    });

    socket.on('chart_macd', function (data, fn) {
        backtest.chartMACD(data, function (result) {
            fn(result);
        });
    });

    socket.on('get_events', function (data, fn) {
        matchbookApi.getEventsView(data, function (result) {
            fn(result);
        });
    });

    socket.on('start_import', function (data, fn) {
        importer.addImport(data, function (result) {
            fn(result);
        });
    });
});

app.post('/get-strategies', function (req, res) {

});
