const passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
const accountM = require('./models/AccountModel');
const bcrypt = require('bcrypt');

module.exports = app => {
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'pwd'
    },
        async (username, password, done) => {            
            let user;
            try {
                user = await accountM.get(username, 'account', 'username');                
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                const challengeResult = await bcrypt.compare(password, user.password);
                if (!challengeResult) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(async (user, done) => {
        try {
            const u = await accountM.get(user.username, 'account', 'username');
            done(null, u);
        } catch (error) {
            done(new Error('error'), null);
        }
    });
    app.use(passport.initialize());
    app.use(passport.session());
};