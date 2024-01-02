'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Collection)
      User.hasMany(models.Reservation)
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN,
    otp: DataTypes.STRING,
    expiredAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_520_ci'
  });
  return User;
};