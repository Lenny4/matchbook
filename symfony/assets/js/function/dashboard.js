const Env = require('../Env.js').Env;
const Const = require('../Const.js').Const;
const date = require('./date.js');
const chart = require('./chart.js');

const allEvents = [];
const mise = 1;
let allSmallEvents = [];
const mainDiv = "#liveBettingBacktest";
let globalWin = 0;
const eventsBets = [];
const eventsNoBets = [];

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
        allSmallEvents = allSmallEvents.sort((a, b) => (parseInt(a.id) < parseInt(b.id)) ? 1 : ((parseInt(b.id) < parseInt(a.id)) ? -1 : 0));
        getEvents(events, 0);
    });
}

const backArray = {
    back: function (runnerF, indexPriceF, bets, event, callback) {
        // prices
        const price = runnerF.prices[indexPriceF];
        const prevPrice = runnerF.prices[indexPriceF - 1];
        const prevPrice2 = runnerF.prices[indexPriceF - 2];
        // inv
        let invBack = null;
        if (typeof price !== "undefined") {
            invBack = 1 / price.back;
        }
        let prevInvBack = null;
        if (typeof prevPrice !== "undefined") {
            prevInvBack = 1 / prevPrice.back;
        }
        let prevInvBack2 = null;
        if (typeof prevPrice2 !== "undefined") {
            prevInvBack2 = 1 / prevPrice2.back;
        }
        // condition
        const lastPricesNotNull = (invBack !== null && price.back !== null);
        const last2PricesNotNull = lastPricesNotNull && (prevInvBack !== null && prevPrice.back !== null && price.time === prevPrice.time - 1);
        const last3PricesNotNull = last2PricesNotNull && (prevInvBack2 !== null && prevPrice2.back !== null && price.time === prevPrice2.time - 2);
        const musts = [
            //la cote du back doit être inférieur à 1.89
            invBack > 0.53 && invBack < 0.97
        ];
        const conditions = {
            //plus c'est bas mieux c'est car plus permitif
            backPrevNotExist: invBack > 0.809 && prevPrice.back === null,
            //plus c'est bas mieux c'est car plus permitif
            backLow: (invBack > 0.910) && lastPricesNotNull,
            //plus c'est haut mieux c'est car plus permitif, //todo fais perdre de l'argent pour l'instant
            backFast: ((prevInvBack / invBack) < 0.667 && invBack > 0.871) && last2PricesNotNull,
            //plus c'est haut mieux c'est car plus permitif
            backMedium: ((prevInvBack / invBack) < 0.914 && (prevInvBack2 / prevInvBack) < 0.805) && last3PricesNotNull,
        };
        const reducerMust = (accumulator, currentValue) => accumulator && currentValue;
        if (musts.reduce(reducerMust)) {
            let alreadyMatch = false;
            Object.keys(conditions).map(function (key, index) {
                if (typeof bets.find(x => x.name === runnerF.name) === "undefined") {
                    if (conditions[key] === true && alreadyMatch === false) {
                        alreadyMatch = true;
                        callback(key);
                    }
                }
            });
            if (alreadyMatch === false) {
                callback(false);
            }
        } else {
            callback(false);
        }
    },
};

function betEvent(event, callback) {
    event.bets = [];
    event.runners.map(function (runner, indexRunner) {
        runner.prices.map(function (price, indexPrice) {
            const betToAdd = {
                condition: null,
                name: runner.name,
                back: runner.prices[indexPrice].back,
                lay: runner.prices[indexPrice].lay,
                time: runner.prices[indexPrice].time,
                runnerId: runner.id,
            };
            if (indexPrice > 3) {
                //FOR BACK
                backArray.back(runner, indexPrice, event.bets, event, function (resultBack) {
                    if (resultBack !== false) {
                        betToAdd.condition = resultBack;
                        delete betToAdd['lay'];
                        event.bets.push(betToAdd);
                    }
                });
            }
        });
    });
    callback();
}

function getEvents(events, index) {
    const offset = 20;
    if (index < events.length) {
        const urlIds = Env.SYMFONY_URL + Const.SYMFONY_URL_GET_EVENT_IDS;
        const ids = [];
        for (let i = index; i - index < offset && i < events.length; i++) {
            ids.push(events[i].id);
        }
        $.post(urlIds, {ids: ids}, function (result) {
            if (Array.isArray(result)) {
                result = result.reverse();
                result.map(function (event) {
                    const eventParse = JSON.parse(event);
                    allEvents.push(eventParse);
                    betEvent(eventParse, function () {
                        winLose(eventParse, function () {
                            displayEvent(eventParse);
                        });
                    });
                });
            }
            index += offset;
            getEvents(events, index);
        });
    } else {
        allDisplay();
    }
}

function winLose(event, callback) {
    event.winLose = 0;
    const winner = allSmallEvents.find(x => x.event_id.toString() === event.id.toString()).winner;
    if (winner !== null && event.bets.length > 0) {
        event.bets = event.bets.sort((a, b) => (a.time < b.time) ? 1 : ((b.time < a.time) ? -1 : 0));
        event.bets.map(function (bet) {
            const condition = bet.condition;
            if (condition.search("back") >= 0) {
                if (winner.toString() === bet.runnerId.toString()) {
                    bet.win = true;
                    event.winLose += mise * (bet.back - 1);
                    globalWin += mise * (bet.back - 1);
                } else {
                    bet.win = false;
                    event.winLose -= mise;
                    globalWin -= mise;
                }
            }
        });
        callback();
    } else {
        callback();
    }
    let date = new Date(event.start * 1000);
    if (event.bets.length === 0 || event.winLose === 0) {
        eventsNoBets.push(event.name + " " + date.getDate() + "/" + date.getMonth());
    } else {
        let allBets = "";
        event.bets.map(function (bet) {
            allBets += bet.condition;
        });
        eventsBets.push([event.name + " " + date.getDate() + "/" + date.getMonth(), allBets, event.bets, parseInt(event.winLose * 1000) / 1000]);
    }

}

function allDisplay() {
    const percent = parseInt((globalWin / allSmallEvents.length) * 10000) / 100;
    console.log("global win", parseInt(globalWin * 100) / 100, "nb Match", allSmallEvents.length, "%", percent);
    let nbBets = 0;
    const dumpBestBet = {};
    eventsBets.map(function (event) {
        nbBets += event[2].length;
        const bets = event[2];
        bets.map(function (bet) {
            const prop = bet.condition;
            if (!dumpBestBet.hasOwnProperty(bet.condition)) {
                dumpBestBet[prop] = {
                    win: 0,
                    lose: 0,
                    nb: 0,
                    percent: null,
                };
            }
            if (bet.win === true) {
                dumpBestBet[bet.condition].win += mise * (bet.back - 1);
            } else {
                dumpBestBet[bet.condition].lose -= mise;
            }
            dumpBestBet[bet.condition].nb++;
        });
    });
    Object.keys(dumpBestBet).map(function (key, index) {
        dumpBestBet[key].win = parseInt(dumpBestBet[key].win * 100) / 100;
        dumpBestBet[key].percent = parseInt((dumpBestBet[key].win + dumpBestBet[key].lose) / dumpBestBet[key].nb * 100) / 100;
    });
    console.log(eventsBets, dumpBestBet);
    console.log(nbBets, "bets");
    console.log(eventsNoBets);
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