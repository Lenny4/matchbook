const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('../')(server);
const port = process.env.PORT || 3000;

const Env = require('./Env.js').Env;
const Const = require('./Const.js').Const;
const SymfonyApi = require('./symfony-api/SymfonyApi.js').SymfonyApi;

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// app.use(express.urlencoded());
// app.use(express.json());


io.on('connection', (socket) => {
    socket.on('event', function (data, fn) {
        fn(true);
    });
});

app.post('/get-strategies', function (req, res) {
    // const symfonyApi = new SymfonyApi;
});