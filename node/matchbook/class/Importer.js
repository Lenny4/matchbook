const Env = require('../Env.js').Env;

function Importer(matchbookApi) {
    this.eventsToImport = [];
    this.matchbookApi = matchbookApi;
    this.autoImportConfig = Env.AUTO_IMPORT_CONFIF;

    this.init = function () {
        const $this = this;
        const resetTime = Math.max.apply(Math, $this.autoImportConfig.map(function (o) {
            return o.updateTime;
        }));
        const reImportTime = Math.min.apply(Math, $this.autoImportConfig.map(function (o) {
            return o.updateTime;
        }));
        $this.autoImportEvent(1, $this.autoImportConfig, resetTime, reImportTime);
    };

    this.addImport = function (eventIds, callback) {
        const $this = this;
        $this.matchbookApi.getEventsId(eventIds, function (events) {
            console.log("Adding events to the importer ...");
            //TODO foreach events as event instancier l'objet Event.js avec comme constructeur l'event de events
            console.log(events);
        });
        callback(true);
    };

    this.autoImportEvent = function (currentTime, config, resetTime) {
        const $this = this;
        currentTime += 1;
        const arrayToImport = [];
        config.map(function (x) {
            if (currentTime % x.updateTime === 0) {
                arrayToImport.push(x);
            }
        });
        // console.log(arrayToImport);
        if (currentTime >= resetTime) {
            currentTime = 1;
        }
        setTimeout(function () {
            $this.autoImportEvent(currentTime, config, resetTime, 1);
        }, 1000); //Matchbook API recommend not exceed 60 call per minute
    }
}

module.exports = {
    Importer,
};