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

const backArray = {
    backFast: function (runnerF, indexPriceF) {
        const price = runnerF.prices[indexPriceF];
        const prevPrice = runnerF.prices[indexPriceF - 1];
        if (price.back !== null && prevPrice.back !== null && price.time === prevPrice.time - 1) {
            const invBack = 1 / price.back;
            const prevInvBack = 1 / prevPrice.back;
            //si la cote est inférieur à 2
            if (invBack > 0.53) {
                //si la cote est 2 fois inférieur à la précédente cote
                if ((prevInvBack / invBack) < 0.5) {
                    // if (invBack - prevInvBack > 0.07) {
                    return true;
                    // }
                }
            }
        }
        return false;
    },
    backMedium: function (runnerF, indexPriceF) {
        const price = runnerF.prices[indexPriceF];
        const prevPrice = runnerF.prices[indexPriceF - 1];
        const prevPrice2 = runnerF.prices[indexPriceF - 2];
        if (price.back !== null && prevPrice.back !== null && prevPrice2.back !== null && price.time === prevPrice.time - 1 && price.time === prevPrice2.time - 2) {
            const invBack = 1 / price.back;
            const prevInvBack = 1 / prevPrice.back;
            const prevInvBack2 = 1 / prevPrice2.back;
            if (invBack > 0.5) {
                if ((prevInvBack / invBack) < 0.8 && (prevInvBack2 / prevInvBack) < 0.8) {
                    return true;
                }
            }
        }
        return false;
    },
};

const layArray = {
    layFast: function (runnerF, indexPriceF) {
        const price = runnerF.prices[indexPriceF];
        const prevPrice = runnerF.prices[indexPriceF - 1];
        if (price.lay !== null && prevPrice.lay !== null && price.time === prevPrice.time - 1) {
            const invLay = 1 / price.lay;
            const prevInvLay = 1 / prevPrice.lay;
            //lay > 40 && lay <= 80
            if (invLay < 0.025 && invLay >= 0.0125 && invLay / prevInvLay < 0.3) {
                return true;
            }
            if (invLay / prevInvLay < 0.53 && invLay >= 0.02 && invLay < 0.034) {
                return true;
            }
        }
        return false;
    },
};

function betEvent(event) {
    event.bets = [];
    event.runners.map(function (runner, indexRunner) {
        runner.prices.map(function (price, indexPrice) {
            const betToAdd = {
                condition: null,
                name: runner.name,
                back: runner.prices[indexPrice].back,
                lay: runner.prices[indexPrice].lay,
                time: runner.prices[indexPrice].time,
            };
            if (indexPrice > 3) {
                //FOR BACK
                if (backArray.backFast(runner, indexPrice) === true) {
                    betToAdd.condition = "backFast";
                    delete betToAdd['lay'];
                    if (typeof event.bets.find(x => x.condition === "backFast" && x.name === runner.name) === "undefined") {
                        event.bets.push(betToAdd);
                    }
                }
                if (backArray.backMedium(runner, indexPrice) === true) {
                    betToAdd.condition = "backMedium";
                    delete betToAdd['lay'];
                    if (typeof event.bets.find(x => x.condition === "backMedium" && x.name === runner.name) === "undefined") {
                        event.bets.push(betToAdd);
                    }
                }
                //FOR LAY
                if (layArray.layFast(runner, indexPrice) === true) {
                    betToAdd.condition = "layFast";
                    delete betToAdd['back'];
                    if (typeof event.bets.find(x => x.condition === "layFast" && x.name === runner.name) === "undefined") {
                        event.bets.push(betToAdd);
                    }
                }
            }
        });
    });
    console.log(event);
}

function getEvents(events, index) {
    if (index < events.length) {
        const url = Env.SYMFONY_URL + Const.SYMFONY_URL_GET_EVENT;
        const desc = events.length - 1 - index;
        $.post(url, {id: events[desc].id}, function (event) {
            if (true) {
                const eventParse = JSON.parse(event);
                allEvents.push(eventParse);
                betEvent(eventParse);
                displayEvent(eventParse);
            }
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
    if (false) {
        displayChart(event, divChart);
    }
}

module.exports = {
    showBacktestDashboard,
};