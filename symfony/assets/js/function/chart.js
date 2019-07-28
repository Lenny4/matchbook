function drawVolumeMarket(marketDiv, marketId, datas) {
    const array = [
        ['Time', 'Volume']
    ];
    datas.map(function (thisVolume) {
        const time = Object.keys(thisVolume)[0];
        const volume = parseInt(thisVolume[time]);
        array.push([time, volume]);
    });
    const data = google.visualization.arrayToDataTable(array);
    const options = {
        title: 'Global Volume of market',
        curveType: 'function',
        legend: {position: 'bottom'},
        width: 400,
        height: 200,
        chartArea: {left: 10, top: 20, width: "100%", height: "100%"},
    };
    const idChart = marketId + "_market";
    const chartDiv = $("<div class='chart' id='" + idChart + "'></div>").appendTo(marketDiv);
    const chart = new google.visualization.LineChart(document.getElementById(idChart));
    chart.draw(data, options);
}

function drawBackLayGlobal(marketDiv, marketId, back, lay) {
    const array = [
        ['Time', 'Back/Lay']
    ];
    let size = 0;
    if (Array.isArray(back)) {
        size = back.length;
    }
    if (Array.isArray(lay)) {
        size = lay.length;
    }
    for (let i = 0; i < size; i++) {
        const time = Object.keys(back[i])[0];
        const backValue = parseInt(back[i][time]);
        const layValue = parseInt(lay[i][time]);
        const backLayValue = backValue / layValue;
        array.push([time, backLayValue]);
    }
    const data = google.visualization.arrayToDataTable(array);
    const options = {
        title: 'Back - Lay Global',
        curveType: 'function',
        legend: {position: 'bottom'},
        width: 400,
        height: 200,
        chartArea: {left: 10, top: 20, width: "100%", height: "100%"},
    };
    const idChart = marketId + "_back_lay_global";
    const chartDiv = $("<div class='chart' id='" + idChart + "'></div>").appendTo(marketDiv);
    const chart = new google.visualization.LineChart(document.getElementById(idChart));
    chart.draw(data, options);
}

function drawRunnerPrices(marketDiv, marketId, datas, name, type, minLine = false) {
    let max = null;
    let nbOddsBack = 0;
    let nbOddsLay = 0;
    const subArray = [];
    const indexBack = [];
    const indexLay = [];
    if (minLine) {
        nbOddsBack = 1;
        nbOddsLay = 1;
        subArray.push("Back");
        // subArray.push("Lay");
        indexBack.push(0);
        indexLay.push(0);
    } else {
        datas.find(function (o) {
            const arrayPrice = o[Object.keys(o)[0]];
            if (max === null) {
                max = arrayPrice.slice();
            } else if (arrayPrice.length > max.length) {
                max = arrayPrice.slice();
            }
        });
        max.map(function (price, index) {
            if (price.side === "back") {
                nbOddsBack++;
                subArray.push("Back_" + nbOddsBack);
                indexBack.push(index);
            } else if (price.side === "lay") {
                nbOddsLay++;
                // subArray.push("Lay_" + nbOddsLay);
                // indexLay.push(index);
            }
        });
    }
    const array = [
        ['Time'].concat(subArray)
    ];
    let lastBack = 0;
    let lastLay = 0;
    for (let i = 0; i < 100; i++) {
        datas.map(function (price, index) {
            if (index !== 0 && index !== datas.length - 1) {
                const currentTime = Object.keys(datas[index])[0];
                if (currentTime > -3600) {
                    const prevTime = Object.keys(datas[index - 1])[0];
                    const nextTime = Object.keys(datas[index + 1])[0];

                    const currentValues = datas[index][currentTime];
                    const prevValues = datas[index - 1][prevTime];
                    const nextValues = datas[index + 1][nextTime];

                    const currentBack = currentValues.find(x => x.side === "back");
                    const currentLay = currentValues.find(x => x.side === "lay");

                    const prevBack = prevValues.find(x => x.side === "back");
                    const prevLay = prevValues.find(x => x.side === "lay");

                    const nextBack = nextValues.find(x => x.side === "back");
                    const nextLay = nextValues.find(x => x.side === "lay");

                    const backArray = [];
                    const layArray = [];
                    if (typeof currentBack !== "undefined") {
                        backArray.push(currentBack.odds);
                        backArray.push(currentBack.odds);
                        if (typeof prevBack !== "undefined") {
                            backArray.push(prevBack.odds);
                        }
                        if (typeof nextBack !== "undefined") {
                            backArray.push(nextBack.odds);
                        }
                        const sumBack = backArray.reduce(function (a, b) {
                            return a + b;
                        });
                        const avgBack = sumBack / backArray.length;
                        currentBack.odds = avgBack;
                    }


                    if (typeof currentLay !== "undefined") {
                        layArray.push(currentLay.odds);
                        layArray.push(currentLay.odds);
                        if (typeof prevLay !== "undefined") {
                            layArray.push(prevLay.odds);
                        }
                        if (typeof nextLay !== "undefined") {
                            layArray.push(nextLay.odds);
                        }
                        const sumLay = layArray.reduce(function (a, b) {
                            return a + b;
                        });
                        const avgLay = sumLay / layArray.length;
                        currentLay.odds = avgLay;
                    }
                }
            }
        });
    }
    datas.map(function (price) {
        const time = Object.keys(price)[0];
        if (time > -3600) {
            const details = price[time];
            const finalArray = [time];
            if (minLine) {
                if (details.filter(x => x.side === "back").length > 0) {
                    const maxBack = details.filter(x => x.side === "back").reduce(function (prev, current) {
                        return (prev.odd > current.odd) ? prev : current
                    });
                    if (typeof maxBack !== "undefined") {
                        finalArray.push(1 / maxBack[type]);
                        lastBack = maxBack[type];
                    } else {
                        finalArray.push(1 / lastBack);
                    }
                } else {
                    finalArray.push(1 / lastBack);
                }
                // if (details.filter(x => x.side === "lay").length > 0) {
                //     const minLay = details.filter(x => x.side === "lay").reduce(function (prev, current) {
                //         return (prev.odd < current.odd) ? prev : current
                //     });
                //
                //     if (typeof minLay !== "undefined") {
                //         finalArray.push(minLay[type]);
                //         lastLay = minLay[type];
                //     } else {
                //         finalArray.push(lastLay);
                //     }
                // } else {
                //     finalArray.push(lastLay);
                // }
            } else {
                details.map(function (detail, index) {
                    //if you have problem with back and lay graph try to ORDER BY detail with side ASC
                    if ((detail.side === "back" && indexBack.includes(index))) {
                        finalArray.push(detail[type]);//odds or available-amount
                    } else {
                        finalArray.push(0);
                    }
                });
                if (finalArray.length - 1 !== (indexBack.length + indexLay.length)) {
                    const nbZeroToAdd = Math.abs(finalArray.length - 1 - (indexBack.length + indexLay.length));
                    for (let i = 0; i < nbZeroToAdd; i++) {
                        finalArray.push(0);
                    }
                }
            }
            if (parseInt(time) > -7200) {//event start in less than 2 hours
                array.push(finalArray);
            }
        }
    });
    const data = google.visualization.arrayToDataTable(array);
    const options = {
        title: name + " prices " + type,
        curveType: 'function',
        legend: {position: 'bottom'},
        width: 400,
        height: 200,
        chartArea: {left: 10, top: 20, width: "100%", height: "100%"},
    };
    const idChart = marketId + "_price_runner_" + name + type;
    const chartDiv = $("<div class='chart' id='" + idChart + "'></div>").appendTo(marketDiv);
    const chart = new google.visualization.LineChart(document.getElementById(idChart));
    chart.draw(data, options);
}

function drawMACD(marketDiv, marketId, datas, name, socket) {
    const array = [
        ['Time', 'macd - signal']
    ];
    socket.emit('chart_macd', datas, function (result) {
        let time = -3600;
        result.map(function (macdArray) {
            if (typeof macdArray.MACD !== "undefined" && typeof macdArray.signal !== "undefined" && time > -600) {
                array.push([time, macdArray.MACD - macdArray.signal]);
            }
            time += 1;
        });
        const data = google.visualization.arrayToDataTable(array);
        const options = {
            title: name + " macd",
            curveType: 'function',
            legend: {position: 'bottom'},
            width: 400,
            height: 200,
            chartArea: {left: 10, top: 20, width: "100%", height: "100%"},
        };
        const idChart = marketId + "_macd_runner_" + name;
        const chartDiv = $("<div class='chart' id='" + idChart + "'></div>").appendTo(marketDiv);
        const chart = new google.visualization.LineChart(document.getElementById(idChart));
        chart.draw(data, options);
    });
}

function drawRunnerVolume(marketDiv, marketId, datas, name) {
    const array = [
        ['Time', 'Volume']
    ];
    datas.map(function (thisVolume) {
        const time = Object.keys(thisVolume)[0];
        const volume = parseInt(thisVolume[time]);
        array.push([time, volume]);
    });
    const data = google.visualization.arrayToDataTable(array);
    const options = {
        title: name + " volume",
        curveType: 'function',
        legend: {position: 'bottom'},
        width: 400,
        height: 200,
        chartArea: {left: 10, top: 20, width: "100%", height: "100%"},
    };
    const idChart = marketId + "_volume_runner_" + name;
    const chartDiv = $("<div class='chart' id='" + idChart + "'></div>").appendTo(marketDiv);
    const chart = new google.visualization.LineChart(document.getElementById(idChart));
    chart.draw(data, options);
}

function drawRunner(marketDiv, marketId, datas, socket) {
    // drawRunnerVolume(marketDiv, marketId, datas.volume, datas.name);
    drawRunnerPrices(marketDiv, marketId, datas.prices, datas.name, "odds", true);
    // drawMACD(marketDiv, marketId, datas.prices, datas.name, socket);
    // drawRunnerPrices(marketDiv, marketId, datas.prices, datas.name, "available-amount", true);
}

function drawEventDashBoard(event, div) {
    event.runners.map(function (runner) {
        if (true) {
            const array = [
                ['Time', 'back']
            ];
            runner.prices.map(function (price, index) {
                const time = price.time.toString();
                let lay = price.lay;
                let back = price.back;
                if (lay === 0) {
                    lay = null;
                } else {
                    lay = 1 / lay;
                }
                if (back === 0) {
                    back = null;
                } else {
                    back = 1 / back;
                }
                array.push([time, back]);
            });
            const data = google.visualization.arrayToDataTable(array);
            const options = {
                title: runner.name,
                curveType: 'function',
                legend: {position: 'bottom'},
                width: 400,
                height: 200,
                chartArea: {left: 10, top: 20, width: "100%", height: "100%"},
            };
            const idChart = runner.id + event.id + "_lay";
            const chartDiv = $("<div class='chart' id='" + idChart + "'></div>").appendTo(div);
            const chart = new google.visualization.LineChart(document.getElementById(idChart));
            chart.draw(data, options);
        }
    });
}

module.exports = {
    drawVolumeMarket,
    drawBackLayGlobal,
    drawRunner,
    drawEventDashBoard,
};