const Const = require('../Const.js').Const;

function addAllSportsToSelectDom() {
    Const.ALL_SPORTS.map(function (element) {
        let selected = "";
        if (element.id === 24735152712200) {
            selected = "selected";
        }
        $("select[sport-select]").append("<option " + selected + " name='sport' value='" + element.id + "'>" + element.id + " : " + element.name + "</option>")
    });
}

function manageAfterValue() {
    $("#after-sport").val(parseInt(Date.now() / 1000));
}

module.exports = {
    addAllSportsToSelectDom,
    manageAfterValue,
};