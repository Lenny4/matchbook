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

function backLayGlobal(marketDiv, marketId, back, lay) {
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

module.exports = {
    drawVolumeMarket,
    backLayGlobal,
};