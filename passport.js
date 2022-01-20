const passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
const siteM = require('./models/SiteModel');
const bcrypt = require('bcrypt');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

var jwtOptions = {};

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'mySecretKey';

const strategy = new JwtStrategy(jwtOptions,async (payload,done)=>{
    try {
        user = await siteM.get(payload.patient_id, 'patient', 'patient_id');            
        if (!user) {
            return done(null, false, { message: 'Incorrect patient id.' });
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
});
module.exports.applyPassport = passport =>{
    passport.use(strategy);
}
module.exports.localStrategy = app => {
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'pwd'
    },
        async (username, password, done) => {            
            let user;
            try {
                user = await siteM.get(username, 'account', 'username');                
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
            const u = await siteM.get(user.username, 'account', 'username');
            done(null, u);
        } catch (error) {
            done(new Error('error'), null);
        }
    });
    // app.use(passport.initialize());
    // app.use(passport.session());
};