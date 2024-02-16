'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reservation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Reservation.belongsTo(models.User)
      Reservation.belongsTo(models.Collection)
    }
  }
  Reservation.init({
    UserId: DataTypes.INTEGER,
    CollectionId: DataTypes.INTEGER,
    contact_person: DataTypes.STRING,
    phone: DataTypes.STRING,
    visitor_num: DataTypes.INTEGER,
    time: DataTypes.DATE,
    purpose: DataTypes.STRING,
    description: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
    sn: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Reservation',
    paranoid: true
  });
  return Reservation;
};