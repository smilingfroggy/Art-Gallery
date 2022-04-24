'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExhibitionImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ExhibitionImage.belongsTo(models.Exhibition)
    }
  }
  ExhibitionImage.init({
    ExhibitionId: DataTypes.INTEGER,
    url: DataTypes.STRING,
    type: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ExhibitionImage',
  });
  return ExhibitionImage;
};