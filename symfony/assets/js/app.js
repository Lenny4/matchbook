require('../css/app.scss');
const $ = require('jquery');
global.$ = global.jQuery = $;
require('bootstrap');
const io = require('socket.io-client');
const Env = require('./Env.js').Env;
const Const = require('./Const.js').Const;
const dev = require('./function/dev.js');
const importer = require('./function/importer.js');

const socketServer = Env.NODE_URL;

$(document).ready(function () {
    $("body").tooltip({
        selector: '[data-toggle="tooltip"]'
    });

    const socket = io(socketServer);
    socket.emit('get_sports', {}, function (result) {
        result.map(function (element) {
            Const.ALL_SPORTS.push(element);
        });
        importer.addAllSportsToSelectDom();
    });

    $(document).on("click", "#generate-new-token-button", function () {
        dev.generateNewToken(socket);
    });

    $(document).on("click", "#pills-importer-tab, #nav-import-tab", function () {
        importer.manageAfterValue();
    });

    $(document).on("submit", "form", function (e) {
        e.preventDefault();
        const form = $(this).serializeArray();
        const submitButton = $(this).find("[type=submit]");
        $(submitButton).prop('disabled', true);
        socket.emit('get_events', form, function (result) {
            $(submitButton).prop('disabled', false);
            importer.displayEvents(result.events);
        });
    });
});