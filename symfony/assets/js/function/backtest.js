const Env = require('../Env.js').Env;
const Const = require('../Const.js').Const;
const date = require('./date.js');
const chart = require('./chart.js');

function showAllImported() {
    const url = Env.SYMFONY_URL + Const.SYMFONY_URL_GET_ALL_EVENTS;
    const button = $("#show-all-imported");
    const div = $("#all-imported-list");
    $(button).prop('disabled', true);
    $.post(url, function (events) {
        $(button).prop('disabled', false);
        events.map(function (event) {
            $(div).append(
                "<div style='margin-bottom: 10px' class='col-3'>" +
                "<div class='box-shadow' style='position: relative'>" +
                "<strong>" + event.name + "</strong><br/>" +
                "<button data-view-event-id='" + event.id + "' class='btn btn-primary'>View</button>" +
                "</div>" +
                "</div>"
            );
        });
    });
}

function showViewEvent(id, button) {
    const url = Env.SYMFONY_URL + Const.SYMFONY_URL_GET_EVENT;
    $(button).prop('disabled', true);
    $.post(url, {id: id}, function (event) {
        $(button).prop('disabled', false);
        $("#nav-view-tab").click();
        viewEvent(JSON.parse(event));
    });
}

function viewEvent(event) {
    console.log(event);
    const div = $("#nav-view");
    $(div).find(".h1").html(event.name);
    $(div).find(".h2").html(Const.ALL_SPORTS.find(x => x.id === parseInt(event["sport-id"])).name);
    $(div).find(".h3").html(date.timestampToHuman(event.start));
    const viewDiv = $(div).find(".view");
    $(viewDiv).html("");
    event.markets.map(function (market) {
        const marketDiv = $("<div class='market' id='" + market.id + "'></div>").appendTo(viewDiv);
        $(marketDiv).append("<h1 style='clear: both;'>" + market.name + "</h1>");
        chart.drawVolumeMarket(marketDiv, market.id, market.volume);
        chart.backLayGlobal(marketDiv, market.id, market["back-overround"], market["lay-overround"]);
    });
}

module.exports = {
    showAllImported,
    showViewEvent,
};