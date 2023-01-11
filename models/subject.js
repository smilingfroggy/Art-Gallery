'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subject extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Subject.belongsToMany(models.Artwork, {
        through: models.ArtworkSubject,
        key: 'SubjectId',
        as: 'ContainedArtworks'
      })
    }
  }
  Subject.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Subject',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_520_ci'
  });
  return Subject;
};