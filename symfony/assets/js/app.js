require('../css/app.scss');
const $ = require('jquery');
global.$ = global.jQuery = $;
require('bootstrap');
const io = require('socket.io-client');
const Env = require('./Env.js').Env;
const Const = require('./Const.js').Const;

const socketServer = Env.NODE_URL;

$(document).ready(function () {
    $("body").tooltip({
        selector: '[data-toggle="tooltip"]'
    });

    const socket = io(socketServer);
    // socket.on('login', function () {
    //     socket.emit('login_back', account, function (result) {
    //         console.log("login result", result);
    //     });
    // });
});