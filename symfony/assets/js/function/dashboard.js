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

$(document).on("click", ".event > button", function () {
    const eventId = $(this).data("event-id");
    const event = allEvents.find(x => x.id === eventId);
    console.log(event);
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
    divEvent.append("<h5>" + event.name + " " + date.getDate() + "/" + date.getMonth() + "</h5><button data-event-id='" + event.id + "' type='button' class='btn btn-primary'>Log</button>" + selectWinner);
    if (true) {
        displayChart(event, divEvent);
    }
}

module.exports = {
    showBacktestDashboard,
};