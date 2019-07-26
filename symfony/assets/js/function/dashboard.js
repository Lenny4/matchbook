const Env = require('../Env.js').Env;
const Const = require('../Const.js').Const;
const date = require('./date.js');
const chart = require('./chart.js');

const allEvents = [];
let allSmallEvents = [];
const mainDiv = "#liveBettingBacktest";

function showBacktestDashboard() {
    const url = Env.SYMFONY_URL + Const.SYMFONY_URL_GET_ALL_EVENTS;
    $.post(url, function (events) {
        allSmallEvents = events;
        getEvents(events, 0);
    });
}

function getEvents(events, index) {
    if (index < events.length) {
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
    if (typeof thisEvent === "undefined" || thisEvent.winner === null) {
        selectWinner += "<option selected></option>";
    }
    event.runners.map(function (runner) {
        selectWinner += "<option value='" + runner.id + "'>" + runner.name + "</option>";
    });
    selectWinner += "</select>";
    let date = new Date(event.start * 1000);
    divEvent.append("<h5>" + event.name + " " + date.getDate() + "/" + date.getMonth() + "</h5>" + selectWinner);
    if (false) {
        displayChart(event, divEvent);
    }
}

module.exports = {
    showBacktestDashboard,
};