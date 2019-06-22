function getHumanTimeBetweenDiff(date1, date2) {
    let diff = date1 - date2;
    let message = null;
    if (diff > -60 * 60) {
        message = parseInt(diff / 60) + " minutes";
    }
    else {
        const hour = parseInt(diff / (60 * 60));
        message = hour + " hours";
        diff = diff - hour * (60 * 60);
        message += " " + parseInt(diff / 60) * (-1) + " minutes";
    }
    return message;
}

module.exports = {
    getHumanTimeBetweenDiff,
};