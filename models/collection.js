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
  });
  return Collection;
};