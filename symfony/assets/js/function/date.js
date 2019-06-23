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

function timestampToHuman(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    return date.toLocaleDateString('fr-FR', options);
}

module.exports = {
    getHumanTimeBetweenDiff,
    timestampToHuman,
};