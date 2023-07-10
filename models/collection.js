'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Collection extends Model {
    static associate(models) {
      Collection.belongsTo(models.User)
      Collection.belongsToMany(models.Artwork, {
        through: models.CollectionArtwork,
        foreignKey: 'CollectionId',
        as: 'JoinedArtworks'
      })
      Collection.hasMany(models.Reservation)
    }
  }
  Collection.init({
    UserId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    privacy: DataTypes.INTEGER,
    url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Collection',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_520_ci'
  });
  return Collection;
};