const { imgurFileHandler } = require('../helpers/file-helpers')
const db = require('../models');
const { Artwork, Artist, ArtistImage } = db
const sequelize = require('sequelize')

const adminArtistController = {
  getArtists: async (req, res, next) => {
    try {
      const artists_rawData = await Artist.findAll({
        attributes: {
          include: [[sequelize.literal(`(
            SELECT COUNT (*) FROM artworkArtists AS aa WHERE aa.ArtistId = artist.id
          )`), 'workCount'],
          [sequelize.literal(`(
            SELECT COUNT (*) FROM artistImages AS ai WHERE ai.ArtistId = artist.id
          )`), 'imageCount']],
          exclude: ['createdAt', 'updatedAt']
        }
      })
      const artists = JSON.parse(JSON.stringify(artists_rawData))
      artists.forEach(artist => {
        artist.introduction = artist.introduction.slice(0, 50) + '...'
      })
      return res.render('admin/artists', { artists })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getArtist: async (req, res, next) => {
    try {
      const { artistId } = req.params
      if (artistId === 'create') return res.render('admin/edit_artist')   // provide empty form to create
      const artist_rawData = await Artist.findByPk(artistId, {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [
          { model: ArtistImage, attributes: { exclude: ['createdAt', 'updatedAt'] } },
          // { model: Artwork, as: 'Creations', through: { attributes: [] }, attributes: { exclude: ['createdAt', 'updatedAt'] }}
        ]
      })
      if (!artist_rawData) throw new Error('Artist ID does not exist!')
      const artist = JSON.parse(JSON.stringify(artist_rawData))
      return res.render('admin/edit_artist', { artist })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  putArtist: async (req, res, next) => {
    try {
      const { artistId } = req.params
      const { files } = req
      const { name, otherName, birthYear, deathYear, introduction, type, description } = req.body
      if (!name) throw new Error('Please provide artist name.')
      const artist_rawData = await Artist.findByPk(artistId)
      if (!artist_rawData) throw new Error('Invalid artist id')
      await artist_rawData.update({
        name, otherName, birthYear, deathYear, introduction
      })
      if (files.length) {
        Promise.all(files.map(file => imgurFileHandler(file)))
          .then(async filesPath => {
            await ArtistImage.bulkCreate(filesPath.map(path => {
              return {
                ArtistId: artistId,
                url: path,
                type,
                description
              }
            }))
          })
          .then(() => {
            req.flash('success_messages', `Updated ${name} profile`)
            return res.redirect(`/admin/artists/${artistId}`)
          })
          .catch(error => next(error))
      } else {
        req.flash('success_messages', `Updated ${name} profile`)
        return res.redirect(`/admin/artists/${artistId}`)
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  postArtist: async (req, res, next) => {
    try {
      const { name, otherName, birthYear, deathYear, introduction, type, description } = req.body
      const { files } = req   // [], [ {fieldName, path, ...}, {...}]
      if (!name) throw new Error('Please provide artist name.')
      const artist_repeat = await Artist.findOne({
        where: { name }
      })
      if (artist_repeat) throw new Error('Artist with same name exists')

      const filesUpload = files.length ? Promise.all(files.map(file => imgurFileHandler(file))) : Promise.resolve()

      Promise.all([
        filesUpload,
        Artist.create({
          name, otherName, birthYear, deathYear, introduction
        })
      ]).then(async ([filesPath, newArtist]) => {
        const bulkCreateImg = await ArtistImage.bulkCreate(filesPath.map(path => {
          return {
            ArtistId: newArtist.id,
            url: path,
            type,
            description,
          }
        }))
        console.log('created: ', bulkCreateImg.length)
        return newArtist
      }).then((newArtist) => {
        req.flash('success_messages', `Created ${name} profile`)
        return res.redirect(`/admin/artists/${newArtist.id}`)
      }).catch(error => console.log(error))
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  deleteArtist: async (req, res, next) => {
    try {
      const { artistId } = req.params
      const artist_rawData = await Artist.findByPk(artistId, {
        include: { model: Artwork, as: 'Creations', through: { attributes: [] } }
      })
      if (!artist_rawData) throw new Error('Please provide valid artist Id')
      if (artist_rawData.Creations.length) throw new Error('Unable to delete this artist, due to remaining works.')
      const images_deleted = await ArtistImage.destroy({
        where: { ArtistId: artistId }
      })
      await artist_rawData.destroy()
      req.flash('success_messages', `Successfully deleted 1 artist profile and ${images_deleted} images.`)
      return res.redirect('back')
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  deleteArtistImages: async (req, res, next) => {
    try {
      const { imageId } = req.body
      const { artistId } = req.params
      const images_deleted = await ArtistImage.destroy({
        where: { id: imageId, ArtistId: artistId }
      })
      req.flash('success_messages', `Successfully deleted ${images_deleted} image.`)
      return res.redirect('back')
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

module.exports = adminArtistController