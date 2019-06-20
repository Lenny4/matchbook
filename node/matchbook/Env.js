// Env file depends on machine/server environment should NOT be track by git
function Env() {
    this.SYMFONY_URL = "//matchbook:80/";
    this.APP_ENV = "dev";
}

module.exports = {
    Env,
};