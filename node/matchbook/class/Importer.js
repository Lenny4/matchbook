function Importer(matchbookApi) {
    this.eventsToImportIds = [];
    this.matchbookApi = matchbookApi;

    this.startImport = function (ids, callback) {
        const $this = this;
        callback(true);
    };

    this.getImportingEvents = function (callback) {
        const $this = this;
        callback($this.eventsToImportIds);
    };
}

module.exports = {
    Importer,
};