const Env = require('./Env.js').Env;

const Const = {
    POST: 'POST',
    GET: 'GET',
    // MATCHBOOK
    EXCHANGE_TYPE_BACK: "back",
    EXCHANGE_TYPE_LAY: "lay",
    // Env
    DEV: "dev",
    PROD: "prod",
    //API
    API_TEST: 'api-doc-test-client',
    GET_SESSION_URL: 'https://api.matchbook.com/bpapi/rest/security/session',
    LOGIN_URL: 'https://api.matchbook.com/bpapi/rest/security/session',
    SUBMIT_OFFERS_URL: 'https://api.matchbook.com/edge/rest/v2/offers',
    GET_SPORTS_URL: 'https://api.matchbook.com/edge/rest/lookups/sports',
    GET_EVENTS_URL: 'https://api.matchbook.com/edge/rest/events',
    GET_SETTLED_BETS: 'https://api.matchbook.com/edge/rest/reports/v2/bets/settled',
    //Symfony
    SYMFONY_SAVE_EVENT: Env.SYMFONY_BASE_URL + "save-event",
    SYMFONY_GET_EVENT: Env.SYMFONY_BASE_URL + "get-event",

};

module.exports = {
    Const,
};