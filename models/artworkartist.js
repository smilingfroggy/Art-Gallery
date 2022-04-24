'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ArtworkArtist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ArtworkArtist.init({
    ArtworkId: DataTypes.INTEGER,
    ArtistId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ArtworkArtist',
  });
  return ArtworkArtist;
};