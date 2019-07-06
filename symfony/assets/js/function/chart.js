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
    datas.map(function (price) {
        const time = Object.keys(price)[0];
        const details = price[time];
        const finalArray = [time];
        if (minLine) {
            if (details.filter(x => x.side === "back").length > 0) {
                const maxBack = details.filter(x => x.side === "back").reduce(function (prev, current) {
                    return (prev.odd > current.odd) ? prev : current
                });
                if (typeof maxBack !== "undefined") {
                    finalArray.push(maxBack[type]);
                    lastBack = maxBack[type];
                } else {
                    finalArray.push(lastBack);
                }
            } else {
                finalArray.push(lastBack);
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

function drawRunner(marketDiv, marketId, datas) {
    // drawRunnerVolume(marketDiv, marketId, datas.volume, datas.name);
    drawRunnerPrices(marketDiv, marketId, datas.prices, datas.name, "odds", true);
    // drawRunnerPrices(marketDiv, marketId, datas.prices, datas.name, "available-amount", true);
}

module.exports = {
    drawVolumeMarket,
    drawBackLayGlobal,
    drawRunner,
};