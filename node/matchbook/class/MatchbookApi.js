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
        this.headers['user-agent'] = Const.API_TEST;
    }
    // urls
    this.GetSessionUrl = Const.GET_SESSION_URL;
    this.LoginUrl = Const.LOGIN_URL;
    this.GetSportsUrl = Const.GET_SPORTS_URL;
    this.getEventsUrl = Const.GET_EVENTS_URL;

    this.login = function (env, callback) {
        const $this = this;
        console.log('Logging to matchbook API ...');
        if (env === Const.PROD) { // prod
            const options = {
                method: Const.POST,
                url: $this.LoginUrl,
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
                    console.log('Logging to matchbook API OK !', response.statusCode, "token", body['session-token']);
                    callback(true);
                } else {//error
                    $this.connected = null;
                    delete $this.headers['session-token'];
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Logging to matchbook API KO !', response.statusCode);
                    }
                    callback(false);
                }
            });
        } else { // dev
            const options = {
                method: Const.GET,
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
            method: Const.POST,
            url: $this.LoginUrl,
            json: {
                "username": $this.username,
                "password": $this.password
            },
            headers: $this.headers,
        };
        request(options, function (error, response, body) {
            if (typeof response !== "undefined" && typeof response.statusCode !== "undefined" && response.statusCode === 200) {//200 OK
                console.log('Generating new token OK !', response.statusCode, "token", body['session-token']);
                callback(body['session-token']);
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
            method: Const.GET,
            url: $this.GetSportsUrl,
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
                console.log('Get Sports OK !', response.statusCode);
                callback(JSON.parse(body)['sports']);
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

    this.getEventsView = function (data, callback) {
        const $this = this;
        console.log('Getting Events View ...', data);
        const after = data.find(x => x.name === "after").value;
        const before = parseInt(after) + (3600 * 24 * 3);//3 days
        const options = {
            method: Const.GET,
            url: $this.getEventsUrl,
            qs: {
                offset: '0',
                'per-page': '100',
                after: after,
                before: before.toString(),
                'sport-ids': data.find(x => x.name === "sport-ids").value,
                'exchange-type': 'back-lay',
                'include-prices': 'false',
            },
            headers: $this.headers,
        };
        request(options, function (error, response, body) {
            if (typeof response !== "undefined" && typeof response.statusCode !== "undefined" && response.statusCode === 200) {//200 OK
                console.log('Get Events View OK !', response.statusCode);
                callback(JSON.parse(body));
            } else {//error
                callback(false);
                if (error) {
                    console.log(error);
                } else {
                    console.log('Get Events View KO !', response.statusCode);
                }
            }
        });
    };

    this.getEventsId = function (data, callback) {
        const $this = this;
        console.log('Getting Events by id ...');
        const perPage = data.length.toString();
        const ids = data.join();
        const options = {
            method: Const.GET,
            url: $this.getEventsUrl,
            qs: {
                offset: '0',
                'per-page': perPage,
                ids: ids,
                'include-prices': 'true',
                'price-depth': '5',
            },
            headers: $this.headers,
        };
        request(options, function (error, response, body) {
            if (typeof response !== "undefined" && typeof response.statusCode !== "undefined" && response.statusCode === 200) {//200 OK
                console.log('Get Events Id OK !', response.statusCode);
                callback(JSON.parse(body).events);
            } else {//error
                callback(false);
                if (error) {
                    console.log(error);
                } else {
                    console.log('Get Events Id KO !', response.statusCode);
                }
            }
        });
    };
}

module.exports = {
    MatchbookApi,
};