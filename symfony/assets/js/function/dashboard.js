const Env = require('../Env.js').Env;
const Const = require('../Const.js').Const;
const date = require('./date.js');
const chart = require('./chart.js');

const allEvents = [];
let allSmallEvents = [];
const mainDiv = "#liveBettingBacktest";

$(document).on("change", "select[data-event-id]", function () {
    const winnerId = $(this).val();
    const eventId = $(this).closest("select").data("event-id");
    const url = Env.SYMFONY_URL + Const.CHANGE_WINNER;
    $.post(url, {winnerId: winnerId, eventId: eventId.toString()}, function (result) {
        console.log(result);
    });
});

$(document).on("click", ".event > button[data-log]", function () {
    const eventId = $(this).data("event-id");
    const event = allEvents.find(x => x.id === eventId);
    console.log(event);
});

$(document).on("click", ".event > button[data-chart]", function () {
    const eventId = $(this).data("event-id");
    const event = allEvents.find(x => x.id === eventId);
    const divChart = $(document).find(".chart[data-event-id='" + event.id + "']");
    if ($(divChart).is(":visible")) {
        $(divChart).hide();
    } else {
        displayChart(event, divChart);
    }
});

function showBacktestDashboard() {
    const url = Env.SYMFONY_URL + Const.SYMFONY_URL_GET_ALL_EVENTS;
    $.post(url, function (events) {
        allSmallEvents = events;
        getEvents(events, 0);
    });
}

function getEvents(events, index) {
    if (index < events.length && index === 0) {
        const url = Env.SYMFONY_URL + Const.SYMFONY_URL_GET_EVENT;
        const desc = events.length - 1 - index;
        $.post(url, {id: events[desc].id}, function (event) {
            allEvents.push(JSON.parse(event));
            displayEvent(JSON.parse(event));
            index++;
            getEvents(events, index);
        });
    } else {
        allDisplay();
    }
}

function allDisplay() {
    console.log("done");
}

function displayChart(event, div) {
    $(div).html("");
    $(div).show();
    chart.drawEventDashBoard(event, div);
}

function displayEvent(event) {
    const divEvent = $("<div class='event' style='display: inline-block' id='" + event.id + "'></div>").appendTo(mainDiv);
    let selectWinner = "<select class='form-control' data-event-id='" + event.id + "' id='winner_" + event.id + "'>";
    const thisEvent = allSmallEvents.find(x => x.event_id.toString() === event.id.toString());
    let optionNoSelect = "";
    if (typeof thisEvent === "undefined" || thisEvent.winner === null) {
        optionNoSelect = "selected";
    }
    selectWinner += "<option " + optionNoSelect + "></option>";
    event.runners.map(function (runner) {
        let select = "";
        if (thisEvent.winner !== null && thisEvent.winner.toString() === runner.id.toString()) {
            select = "selected";
        }
        selectWinner += "<option " + select + " value='" + runner.id + "'>" + runner.name + "</option>";
    });
    selectWinner += "</select>";
    let date = new Date(event.start * 1000);
    divEvent.append("<h5>" + event.name + " " + date.getDate() + "/" + date.getMonth() + "</h5><button data-log data-event-id='" + event.id + "' type='button' class='btn btn-primary'>Log</button><button data-chart style='left: 570px;' data-event-id='" + event.id + "' type='button' class='btn btn-primary'>Chart</button>" + selectWinner);
    const divChart = $("<div style='display: none;' data-event-id='" + event.id + "' class='chart'></div>").appendTo(divEvent);
    if (true) {
        displayChart(event, divChart);
    }
}

module.exports = {
    showBacktestDashboard,
};