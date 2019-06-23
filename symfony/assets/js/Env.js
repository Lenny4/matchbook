// Env file depends on machine/server environment should NOT be track by git
const Env = {
    NODE_URL: "http://localhost:3000/",
    SYMFONY_URL: "http://matchbook:80/api/",
    APP_ENV: "dev",
};

module.exports = {
    Env,
};