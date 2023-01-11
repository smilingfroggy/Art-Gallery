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
      Artwork.belongsToMany(models.Exhibition, {
        through: models.ExhibitionArtwork,
        foreignKey: 'ArtworkId',
        as: 'JoinedExhibitions'
      })
      Artwork.belongsToMany(models.Subject, {
        through: models.ArtworkSubject,
        key: 'ArtworkId',
        as: 'SubjectTags'
      })
      Artwork.belongsToMany(models.Artist, {
        through: models.ArtworkArtist,
        key: 'ArtworkId',
        as: 'Creators'
      })
      Artwork.belongsToMany(models.Collection, {
        through: models.CollectionArtwork,
        key: 'ArtworkId',
        as: 'JoinedCollections'
      })
    }
  }
  Artwork.init({
    name: DataTypes.STRING,
    artistName: DataTypes.STRING,
    serialNumber: DataTypes.STRING,
    creationTime: DataTypes.DATE,
    creationTimeNote: DataTypes.STRING,
    height: DataTypes.FLOAT,
    width: DataTypes.FLOAT,
    depth: DataTypes.FLOAT,
    piecesNum: DataTypes.INTEGER,
    introduction: DataTypes.TEXT,
    viewCount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Artwork',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_520_ci'
  });
  return Artwork;
};