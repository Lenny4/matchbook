function generateNewToken(socket) {
    socket.emit('generate_new_token_dev', {}, function (result) {
        $("#generate-new-token-result").val(result);
    });
}

module.exports = {
    generateNewToken,
};