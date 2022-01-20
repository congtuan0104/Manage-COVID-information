const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const route = require("./routes/index");
const port = 3000;
const handlebars = require("express-handlebars");
const session = require("express-session");

const fs = require("fs");

const https = require("https");

const options = {
  key: fs.readFileSync("cert/key.pem"),
  cert: fs.readFileSync("cert/cert.pem"),
};

const hbs = handlebars.create({
  defaultLayout: "mainLayout",
  extname: "hbs",
  helpers: {
    ifStr(s1, s2, options) {
      if (s1 === s2) {
        return options.fn(this);
      }
      return options.inverse(this);
    },

    eq(s1, s2, option) {
      if (s1 == s2) {
        return option.fn(this);
      }
      return option.inverse(this);
    },

    if_even(conditional, options) {
      if (conditional % 2 == 0) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },

    sum(s1, s2) {
      return parseInt(s1) + parseInt(s2);
    },

    sub(s1, s2) {
      return parseInt(s1) - parseInt(s2);
    },

    for(from, to, incr, block) {
      var accum = "";
      for (var i = from; i < to; i += incr) accum += block.fn(i);
      return accum;
    },
  },
});

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    //cookie: { secure: true }
  })
);

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "./views");
app.use(express.static(__dirname + "/public"));
require("./passport")(app);
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(cors());

//Init routes
route(app);

var httpsServer = https.createServer(options, app);

httpsServer.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

// app.listen(port, () => {
//   console.log(`App listening at http://localhost:${port}`);
// });
