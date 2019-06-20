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
const SymfonyApi = require('./symfony-api/SymfonyApi.js').SymfonyApi;
const MatchbookApi = require('./matchbook-api/MatchbookApi.js').MatchbookApi;

const env = new Env();
const constante = new Const();
const symfonyApi = new SymfonyApi(env.SYMFONY_URL);

server.listen(port, () => {
    console.log('Server listening at port %d', port);
    console.log('Verifying IP location ...');
    scrapeIt("https://iplocation.com/", {
        country: "table.result-table span.country_name"
    }).then(({data, response}) => {
        if (typeof response !== "undefined" && typeof response.statusCode !== "undefined" && typeof data !== "undefined" && typeof data.country !== "undefined") {
            if (data.country === "Finland") {
                console.log('Your are in Finland !');
            } else {
                throw new Error('Your are not located in Finland');
            }
        } else {
            throw new Error('Error with iplocation.com');
        }
    })
});

io.on('connection', (socket) => {

    console.log('Logging to matchbook API ...');
    const matchbookApi = new MatchbookApi();
    socket.emit('login', {}, function (result) {
    });
    socket.on('login_back', function (data, fn) {
        matchbookApi.username = data.username;
        matchbookApi.password = data.password;
        //TODO start login
        fn(true);
    });
});

app.post('/get-strategies', function (req, res) {
    // const symfonyApi = new SymfonyApi;
});
