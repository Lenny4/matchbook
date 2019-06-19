const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('../')(server);
const port = process.env.PORT || 3000;
const conf = require('./conf.js');

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// app.use(express.urlencoded());
// app.use(express.json());


io.on('connection', (socket) => {
    socket.on('event', (data) => {
    });
});

app.post('/get-strategies', function (req, res) {

});