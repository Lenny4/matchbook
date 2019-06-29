function LiveBetting() {
    this.start = function (callback) {
        console.log("Start live betting ...");
        callback(true);
    }
}

module.exports = {
    LiveBetting,
};