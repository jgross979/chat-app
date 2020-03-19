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
            autoIncrement: true,
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
            type: DataTypes.DATE,
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

    //Before creating the user, the password is encrypted.
    User.beforeCreate(user => {
        user.Password = bcrypt.hashSync(user.Password, bcrypt.genSaltSync(12), null);
    });
    return User;
};
