const util = require('util');
const fs = require('fs');
const brain = require('brain.js');

function Brain(symfonyApi) {
    this.symfonyApi = symfonyApi;
    this.nbRunners = 6;
    this.smoothTime = 1000;
    this.net = [];

    this.init = function () {
        const $this = this;
        const idsTraining = [3];
        $this.importMatch(idsTraining, function () {
            console.log("all match trained !");
            const startRun = parseInt(new Date().getTime() / 1000);
            // const output = $this.net.run([0.16,
            //     0.18,
            //     0.16]);
            // const endRun = parseInt(new Date().getTime() / 1000) - startRun;
            // console.log(output + " run done ! took " + endRun + " s");
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

    this.smoothPrices = function (market, id, callback) {
        const $this = this;
        market.runners.map(function (runner, indexRunner) {
            if (indexRunner < $this.nbRunners) {
                console.log("[" + id + "] smooth prices " + runner.name);
                for (let i = 0; i < $this.smoothTime; i++) {
                    runner.prices.map(function (price, index) {
                        if (index !== 0 && index !== runner.prices.length - 1) {
                            const currentTime = Object.keys(runner.prices[index])[0];
                            if (currentTime > -3600) {
                                const prevTime = Object.keys(runner.prices[index - 1])[0];
                                const nextTime = Object.keys(runner.prices[index + 1])[0];

                                const currentValues = runner.prices[index][currentTime];
                                const prevValues = runner.prices[index - 1][prevTime];
                                const nextValues = runner.prices[index + 1][nextTime];

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
            }
        });
        callback();
    };

    this.trainForOneMarket = function (market, id, callback) {
        const $this = this;
        console.log("[" + id + "] start train ...");
        if (market.runners.length >= $this.nbRunners) {
            const eventExport = [];
            let allRunners = market.runners.map(function (runner, index) {
                if (index < $this.nbRunners) {
                    return {
                        name: runner.name,
                        volume: "",
                        backOdd: "",
                        backAvailableAmount: "",
                        layOdd: "",
                        layAvailableAmount: "",
                    };
                }
            });
            allRunners = allRunners.filter(el => el != null);
            for (let i = -3599; i < 0; i++) {
                eventExport.push({
                    time: i,
                    runners: JSON.parse(JSON.stringify(allRunners)),
                });
            }
            $this.smoothPrices(market, id, function () {
                market.runners.map(function (runner, index) {
                    if ((index < $this.nbRunners) && (typeof allRunners.find(x => x.name === runner.name) !== "undefined")) {
                        runner.volume.map(function (volume) {
                            const key = Object.keys(volume)[0];
                            const value = volume[key];
                            const time = parseInt(key);
                            const runnerToUpdate = eventExport.find(x => x.time === time).runners.find(y => y.name === runner.name);
                            runnerToUpdate.volume = value;
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
                const startTrain = parseInt(new Date().getTime() / 1000);
                console.log("[" + id + "] start train ...");
                const net = new brain.recurrent.LSTMTimeStep({
                    inputSize: $this.nbRunners,
                    hiddenLayers: [10, 20, 30],
                    outputSize: $this.nbRunners,
                });
                const training = [];
                eventExport.map(function (obj) {
                    const tempTraining = [];
                    let isComplete = true;
                    obj.runners.map(function (runner) {
                        if (runner.backOdd < 1) {
                            isComplete = false;
                        } else {
                            tempTraining.push(parseInt(1 / runner.backOdd * 100) / 100);
                        }
                    });
                    if (isComplete) {
                        training.push(tempTraining);
                    }
                });
                const stats = net.train(training, {log: (status) => console.log(status)});
                const endTrain = parseInt(new Date().getTime() / 1000);
                const trainTime = startTrain - endTrain;
                console.log("[" + id + "] trained in " + trainTime + " s", stats);
                $this.net.push(net);
                callback();
            });
        } else {
            console.log("[" + id + "] not enough runners");
            callback();
        }
    };
}

module.exports = {
    Brain,
};