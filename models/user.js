// Requiring bcrypt for password hashing. Using the bcryptjs version as
//the regular bcrypt module sometimes causes errors on Windows machines
const bcrypt = require("bcryptjs");

// Creating our User model
//Set it as export because we will need it required on the server
module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
        User_ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        Username: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        Password: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        DOB: {
            type: DataTypes.DATETIME,
            allowNull: true
        },
        Profile_Picture: {
            type: DataTypes.BLOB,
            allowNull: true

        },
        Email: {
            type: DataTypes.STRING(100),
            unique: true,
            validate: {
                isEmail: true
            }
        },
        First_Name: {
            type: DataTypes.STRING(45),
            allowNull: true

        },
        Last_Name: {
            type: DataTypes.STRING(45),
            allowNull: true
        }
    });


    //This will check if an unhashed password entered by the
    //user can be compared to the hashed password stored in database
    User.prototype.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password);
    };

    // Hooks are automatic methods that run during various phases of the User Model lifecycle
    // In this case, before a User is created, we will automatically hash their password
    User.hook("beforeCreate", function(user) {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    });
    return User;
};

//Potential fix for ES6 if necessary
// User.beforeCreate(user => {
//  user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
// });