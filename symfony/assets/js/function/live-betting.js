const Env = require('../Env.js').Env;
const Const = require('../Const.js').Const;

function start(socket) {
    socket.emit('start_live_betting', {}, function (result) {
        alert(result);
    });
}

module.exports = {
    start,
};