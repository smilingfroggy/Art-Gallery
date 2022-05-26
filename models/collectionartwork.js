'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CollectionArtwork extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CollectionArtwork.init({
    CollectionId: DataTypes.INTEGER,
    ArtworkId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CollectionArtwork',
  });
  return CollectionArtwork;
};