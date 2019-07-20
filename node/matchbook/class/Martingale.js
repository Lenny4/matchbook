const Env = require('../Env.js').Env;
const util = require('util');

function Martingale(matchbookApi, symfonyApi) {
    this.events = [];
    this.matchbookApi = matchbookApi;
    this.loss = 0;

    this.start = function () {
        const $this = this;
        $this.findEvents();
    };

    this.findEvents = function () {
        const $this = this;
        // console.log("Live Betting finding events ...");
        const now = parseInt(new Date().getTime() / 1000);
        const data = [
            {name: "sport-ids", value: 24735152712200},
            {name: "after", value: now},
        ];
        $this.matchbookApi.getEventsView(data, function (events) {
            events.events.map(function (event) {
                const start = parseInt(new Date(event.start).getTime() / 1000);
                if (start - now < 600 && start - now > 300) {
                    if (typeof $this.events.find(x => x.id === event.id) === "undefined") {
                        $this.events.push({
                            id: event.id,
                            name: event.name,
                            start: parseInt(new Date(event.start).getTime() / 1000),
                            runners: [],
                        });
                        event.markets[0].runners.map(function (runner) {
                            const $thisEvent = $this.events.find(x => x.id === event.id);
                            if (typeof $thisEvent !== "undefined") {
                                $thisEvent.runners.push({
                                    name: runner.name,
                                    id: runner.id,
                                    odds: [],
                                    bets: [],
                                    lastValue: -1,
                                });
                            } else {
                                console.log("error new created event not found");
                            }
                        });
                    }
                }
            });
            if ($this.events.length > 0) {
                const eventsToBet = events.events.filter(function (event) {
                    if ($this.events.find(x => x.id === event.id)) {
                        return event;
                    }
                });
                console.log("Adding " + eventsToBet.length + " new events", eventsToBet.map(x => x.name));
            } else {
                // console.log("Adding 0 new event");
            }
        }, true);
        setTimeout(function () {
            $this.findEvents();
        }, 300 * 1000);//5min
    };
}

module.exports = {
    Martingale,
};