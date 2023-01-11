'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Medium extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Medium.hasMany(models.Artwork)
    }
  }
  Medium.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Medium',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_520_ci'
  });
  return Medium;
};