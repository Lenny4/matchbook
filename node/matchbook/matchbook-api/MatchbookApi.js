const request = require("request");

function MatchbookApi(username, password) {
    this.username = username;
    this.password = password;
    this.connected = false;
    this.sessionToken = null;
    this.GetSessionUrl = 'https://api.matchbook.com/bpapi/rest/security/session';
    this.Login = 'https://api.matchbook.com/bpapi/rest/security/session';

    this.login = function (callback) {
        const $this = this;
        console.log('Logging to matchbook API ...');
        const options = {
            method: 'POST',
            url: $this.Login,
            json: {
                "username": $this.username,
                "password": $this.password
            },
            headers: {'user-agent': 'api-doc-test-client'}
        };
        request(options, function (error, response, body) {
            if (typeof response !== "undefined" && typeof response.statusCode !== "undefined" && response.statusCode === 200) {//200 OK
                $this.connected = true;
                $this.sessionToken = body['session-token'];
                callback(true);
                console.log('Logging to matchbook API OK !', response.statusCode);
            } else {//error
                $this.connected = false;
                $this.sessionToken = null;
                callback(false);
                if (error) {
                    console.log(error);
                } else {
                    console.log('Logging to matchbook API KO !', response.statusCode);
                }
            }
        });
    }
}

module.exports = {
    MatchbookApi,
};