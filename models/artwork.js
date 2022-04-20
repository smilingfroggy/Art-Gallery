'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Artwork extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Artwork.hasMany(models.ArtworkImage)
      Artwork.belongsTo(models.Medium)
    }
  }
  Artwork.init({
    name: DataTypes.STRING,
    creationTime: DataTypes.DATE,
    height: DataTypes.FLOAT,
    width: DataTypes.FLOAT,
    depth: DataTypes.FLOAT,
    introduction: DataTypes.TEXT,
    viewCount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Artwork',
  });
  return Artwork;
};