const { imgurFileHandler } = require('../helpers/file-helpers')
const db = require('../models');
const { Artwork, Exhibition, ExhibitionImage, Medium, Artist, ArtworkImage, ArtworkArtist, ArtworkSubject, Subject } = db
const { Op } = require('sequelize')
const IMAGE_NOT_AVAILABLE = 'https://i.imgur.com/nVNO3Kj.png'

const adminArtworkController = {
  getArtworks: async (req, res, next) => {
    try {
      const artwork_rawData = await Artwork.findAll({
        attributes: { exclude: ['piecesNum', 'introduction', 'viewCount', 'createdAt', 'updatedAt'] },
        include: [
          { model: Medium, attributes: { exclude: ['createdAt', 'updatedAt'] } },
          { model: Subject, as: 'SubjectTags', attributes: ['id', 'name'], through: { attributes: [] } },
          {
            model: Exhibition, as: 'JoinedExhibitions', attributes: ['id', 'name'], through: { attributes: [] },
          }
        ]
      })
      if (!artwork_rawData) throw new Error('No artwork created')
      const artworks = JSON.parse(JSON.stringify(artwork_rawData))

      artworks.forEach(work => {
        work.creationTime = work.creationTime ? new Date(work.creationTime).getFullYear() : ""
      })

      // res.json(artworks)
      res.render('admin/select_artworks', { artworks })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getArtwork: async (req, res, next) => {
    try {
      const { artworkId } = req.params
      const artwork_rawData = await Artwork.findByPk(artworkId, {
        include: [
          { model: Medium, attributes: ['name'] },
          { model: Artist, as: 'Creators', attributes: ['name'], through: { attributes: [] } },
          { model: ArtworkImage, attributes: { exclude: ['createdAt', 'updatedAt'] } },
          { model: Subject, as: 'SubjectTags', attributes: ['name'], through: { attributes: [] } }
        ]
      })
      if (!artwork_rawData) throw new Error('Please provide valid artwork Id')
      const artwork = JSON.parse(JSON.stringify(artwork_rawData))

      artwork.SubjectTags_text = artwork.SubjectTags.map(tag => tag.name).join(', ')

      // return res.json(artwork_rawData)
      return res.render('admin/artwork', { artwork: artwork })
    } catch (error) {
      next(error)
    }
  },
  editArtworks: async (req, res, next) => {
    try {
      const { artworkId } = req.params
      Promise.all([
        Medium.findAll({ raw: true, attributes: ['id', 'name'] }),
        Artist.findAll({ raw: true, attributes: ['id', 'name'] }),
        Subject.findAll({ raw: true, attributes: ['id', 'name'] })
      ])
        .then(async ([medium_selections, artist_selections, subject_selections]) => {
          if (!artworkId) return res.render('admin/edit_artwork', { medium_selections, artist_selections, subject_selections })

          const artwork_rawData = await Artwork.findByPk(artworkId, {
            include: [
              { model: Medium, attributes: ['name'] },
              { model: Artist, as: 'Creators', attributes: ['name'], through: { attributes: [] } },
              { model: ArtworkImage, attributes: { exclude: ['createdAt', 'updatedAt'] } },
              { model: Subject, as: 'SubjectTags', attributes: ['name'], through: { attributes: [] } }
            ]
          })
          if (!artwork_rawData) throw new Error('Please provide valid artwork Id')
          const artwork = JSON.parse(JSON.stringify(artwork_rawData))

          artwork.creationTime = artwork.creationTime ? new Date(artwork.creationTime).getFullYear() : ""
          artwork.SubjectTags_text = artwork.SubjectTags.map(tag => tag.name).join(', ')

          // res.json({ medium_selections, artist_selections, subject_selections, artwork })
          return res.render('admin/edit_artwork', { medium_selections, artist_selections, subject_selections, artwork })
        })
        .catch(error => next(error))
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  postArtworks: async (req, res, next) => {
    try {
      let { name, artist_select, serialNumber, creationTime, creationTimeNote, MediumId, height, width, depth, piecesNum, introduction, type, description, SubjectTags_select } = req.body
      const { files } = req
      if (!name || !artist_select || !MediumId || !height || !piecesNum) throw new Error('Please provide complete messages')

      Promise.all([
        Medium.findByPk(MediumId, {
          raw: true, attributes: ['id', 'name'],
        }),
        Artist.findAll({
          raw: true, attributes: ['name'],
          where: { id: artist_select }, order: [['id']]
        })
      ]).then(([mediumData, artist_array]) => {
        if (!mediumData) throw new Error('Cannot find this medium')
        if (!artist_array.length) throw new Error('Cannot find artists')
        let artistName = artist_array.map(arr => arr.name).join(', ')
        creationTime = creationTime ? new Date(creationTime, 0) : null

        return Artwork.create({
          name, artistName: artistName, serialNumber, creationTime, creationTimeNote, MediumId, height, width, depth: depth || 0, piecesNum, introduction
        })
      }).then((newWork) => {
        // create artworkArtist, artworkTags
        // 若數量只有一個也轉換成陣列
        artist_select = typeof artist_select === 'string' ? [artist_select] : artist_select
        switch (typeof SubjectTags_select) {
          case 'undefined':
            SubjectTags_select = []
            break
          case 'string':
            SubjectTags_select = [SubjectTags_select]
            break
        }

        const filesUpload = files ? Promise.all(files.map(file => imgurFileHandler(file))) : Promise.resolve()

        Promise.all([
          filesUpload,
          ...artist_select.map(id => ArtworkArtist.create({
            ArtworkId: newWork.id,
            ArtistId: id
          })),
          ...SubjectTags_select.map(id => ArtworkSubject.create({
            ArtworkId: newWork.id,
            SubjectId: id
          }))
        ]).then(([filesPath, ...results]) => {
          const createData = filesPath.map(path => {
            return {
              ArtworkId: newWork.id,
              url: path,
              type,
              description
            }
          })
          return ArtworkImage.bulkCreate(createData)
        }).then(() => {
          return res.redirect('/admin/artworks')
        }).catch(error => next(error))
      }).catch(error => console.log(error))
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  putArtworks: async (req, res, next) => {
    try {
      const { artworkId } = req.params
      let { name, artist_select, serialNumber, creationTime, creationTimeNote, MediumId, height, width, depth, piecesNum, introduction, type, description, SubjectTags_select } = req.body
      const { files } = req
      if (!artworkId || !name || !artist_select || !MediumId || !height || !piecesNum) throw new Error('Please provide complete messages')

      Promise.all([
        Medium.findByPk(MediumId, {
          raw: true, attributes: ['id', 'name'],
        }),
        Artist.findAll({
          raw: true, attributes: ['name'],
          where: { id: artist_select }, order: [['id']]
        }),
        Artwork.findByPk(artworkId)
      ]).then(([mediumData, artist_array, artwork]) => {
        if (!mediumData) throw new Error('Cannot find this medium')
        if (!artist_array.length) throw new Error('Cannot find artists')
        if (!artwork) throw new Error('Cannot find this artwork')
        let artistName = artist_array.map(arr => arr.name).join(', ')
        creationTime = creationTime ? new Date(creationTime, 0) : null

        Promise.all([
          artwork.update({
            name, artistName: artistName, serialNumber, creationTime, creationTimeNote, MediumId, height, width, depth: depth || 0, piecesNum, introduction
          }),
          ArtworkArtist.findAll({
            where: { ArtworkId: artwork.id },
            attributes: ['id', 'ArtworkId', 'ArtistId']
          }),
          ArtworkSubject.findAll({
            where: { ArtworkId: artwork.id },
          })
        ]).then(([artwork, artworkArtist, artworkSubject]) => {
          // add or remove artworkArtist, artworkSubject
          const artistId_array = artworkArtist.map(data => data.ArtistId)
          const subjectId_array = artworkSubject.map(data => data.SubjectId)
          // 若數量只有一個也轉換成陣列
          artist_select = typeof artist_select === 'string' ? [artist_select] : artist_select
          switch (typeof SubjectTags_select) {
            case 'undefined':
              SubjectTags_select = []
              break
            case 'string':
              SubjectTags_select = [SubjectTags_select]
              break
          }

          // 多的要建立、少的要刪除
          const toAddArtists = artist_select.filter(id => !artistId_array.includes(Number(id)))
          const toRemoveArtists = artistId_array.filter(id => !artist_select.includes(String(id)))
          console.log('toAddArtists', toAddArtists, 'toRemoveArtists', toRemoveArtists)

          const toAddTags = SubjectTags_select.filter(id => !subjectId_array.includes(Number(id)))
          const toRemoveTags = subjectId_array.filter(id => !SubjectTags_select.includes(String(id)))
          console.log('toAddTags:', toAddTags, 'toRemoveTags: ', toRemoveTags)

          const filesUpload = files ? Promise.all(files.map(file => imgurFileHandler(file))) : Promise.resolve()

          Promise.all([
            filesUpload,
            ...toAddArtists.map(id => ArtworkArtist.create({
              ArtworkId: artwork.id,
              ArtistId: id
            })),
            ...toRemoveArtists.map(id => ArtworkArtist.destroy({
              where: {
                ArtworkId: artwork.id,
                ArtistId: id,
              }
            })),
            ...toAddTags.map(id => ArtworkSubject.create({
              ArtworkId: artwork.id,
              SubjectId: id
            })),
            ...toRemoveTags.map(id => ArtworkSubject.destroy({
              where: {
                SubjectId: id,
                ArtworkId: artwork.id
              }
            }))
          ]).then(([filesPath, ...results]) => {
            const createData = filesPath.map(path => {
              return {
                ArtworkId: artwork.id,
                url: path,
                type,
                description
              }
            })
            return ArtworkImage.bulkCreate(createData)
          }).then(() => {
            return res.redirect('/admin/artworks')
          }).catch(error => next(error))
        }).catch(error => next(error))
      }).catch(error => next(error))
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  deleteArtwork: async (req, res, next) => {
    try {
      const { artworkId } = req.params
      const artwork_data = await Artwork.findByPk(artworkId)
      if (!artwork_data) throw new Error('Please provide valid artworkId')

      Promise.all([
        ArtworkImage.destroy({ where: { ArtworkId: artworkId } }),
        ArtworkSubject.destroy({ where: { ArtworkId: artworkId } }),
        ArtworkArtist.destroy({ where: { ArtworkId: artworkId } }),
      ]).then((results) => {
        req.flash('success_messages', `Deleted 1 work and ${results[0]} image`)
        return artwork_data.destroy()
      }).then(() => {
        return res.redirect('back')
      }).catch(error => next(error))
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  deleteArtworkImages: async (req, res, next) => {
    try {
      const { imageId } = req.body
      const { artworkId } = req.params
      const artworkImages = await ArtworkImage.findOne({
        where: { ArtworkId: artworkId, id: imageId }
      })
      if (!artworkImages) throw new Error('Please provide valid imageId')
      await artworkImages.destroy()
      return res.redirect('back')
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

module.exports = adminArtworkController