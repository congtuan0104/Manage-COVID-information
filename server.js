const express = require('express');
const app = express();
const path = require('path');
const route = require('./routes/index');
const port = 3000;
const handlebars = require('express-handlebars');
const session = require('express-session');


const hbs = handlebars.create({
    defaultLayout: 'mainLayout',
    extname: 'hbs',
    helpers: {
        ifStr(s1, s2, option) {
            if (s1 === s2) {
                return options.fn(this)
            }
            return options.inverse(this)
        },

        eq(s1,s2,option){
            if(s1==s2){
                return option.fn(this)
            }
            return option.inverse(this)
        },

        if_even(conditional, options){
            if(conditional%2==0){
                return options.fn(this);
            }
            else{
                return options.inverse(this);
            }
        },
    }
})



app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    //cookie: { secure: true }
}))

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({
    extended: true,
}));
app.use(express.json());


//Init routes
route(app);

app.listen(port, () => {

    console.log(`App listening at http://localhost:${port}`)
})