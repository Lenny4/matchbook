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

const symfonyApi = new SymfonyApi(Env.SYMFONY_URL);
const matchbookApi = new MatchbookApi(Const.USERNAME, Const.PASSWORD, Env.APP_ENV);

function init() {
    console.log('\033[2J');
    console.log('Server listening at port %d', port);
    console.log('Verifying IP location ...');
    scrapeIt("https://iplocation.com/", {
        country: "table.result-table span.country_name"
    }).then(({data, response}) => {
        if (typeof response !== "undefined" && typeof response.statusCode !== "undefined" && typeof data !== "undefined" && typeof data.country !== "undefined") {
            if (data.country === "Finland") {
                console.log('Your are in Finland !');
                if (Env.APP_ENV === Const.DEV) {
                    //TODO définir soit meme les variables de matchbookApi
                    console.log("TODO env dev...");
                } else if (Env.APP_ENV === Const.PROD) {
                    matchbookApi.login(function (result) {
                        if (result === false) {
                            console.log("Error while starting server starting back in 30s");
                            setTimeout(function () {
                                init();
                            }, 30000);
                        }
                    });
                } else {
                    throw new Error('APP_ENV can only be "prod" or "dev"');
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
    // socket.emit('login', {}, function (result) {
    // });
    // socket.on('login_back', function (data, fn) {
    // });
});

app.post('/get-strategies', function (req, res) {

});
