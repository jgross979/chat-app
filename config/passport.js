//we import passport packages required for authentication
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

//We will need the models folder to check passport agains
const db = require("../models");


passport.use(new LocalStrategy(
    function(username, password, done) {
        db.User.findOne({
            where: {
                'Username': username
            }
        }).then(function (User) {
            if (User == null) {
                console.log(User + " USER DOESN'T EXIST");
                return done(null, false, { message: 'user does not exist.' })
            }

            if (bcrypt.compareSync(password, User.Password)) {
                console.log(User.Password + " CORRECT PASS");
                return done(null, User)
            }
            console.log(User.Username + " WRONG COMBINATION");
            return done(null, false, { message: 'Wrong username password combination.' })
        })
    }
))



passport.serializeUser(function(user, done) {
    done(null, user.User_ID);
})

passport.deserializeUser(function(id, done) {
    db.User.findOne({
        where: {
            'User_ID': id
        }
    }).then(function (user) {
        if (user == null) {
            done(new Error('Wrong user id.'))
        }

        done(null, user)
    })
})

// Exporting our configured passport
module.exports = passport;