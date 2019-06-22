function Event() {
    this.id = null;
    this.name = null;
    this.start = null;
    this['sport-id'] = null;
    this.status = null;
    this.markets = [];

    this.init = function (event, callback) {
        const $this = this;
        $this.id = event.id;
        $this.name = event.name;
        $this.start = parseInt(new Date(event.start).getTime() / 1000);
        $this['sport-id'] = event['sport-id'];
        event.markets.map(function (market) {
            const runners = [];
            market.runners.map(function (runner) {
                runners.push({
                    id: runner.id,
                    name: runner.name,
                    volume: [],
                    prices: [],
                });
            });
            $this.markets.push({
                id: market.id,
                name: market.name,
                volume: [],
                'back-overround': [],
                'lay-overround': [],
                runners: runners,
            });
        });
        const time = parseInt(new Date().getTime() / 1000) - $this.start;
        $this.update(event, time, function (result) {
            callback(result);
        });
    };

    this.update = function (event, time, callback) {
        const $this = this;
        $this.status = event.status;
        event.markets.map(function (market) {
            const $thisMarket = $this.markets.find(x => x.id === market.id);
            if (typeof $thisMarket !== "undefined") {
                //volume
                $thisMarket.volume.push({
                    [time]: market.volume,
                });
                //back-overround
                $thisMarket['back-overround'].push({
                    [time]: market['back-overround'],
                });
                //lay-overround
                $thisMarket['lay-overround'].push({
                    [time]: market['lay-overround'],
                });
                //runners
                market.runners.map(function (runner) {
                    const $thisRunner = $thisMarket.runners.find(x => x.id === runner.id);
                    if (typeof $thisRunner !== "undefined") {
                        //volume
                        $thisRunner.volume.push({
                            [time]: runner.volume,
                        });
                        $thisRunner.prices[time] = [];
                        runner.prices.map(function (price) {
                            $thisRunner.prices[time].push({
                                'available-amount': price['available-amount'],
                                odds: price.odds,
                                side: price.side,
                            });
                        });
                    }
                });
            }
        });
        callback(true);
    };
}

module.exports = {
    Event,
};