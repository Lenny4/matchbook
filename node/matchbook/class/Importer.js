function Importer(matchbookApi) {
    this.eventsToImport = [];
    this.matchbookApi = matchbookApi;
    this.init = function () {
        const autoImportConfig = [
            //updateTime min value 1 /!\
            {time: 0, updateTime: 1},//more than 0 minute update all 1 s
            {time: 300, updateTime: 2},//more than 5 minutes update all 2 s
            {time: 600, updateTime: 5},//more than 10 minutes update all 5 s
            {time: 900, updateTime: 60},//more than 15 minutes update all 60 s
            {time: 1800, updateTime: 300},//more than 30 minutes update all 300 s
            {time: 3600, updateTime: 600},//more than 60 minutes update all 600 s
        ];
        const resetTime = Math.max.apply(Math, autoImportConfig.map(function (o) {
            return o.updateTime;
        }));
        const reImportTime = Math.min.apply(Math, autoImportConfig.map(function (o) {
            return o.updateTime;
        }));
        autoImportEvent(1, autoImportConfig, resetTime, reImportTime);
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

    function autoImportEvent(currentTime, config, resetTime, reImportTime) {
        currentTime += reImportTime;
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
            autoImportEvent(currentTime, config, resetTime, reImportTime);
        }, reImportTime * 1000);
    }
}

module.exports = {
    Importer,
};