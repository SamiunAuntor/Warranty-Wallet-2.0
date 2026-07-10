const routes = require("./notification.route");
const controller = require("./notification.controller");
const service = require("./notification.service");
const repository = require("./notification.repository");

module.exports = {
    routes,
    controller,
    service,
    repository,
};