const Env = require('../Env.js').Env;
const Const = require('../Const.js').Const;
const date = require('./date.js');
const chart = require('./chart.js');

const allEvents = [];
const mainDiv = "#liveBettingBacktest";

function showBacktestDashboard() {
    const url = Env.SYMFONY_URL + Const.SYMFONY_URL_GET_ALL_EVENTS;
    $.post(url, function (events) {
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
    console.log(allEvents[0].runners[0]);
    console.log("done");
}

function displayChart(event, div) {
    chart.drawEventDashBoard(event, div);
}

function displayEvent(event) {
    const divEvent = $("<div class='event' style='display: inline-block' id='" + event.id + "'></div>").appendTo(mainDiv);
    divEvent.append("<h5>" + event.name + "</h5>");
    displayChart(event, divEvent);
}

module.exports = {
    showBacktestDashboard,
};