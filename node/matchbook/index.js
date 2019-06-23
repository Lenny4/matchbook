const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('../')(server);
const port = process.env.PORT || 3000;
const scrapeIt = require("scrape-it");
// app.use(express.urlencoded());
// app.use(express.json());

const Env = require('./Env.js').Env;
const Const = require('./Const.js').Const;
const SymfonyApi = require('./class/SymfonyApi.js').SymfonyApi;
const MatchbookApi = require('./class/MatchbookApi.js').MatchbookApi;
const Importer = require('./class/Importer.js').Importer;

const symfonyApi = new SymfonyApi(Env.SYMFONY_BASE_URL);
const matchbookApi = new MatchbookApi(Env.USERNAME, Env.PASSWORD, Env.APP_ENV);
const importer = new Importer(matchbookApi, symfonyApi);

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
