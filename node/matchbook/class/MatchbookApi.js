const request = require("request");
const Const = require('../Const.js').Const;

function MatchbookApi(username, password, env) {
    this.username = username;
    this.password = password;
    //session is active for about 6 hours, this var store in timestamp the time of the previous connection
    //a new connection will be made every 5 hours (not 6 hours)
    this.connected = null;
    this.headers = {};
    if (env === Const.DEV) {
        this.headers['user-agent'] = 'api-doc-test-client';
    }
    // urls
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
            headers: $this.headers,
        };
        request(options, function (error, response, body) {
            if (typeof response !== "undefined" && typeof response.statusCode !== "undefined" && response.statusCode === 200) {//200 OK
                $this.connected = Date.now();
                $this.headers['session-token'] = body['session-token'];
                callback(true);
                console.log('Logging to matchbook API OK !', response.statusCode);
            } else {//error
                $this.connected = null;
                delete $this.headers['session-token'];
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