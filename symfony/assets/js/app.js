require('../css/app.scss');
const $ = require('jquery');
global.$ = global.jQuery = $;
require('bootstrap');
const io = require('socket.io-client');
const Conf = require('./Conf.js').Conf;
const Const = require('./Const.js').Const;
const socketServer = Conf.NODE_URL;

$(document).ready(function () {
    $("body").tooltip({
        selector: '[data-toggle="tooltip"]'
    });

    const socket = io(socketServer);
    // socket.emit('event', {}, function (result) {
    //
    // });
});