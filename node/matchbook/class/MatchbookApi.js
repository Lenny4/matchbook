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
    this.GetSports = 'https://api.matchbook.com/edge/rest/lookups/sports';

    this.login = function (env, callback) {
        const $this = this;
        console.log('Logging to matchbook API ...');
        if (env === Const.PROD) { // prod
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
                    $this.connected = Date.now() + (3600 * 5);//now + 5 hours
                    $this.headers['session-token'] = body['session-token'];
                    callback(true);
                    console.log('Logging to matchbook API OK !', response.statusCode, "token", body['session-token']);
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
        } else { // dev
            const options = {
                method: 'GET',
                url: $this.GetSessionUrl,
                headers: $this.headers,
            };
            request(options, function (error, response, body) {
                if (typeof response !== "undefined" && typeof response.statusCode !== "undefined" && response.statusCode === 200) {//200 OK
                    $this.connected = Date.now() + (3600 * 5);//now + 5 hours
                    callback(true);
                    console.log('Get Session to matchbook API OK !', response.statusCode);
                } else {
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
    };

    this.generateNewTokenDev = function (callback) {
        const $this = this;
        console.log('Generating new token for dev ...');
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
                callback(body['session-token']);
                console.log('Generating new token OK !', response.statusCode, "token", body['session-token']);
            } else {//error
                callback(false);
                if (error) {
                    console.log(error);
                } else {
                    console.log('Generating new token KO !', response.statusCode);
                }
            }
        });
    };

    this.getSports = function (callback) {
        const $this = this;
        console.log('Getting all sports ...');
        const options = {
            method: 'GET',
            url: $this.GetSports,
            qs: {
                offset: '0',
                'per-page': '100',
                order: 'name asc',
                status: 'active'
            },
            headers: $this.headers,
        };
        request(options, function (error, response, body) {
            if (typeof response !== "undefined" && typeof response.statusCode !== "undefined" && response.statusCode === 200) {//200 OK
                callback(JSON.parse(body)['sports']);
                console.log('Get Sports OK !', response.statusCode);
            } else {//error
                callback(false);
                if (error) {
                    console.log(error);
                } else {
                    console.log('Get Sports KO !', response.statusCode);
                }
            }
        });
    };
}

module.exports = {
    MatchbookApi,
};