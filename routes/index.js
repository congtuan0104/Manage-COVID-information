const siteRoute = require('./site');
const testRoute = require('./test');


function route(app) {
    app.use('/test',testRoute);
    app.use('/', siteRoute);
}

module.exports = route;
