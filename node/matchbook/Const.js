const Const = {
    POST: 'POST',
    GET: 'GET',
    // MATCHBOOK
    EXCHANGE_TYPE_BACK: "back",
    EXCHANGE_TYPE_LAY: "lay",
    EVENT_OPEN: "open",
    // Env
    DEV: "dev",
    PROD: "prod",
    //API
    API_TEST: 'api-doc-test-client',
    GET_SESSION_URL: 'https://api.matchbook.com/bpapi/rest/security/session',
    LOGIN_URL: 'https://api.matchbook.com/bpapi/rest/security/session',
    GET_SPORTS_URL: 'https://api.matchbook.com/edge/rest/lookups/sports',
    GET_EVENTS_URL: 'https://api.matchbook.com/edge/rest/events',
};

module.exports = {
    Const,
};