// Env file depends on machine/server environment should NOT be track by git
const Env = {
    // Account
    USERNAME: "matchibc45",
    PASSWORD: "Computer210496,",

    SYMFONY_BASE_URL: "http://matchbook:80/api/",
    APP_ENV: "dev",
    DEV_SESSION_TOKEN: "147329_77ad71731290e74a223fd8944d95ec",
    AVAILABLE_COUNTRY: "Finland",

    AUTO_IMPORT_CONFIF: [
        //updateTime min value 1 /!\ Matchbook API recommend not exceed 60 call per minute
        {from: -99999999999999, to: 300, updateTime: 1},//more than 0 minute update all 1 s
        {from: 300, to: 600, updateTime: 2},//more than 5 minutes update all 2 s
        {from: 600, to: 900, updateTime: 5},//more than 10 minutes update all 5 s
        {from: 900, to: 1800, updateTime: 15},//more than 15 minutes update all 15 s
        {from: 1800, to: 3600, updateTime: 300},//more than 30 minutes update all 300 s
        {from: 3600, to: 99999999999999, updateTime: 600},//more than 60 minutes update all 600 s
        // {from: -99999999999999, to: 99999999999999, updateTime: 1},//for dev mode
    ],
};

module.exports = {
    Env,
};