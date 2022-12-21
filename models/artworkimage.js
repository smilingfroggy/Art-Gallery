'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ArtworkImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ArtworkImage.belongsTo(models.Artwork)
    }
  }
  ArtworkImage.init({
    ArtworkId: DataTypes.INTEGER,
    url: DataTypes.STRING,
    url_origin: DataTypes.STRING,
    type: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ArtworkImage',
  });
  return ArtworkImage;
};