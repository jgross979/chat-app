// Creating our User model
//Set it as export because we will need it required on the server
const User = require("./user");

module.exports = function(sequelize, DataTypes) {
    const Message = sequelize.define("Message", {
        Message_ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        Message_Content: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        User_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: 'User',
            referencesKey: 'User_ID'
        },
        Message_Date: {
            type: DataTypes.DATETIME,
            allowNull: false
        },
        Message_Image: {
            type: DataTypes.BLOB,
            allowNull: true
        }
    });

    User.hasMany(Message); //Set one to many relationship

    return message;
}