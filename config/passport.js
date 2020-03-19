//we import passport packages required for authentication
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

//We will need the models folder to check passport agains
const db = require("../models");

// Telling passport we want to use a Local Strategy. In other words,
//we want login with a username/email and password
// passport.use(new LocalStrategy(
//     // Our user will sign in user their username
//     {
//         usernameField: "Username"
//     },
//     function(username, password, done) {
//         // When a user tries to sign in this code runs
//         db.User.findOne({
//             where: {
//                 Username: username
//             }
//         }).then(function(dbUser) {
//             // If there's no user with the given username
//             if (!dbUser) {
//                 return done(null, false, {
//                     message: "Incorrect username."
//                 });
//             }
//             // If there is a user with the given username, but the password the user gives us is incorrect
//             else if (!dbUser.validPassword(password)) {
//                 return done(null, false, {
//                     message: "Incorrect password."
//                 });
//             }
//             // If none of the above, return the user
//             return done(null, dbUser);
//         });
//     }
// ));
//

// passport.use(new LocalStrategy(
//     {
//         usernameField: 'username',
//         passwordField: 'password',
//         passReqToCallback: true // allows us to pass back the entire request to the callback
//
//     },
//     function(req, username, password, done) {
//         const isValidPassword = function(userpass, password){
//             return bcrypt.compareSync(password, userpass);
//         }
//
//         db.User.findOne({
//             where: {
//                 Username: username
//             }
//         }).then( function (user) {
//
//             if (!user) {
//                 return done(null, false, {
//                     message: 'Username does not exist'
//                 })
//             }
//
//
//             if (!isValidPassword(user.password, password)) {
//                 return done(null, false,{
//                     message: 'Incorrect Password.'
//                 });
//             }
//
//             const userinfo = user.get();
//             return done(null, userinfo);
//         }).catch(function(err){
//             console.log("Error:", err);
//
//             return done(null, false, {
//                 message: 'Something went wrong with your sign in'
//             });
//         });
//     }));


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






// In order to help keep authentication state across HTTP requests,
// Sequelize needs to serialize and deserialize the user
// This is boilerplate necessary to make it work
// passport.serializeUser(function(user, cb) {
//     cb(null, user);
// });
// //
// passport.deserializeUser(function(obj, cb) {
//     cb(null, obj);
// });

//
// Exporting our configured passport
module.exports = passport;