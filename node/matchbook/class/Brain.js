const util = require('util');
const fs = require('fs');
const net = require('brain.js');

function Brain(symfonyApi) {
    this.symfonyApi = symfonyApi;
    this.net = new net.NeuralNetwork();
    this.minVolume = 30000;
    this.config = [
        {
            id: 0,
            values: [
                {
                    name: 'name',
                    trend: [
                        {time: -0, trend: 0},
                    ],
                },
            ]
        },
        {
            id: 3,
            values: [
                {
                    name: '2 Daring Venture',
                    trend: [
                        {time: -3554, trend: 0},
                        {time: -3280, trend: 1},
                        {time: -3126, trend: 0.5},
                        {time: -1462, trend: 0},
                        {time: -964, trend: 0.5},
                        {time: -251, trend: 1},
                        {time: -111, trend: 0},
                        {time: -32, trend: 1},
                    ],
                },
                {
                    name: '5 Defence Treaty',
                    trend: [
                        {time: -3458, trend: 0},
                        {time: -2873, trend: 1},
                        {time: -431, trend: 0},
                        {time: -54, trend: 1},
                    ],
                },
                {
                    name: '9 Jem Scuttle',
                    trend: [
                        {time: -576, trend: 0},
                        {time: -487, trend: 1},
                        {time: -142, trend: 0},
                        {time: -115, trend: 1},
                        {time: -39, trend: 0},
                    ],
                },
                // {
                //     name: '12 Gale Force Maya',
                //     trend: [
                //         {time: -3343, trend: 0},
                //         {time: -2605, trend: 0.5},
                //         {time: -1680, trend: 1},
                //         {time: -978, trend: 0},
                //         {time: -742, trend: 1},
                //         {time: -596, trend: 0.5},
                //         {time: -202, trend: 0},
                //         {time: -39, trend: 1},
                //     ],
                // },
                // {
                //     name: '7 Serengeti Song',
                //     trend: [
                //         {time: -898, trend: 0},
                //         {time: -616, trend: 1},
                //         {time: -549, trend: 0},
                //         {time: -270, trend: 1},
                //         {time: -230, trend: 0},
                //         {time: -176, trend: 1},
                //     ],
                // },
                // {
                //     name: '4 Jack Berry House',
                //     trend: [
                //         {time: -3595, trend: 0},
                //         {time: -3317, trend: 0.5},
                //         {time: -3218, trend: 0},
                //         {time: -2429, trend: 0},
                //         {time: -1116, trend: 1},
                //         {time: -599, trend: 0},
                //         {time: -544, trend: 1},
                //         {time: -269, trend: 0},
                //         {time: -163, trend: 1},
                //         {time: -39, trend: 0},
                //     ],
                // },
                // {
                //     name: '1 Edgewood',
                //     trend: [
                //         {time: -120, trend: 1},
                //     ],
                // },
                // {
                //     name: '3 Puzzle',
                //     trend: [
                //         {time: -120, trend: 1},
                //     ],
                // },
                // {
                //     name: '8 Axe Axelrod',
                //     trend: [
                //         {time: -502, trend: 0},
                //     ],
                // },
                // {
                //     name: '10 Sense of Belonging',
                //     trend: [
                //         {time: -117, trend: 0},
                //     ],
                // },
                // {
                //     name: '11 Barbarosa',
                //     trend: [
                //         {time: -560, trend: 1},
                //         {time: -260, trend: 0},
                //         {time: -217, trend: 1},
                //         {time: -101, trend: 0},
                //     ],
                // },
                // {
                //     name: '13 Epaulini',
                //     trend: [],
                // },
                // {
                //     name: '14 Firsteen',
                //     trend: [],
                // },
            ]
        },
        {
            id: 4,
            values: [
                {
                    name: '1 Be Prepared',
                    trend: [
                        {time: -1377, trend: 0},
                        {time: -554, trend: 1},
                        {time: -289, trend: 0},
                    ],
                },
                {
                    name: '6 Second Love',
                    trend: [
                        {time: -762, trend: 1},
                        {time: -31, trend: 0},
                    ],
                },
                {
                    name: '7 Star Of St James',
                    trend: [
                        {time: -1144, trend: 1},
                        {time: -723, trend: 0},
                        {time: -159, trend: 1},
                    ],
                },
            ]
        },
        {
            id: 5,
            values: [
                {
                    name: '8 Tomfre',
                    trend: [
                        {time: -803, trend: 1},
                        {time: -608, trend: 0},
                        {time: -486, trend: 0},
                    ],
                },
                {
                    name: '6 Flash Henry',
                    trend: [
                        {time: -2542, trend: 1},
                        {time: -1452, trend: 0},
                        {time: -980, trend: 0.5},
                        {time: -51, trend: 0},
                    ],
                },
                {
                    name: '5 Dubai Avenue',
                    trend: [
                        {time: -1490, trend: 0},
                    ],
                },
                // {
                //     name: '1 Broken Rifle',
                //     trend: [
                //         {time: -3364, trend: 1},
                //         {time: -1760, trend: 0},
                //         {time: -1492, trend: 1},
                //         {time: -809, trend: 0},
                //         {time: -455, trend: 0.5},
                //     ],
                // },
            ]
        },
        {
            id: 7,
            values: [
                {
                    name: '4 Zumurud',
                    trend: [
                        {time: -1947, trend: 1},
                        {time: -1336, trend: 0.5},
                        {time: -261, trend: 1},
                    ],
                },
                {
                    name: '6 Zeyzoun',
                    trend: [
                        {time: -3465, trend: 0},
                        {time: -279, trend: 1},
                    ],
                },
                {
                    name: '7 Stoney Lane',
                    trend: [
                        {time: -3567, trend: 0},
                        {time: -2577, trend: 0.5},
                    ],
                },
            ]
        },
    ];

    this.init = function () {
        const $this = this;
        const idsTraining = [3, 4, 5, 7];
        $this.importMatch(idsTraining, function () {
            console.log("all match trained !");
            const startRun = parseInt(new Date().getTime() / 1000);
            const output = $this.net.run([0.16,
                0.18,
                0.16]);
            const endRun = parseInt(new Date().getTime() / 1000) - startRun;
            console.log(output + " run done ! took " + endRun + " s");
        });
    };

    this.importMatch = function (ids, callback, index = 0) {
        const $this = this;
        $this.symfonyApi.getEvent(ids[index], function (event) {
            $this.trainForOneMarket(event.markets[0], ids[index], function () {
                if (index === ids.length - 1) {
                    callback();
                } else {
                    index += 1;
                    $this.importMatch(ids, callback, index);
                }
            });
        });
    };

    this.trainForOneMarket = function (market, id, callback) {
        const $this = this;
        console.log("[" + id + "] start train ...");
        const startTrain = parseInt(new Date().getTime() / 1000);
        const eventExport = [];
        const allRunners = market.runners.map(function (runner) {
            //remove runner with matched volume < 30 000
            return {
                name: runner.name,
                volume: "",
                backOdd: "",
                backAvailableAmount: "",
                layOdd: "",
                layAvailableAmount: "",
                trend: 0.5,
            };
        });
        market.runners.map(function (runner) {
            //remove runner with matched volume < 30 000
            const higherVolume = runner.volume[runner.volume.length - 1];
            const key = Object.keys(higherVolume)[0];
            const value = runner.volume[runner.volume.length - 1][key];
            const config = $this.config.find(x => x.id === id);
            if ((value < $this.minVolume) || (typeof (config.values.find(x => x.name === runner.name)) === "undefined")) {
                const index = allRunners.findIndex(x => x.name === runner.name);
                allRunners.splice(index, 1);
            }
        });
        for (let i = -3599; i < 0; i++) {
            eventExport.push({
                time: i,
                runners: JSON.parse(JSON.stringify(allRunners)),
            });
        }
        const config = $this.config.find(x => x.id === id).values;
        market.runners.map(function (runner) {
            if (typeof allRunners.find(x => x.name === runner.name) !== "undefined") {
                runner.volume.map(function (volume) {
                    const key = Object.keys(volume)[0];
                    const value = volume[key];
                    const time = parseInt(key);
                    const runnerToUpdate = eventExport.find(x => x.time === time).runners.find(y => y.name === runner.name);
                    runnerToUpdate.volume = value;
                    const specificData = config.find(x => x.name === runner.name);
                    if (typeof specificData !== "undefined") {
                        const trend = specificData.trend.filter(x => x.time <= time);
                        if (Array.isArray(trend) && trend.length > 0) {
                            const value = trend.reduce(function (prev, current) {
                                return (prev.time > current.time) ? prev : current
                            });
                            runnerToUpdate.trend = value.trend;
                        }
                    }
                });
                runner.prices.map(function (price) {
                    const key = Object.keys(price)[0];
                    const value = price[key];
                    const time = parseInt(key);
                    const runnerToUpdate = eventExport.find(x => x.time === time).runners.find(x => x.name === runner.name);
                    const back = value.find(x => x.side === "back");
                    const lay = value.find(x => x.side === "lay");
                    if (typeof back !== "undefined") {
                        runnerToUpdate.backOdd = back.odds;
                        runnerToUpdate.backAvailableAmount = back['available-amount'];
                    }
                    if (typeof lay !== "undefined") {
                        runnerToUpdate.layOdd = lay.odds;
                        runnerToUpdate.layAvailableAmount = lay['available-amount'];
                    }
                });
            }
        });
        // ================================================
        // ================================================
        // ================================================
        const training = [];
        let lastTempTraining = {input: [], output: []};
        eventExport.map(function (x) {
            const tempTraining = {input: [], output: []};
            let allNumbers = true;
            x.runners.map(function (runner) {
                const odd = (parseInt((1 / runner.backOdd) * 100)) / 100;
                if (isNaN(odd)) {
                    allNumbers = false;
                }
                tempTraining.input.push(odd);
                tempTraining.output.push(runner.trend);
            });
            if (JSON.stringify(lastTempTraining) !== JSON.stringify(tempTraining) && allNumbers) {
                training.push(tempTraining);
            }
            lastTempTraining = JSON.parse(JSON.stringify(tempTraining));
        });
        $this.net.train(training);
        const endTrain = parseInt(new Date().getTime() / 1000) - startTrain;
        console.log("[" + id + "] train done ! took : " + endTrain + " s");
        callback();
    };
}

module.exports = {
    Brain,
};