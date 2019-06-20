// Env file depends on machine/server environment should NOT be track by git
const Env = {
    SYMFONY_URL: "//matchbook:80/",
    APP_ENV: "dev",
};

module.exports = {
    Env,
};