'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExhibitionArtwork extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ExhibitionArtwork.init({
    ExhibitionId: DataTypes.INTEGER,
    ArtworkId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ExhibitionArtwork',
  });
  return ExhibitionArtwork;
};