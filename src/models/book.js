const { Model, DataTypes } = require('sequelize')
const Sequelize = require('../database')

class Book extends Model { }

Book.init({
    title: DataTypes.STRING,
    ISBN: DataTypes.INTEGER,
    publicationDate: DataTypes.STRING,
    genre: DataTypes.STRING
}, { sequelize: Sequelize, modelName: 'book' })

module.exports = Book
