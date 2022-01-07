const siteRoute = require('./site');
const patientRoute = require('./patient');

function route(app) {
    app.use('/', siteRoute);
    app.use('/', patientRoute);
}

module.exports = route;