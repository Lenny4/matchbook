// Env file depends on machine/server environment should NOT be track by git
const Env = {
    // Account
    USERNAME: "matchibc45",
    PASSWORD: "Computer210496,",

    SYMFONY_URL: "//matchbook:80/",
    APP_ENV: "dev",
    DEV_SESSION_TOKEN: "147329_5aed89da571e5ebc18767e7bd5c524",

    AUTO_IMPORT_CONFIF: [
        //updateTime min value 1 /!\ Matchbook API recommend not exceed 60 call per minute
        {time: 0, updateTime: 1},//more than 0 minute update all 1 s
        {time: 300, updateTime: 2},//more than 5 minutes update all 2 s
        {time: 600, updateTime: 5},//more than 10 minutes update all 5 s
        {time: 900, updateTime: 60},//more than 15 minutes update all 60 s
        {time: 1800, updateTime: 300},//more than 30 minutes update all 300 s
        {time: 3600, updateTime: 600},//more than 60 minutes update all 600 s
    ],
};

module.exports = {
    Env,
};