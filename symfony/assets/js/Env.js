// Env file depends on machine/server environment should NOT be track by git
function Env() {
    this.NODE_URL = "//localhost:3000";
    this.APP_ENV = "dev";
}

module.exports = {
    Env,
};