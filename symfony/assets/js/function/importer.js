const Const = require('../Const.js').Const;
const DateFunction = require('./date.js');

function addAllSportsToSelectDom() {
    Const.ALL_SPORTS.map(function (element) {
        let selected = "";
        if (element.id === 24735152712200) {
            selected = "selected";
        }
        $("select[sport-select]").append("<option " + selected + " name='sport' value='" + element.id + "'>" + element.name + " : " + element.id + "</option>")
    });
}

function manageAfterValue() {
    $("#after-sport").val(parseInt(Date.now() / 1000));
}

function displayEvents(events) {
    events = events.filter(x => x['allow-live-betting'] === true);
    const div = $("#display-events-import");
    const now = parseInt(new Date().getTime() / 1000);
    $(div).html("");
    events.map(function (event) {
        const dateStart = new Date(event.start);
        const timestampStart = parseInt(dateStart.getTime() / 1000);
        $(div).append(
            "<div style='margin-bottom: 10px' class='col-3'>" +
            "<div class='box-shadow' style='position: relative'>" +
            "<p><strong>" + event.name + "</strong><br/><i style='margin-left: 5px'>" + DateFunction.getHumanTimeBetweenDiff(now, timestampStart) + "</i></p>" +
            "<p><strong>" + parseInt(event.volume).toLocaleString() + "</strong></p>" +
            "<div class='custom-control custom-checkbox'><input checked type='checkbox' class='custom-control-input' id='" + event.id + "'><label class='custom-control-label' for='" + event.id + "'></label></div>" +
            "</div>" +
            "</div>"
        );
    });
}

function startImport(socket) {
    const eventsChecked = $("#display-events-import").find("input:checked");
    const eventIds = [];
    eventsChecked.map(function (index, event) {
        eventIds.push($(event).attr("id"));
    });
    socket.emit('start_import', eventIds, function (result) {
        console.log(result);
    });
}

module.exports = {
    addAllSportsToSelectDom,
    manageAfterValue,
    displayEvents,
    startImport,
};