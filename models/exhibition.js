'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Exhibition extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Exhibition.hasMany(models.ExhibitionImage)
    }
  }
  Exhibition.init({
    name: DataTypes.STRING,
    date_start: DataTypes.DATE,
    date_end: DataTypes.DATE,
    location: DataTypes.STRING,
    introduction: DataTypes.TEXT,
    privacy: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Exhibition',
  });
  return Exhibition;
};