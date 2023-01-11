'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Artist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Artist.hasMany(models.ArtistImage)
      Artist.belongsToMany(models.Artwork, {
        through: models.ArtworkArtist,
        key: 'ArtistId',
        as: 'Creations'
      })
    }
  }
  Artist.init({
    name: DataTypes.STRING,
    otherName: DataTypes.STRING,
    birthYear: DataTypes.STRING,
    deathYear: DataTypes.STRING,
    introduction: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Artist',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_520_ci'
  });
  return Artist;
};