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
        $(div).html("");
        events.map(function (event) {
            $(div).append(
                "<div style='margin-bottom: 10px' class='col-3'>" +
                "<div class='box-shadow' style='position: relative'>" +
                "<strong>" + event.name + "</strong><br/>" +
                "<i>" + event.id + "</i><br/>" +
                "<button data-view-event-id='" + event.id + "' class='btn btn-primary'>View</button>" +
                "</div>" +
                "</div>"
            );
        });
    });
}

function showViewEvent(id, button, socket) {
    const url = Env.SYMFONY_URL + Const.SYMFONY_URL_GET_EVENT;
    $(button).prop('disabled', true);
    $.post(url, {id: id}, function (event) {
        $(button).prop('disabled', false);
        $("#nav-view-tab").click();
        viewEvent(JSON.parse(event), socket);
    });
}

function stockfish(runner) {
    const nbOdds = 10;
    const percentDiff = 0.02;
    let lastBet = null;
    runner.bets = [];
    runner.prices.map(function (price, index) {
        const time = Object.keys(price)[0];
        if (time > -600) {
            const back = price[time].find(x => x.side === "back");
            const lay = price[time].find(x => x.side === "lay");
            if (index >= nbOdds) {
                let avg = {
                    sum: 0,
                    coeff: 0,
                };
                for (let i = index - 1; i > index - 1 - nbOdds; i--) {
                    const thisTime = Object.keys(runner.prices[i])[0];
                    const thisBack = runner.prices[i][thisTime].find(x => x.side === "back");
                    avg.sum += thisBack.odds;
                    avg.coeff += 1;
                }
                const thisAvg = avg.sum / avg.coeff;
                const backThisAvgDiff = 1 - back.odds / thisAvg;
                if (backThisAvgDiff < -percentDiff) {
                    if (lastBet !== "lay") {
                        runner.bets.push({
                            time: time,
                            type: "lay",
                            odd: lay.odds,
                        });
                        // console.log(time, thisAvg, back.odds, backThisAvgDiff, "back");
                        // console.log("================");
                        lastBet = "lay";
                    }
                } else if (backThisAvgDiff > percentDiff) {
                    if (lastBet !== "back") {
                        runner.bets.push({
                            time: time,
                            type: "back",
                            odd: back.odds,
                        });
                        // console.log(time, thisAvg, back.odds, backThisAvgDiff, "lay");
                        // console.log("================");
                        lastBet = "back";
                    }
                }
                // console.log(time, thisAvg, back.odds, backThisAvgDiff);
            }
        }
    });
    if (runner.bets.length % 2 !== 0) {
        const lastPrice = runner.prices[runner.prices.length - 1][Object.keys(runner.prices[runner.prices.length - 1])[0]];
        if (runner.bets[runner.bets.length - 1].type === "lay") {
            runner.bets.push({
                time: 0,
                type: "back",
                odd: lastPrice.find(x => x.side === "back").odds,
            });
        } else {
            runner.bets.push({
                time: 0,
                type: "lay",
                odd: lastPrice.find(x => x.side === "lay").odds,
            });
        }
    }
    calculateEsperance([runner]);
    console.log(runner.bets, runner.name);
}

function stockfishv2(runner) {
    const nbOdds = 10;
    let lastBet = null;
    runner.bets = [];
    runner.prices.map(function (price, index) {
        const time = Object.keys(price)[0];
        if (time > -600) {
            const back = price[time].find(x => x.side === "back");
            const lay = price[time].find(x => x.side === "lay");
            if (index >= nbOdds) {
                let lastBack = null;
                const lowHigh = {
                    low: 0,
                    high: 0,
                    flat: 0,
                };
                for (let i = index - 1; i > index - 1 - nbOdds; i--) {
                    const thisTime = Object.keys(runner.prices[i])[0];
                    const thisBack = runner.prices[i][thisTime].find(x => x.side === "back");
                    if (lastBack !== null) {
                        if (thisBack.odds > lastBack) {
                            lowHigh.low += 1;
                        } else if (thisBack.odds < lastBack) {
                            lowHigh.high += 1;
                        } else {
                            lowHigh.flat += 1;
                        }
                    }
                    // console.log(time, goLowOrHigh, lastBack, back.odds, thisBack.odds);
                    lastBack = thisBack.odds;
                    moreGlobal += 1;
                }
                // console.log(time, lowHigh);
                if (lastBet !== "lay" && (lowHigh.high > 2 && lowHigh.low === 0)) {
                    runner.bets.push({
                        time: time,
                        type: "lay",
                        odd: lay.odds,
                    });
                    // console.log(time, thisAvg, back.odds, backThisAvgDiff, "back");
                    // console.log("================");
                    lastBet = "lay";
                } else if (lastBet !== "back" && (lowHigh.low > 2 && lowHigh.high === 0)) {
                    runner.bets.push({
                        time: time,
                        type: "back",
                        odd: back.odds,
                    });
                    // console.log(time, thisAvg, back.odds, backThisAvgDiff, "lay");
                    // console.log("================");
                    lastBet = "back";
                }
            }
        }
    });
    if (runner.bets.length % 2 !== 0) {
        const lastPrice = runner.prices[runner.prices.length - 1][Object.keys(runner.prices[runner.prices.length - 1])[0]];
        if (runner.bets[runner.bets.length - 1].type === "lay") {
            runner.bets.push({
                time: 0,
                type: "back",
                odd: lastPrice.find(x => x.side === "back").odds,
            });
        } else {
            runner.bets.push({
                time: 0,
                type: "lay",
                odd: lastPrice.find(x => x.side === "lay").odds,
            });
        }
    }
    calculateEsperance([runner]);
    console.log(runner.bets, runner.name);
}

function calculateEsperance(runners) {
    const $this = this;
    let esperance = 0;
    runners.map(function (runner) {
        if (runner.bets.length > 0) {
            let runnerEsperance = {
                sumBetsEsperance: 0,
                nbBetsEsperance: 0,
            };
            runner.bets.map(function (bet, index) {
                if (index % 2 === 0) {
                    let backBet = runner.bets[index].odd;
                    let layBet = runner.bets[index + 1].odd;
                    if (runner.bets[index].type === "lay") {
                        backBet = runner.bets[index + 1].odd;
                        layBet = runner.bets[index].odd;
                    }
                    runnerEsperance.sumBetsEsperance += (backBet - layBet) * (1 / (backBet + layBet) / 2);
                    runnerEsperance.nbBetsEsperance++;
                }
            });
            esperance += runnerEsperance.sumBetsEsperance / runnerEsperance.nbBetsEsperance;
            console.log(runnerEsperance.sumBetsEsperance / runnerEsperance.nbBetsEsperance, runner.name);
        }
    });
    console.log(esperance, "E(X)");
}

function viewEvent(event, socket) {
    const div = $("#nav-view");
    $(div).find(".h1").html(event.name);
    $(div).find(".h2").html(Const.ALL_SPORTS.find(x => x.id === parseInt(event["sport-id"])).name);
    $(div).find(".h3").html(date.timestampToHuman(event.start));
    const viewDiv = $(div).find(".view");
    $(viewDiv).html("");
    event.markets.map(function (market, index) {
        if (index === 0) {
            const marketDiv = $("<div class='market' id='" + market.id + "'></div>").appendTo(viewDiv);
            $(marketDiv).append("<h1 style='clear: both;'>" + market.name + "</h1>");
            chart.drawVolumeMarket(marketDiv, market.id, market.volume);
            chart.drawBackLayGlobal(marketDiv, market.id, market["back-overround"], market["lay-overround"]);
            market.runners.map(function (runner, index) {
                // if (index === 0) {
                // stockfish(runner);
                stockfishv2(runner);
                chart.drawRunner(marketDiv, market.id, runner, socket);
                // }
            });
            $(viewDiv).append("<hr/><hr/>");
        }
    });
}

module.exports = {
    showAllImported,
    showViewEvent,
};