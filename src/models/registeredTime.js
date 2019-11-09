const { Model, DataTypes } = require('sequelize')
const Sequelize = require('../database')
const User = require('./user')

class RegisteredTime extends Model {
    static associate() {
        User.hasOne(RegisteredTime)
        RegisteredTime.belongsTo(User)
    }
}

RegisteredTime.init({
    timeRegistered: DataTypes.STRING,
    type: DataTypes.STRING
}, { sequelize: Sequelize, modelName: 'registered_time' })

RegisteredTime.associate()

module.exports = RegisteredTime
