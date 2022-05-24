const { imgurFileHandler } = require('../helpers/file-helpers')
const db = require('../models');
const Artwork = db.Artwork
const Exhibition = db.Exhibition
const ExhibitionImage = db.ExhibitionImage
const Medium = db.Medium
const Artist = db.Artist
const ArtistImage = db.ArtistImage
const ArtworkImage = db.ArtworkImage
const ExhibitionArtwork = db.ExhibitionArtwork
const Subject = db.Subject
const { Op } = require('sequelize')

const adminController = {
  getExhibitions: async (req, res, next) => {
    try {
      const exhibitions_rawData = await Exhibition.findAll({
        include: [
          { model: ExhibitionImage, attributes: ['url', 'type', 'description'] },
          { model: Artwork, as: 'ContainedArtworks', attributes: ['id'], through: { attributes: [] } },
        ],
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      })

      let exhibitionsData = exhibitions_rawData.map(exhibition => {
        let artwork_sum = exhibition.ContainedArtworks.length
        delete exhibition.dataValues.ContainedArtworks
        let image_sum = exhibition.dataValues.ExhibitionImages.length
        delete exhibition.dataValues.ExhibitionImages
        return {
          ...exhibition.dataValues,
          date_start: exhibition.dataValues.date_start.toISOString().slice(0, 10),
          date_end: exhibition.dataValues.date_end.toISOString().slice(0, 10),
          introduction: exhibition.dataValues.introduction.slice(0, 55) + "...",
          image_sum,
          artwork_sum
        }
      })
      // return res.json(exhibitionsData)
      return res.render('admin/exhibitions', { exhibitionsData })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  togglePrivacy: async (req, res, next) => {
    try {
      const { exhibitionId } = req.params
      const { privacy } = req.body
      if (!exhibitionId || !privacy) throw new Error('Please provide valid exhibition ID and privacy')
      await Exhibition.update({ privacy: (Number(privacy) ? 0 : 2) }, {
        where: { id: exhibitionId },
      })
      return res.redirect('back')
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getExhibition: async (req, res, next) => {
    try {
      const exhibition_rawData = await Exhibition.findByPk(req.params.exhibitionId, {
        include: [
          { model: ExhibitionImage, attributes: ['id', 'url', 'type', 'description'] },
          {
            model: Artwork, as: 'ContainedArtworks',
            attributes: { exclude: ['piecesNum', 'viewCount', 'createdAt', 'updatedAt', 'introduction'] },
            through: { attributes: [] },
            include: [
              { model: ArtworkImage, attributes: ['id', 'url', 'type'] },
              { model: Medium, attributes: ['name'] }
            ]
          },
        ],
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      })

      if (!exhibition_rawData) throw new Error('Exhibition unavailable')

      let result = exhibition_rawData.toJSON()
      result.artwork_sum = result.ContainedArtworks.length
      result.date_start = result.date_start.toISOString().slice(0, 10)
      result.date_end = result.date_end.toISOString().slice(0, 10)

      // console.log(result.ContainedArtworks) 
      let usePoster = result.ExhibitionImages.find(images => images.type === 'poster')?.url || 'https://i.imgur.com/nVNO3Kj.png'   // if no poster, use "no image"
      result.poster = usePoster

      // ContainedArtworks
      result.ContainedArtworks.forEach(work => {
        work.creationTime = work.creationTime ? work.creationTime.toISOString().slice(0, 4) : null
        if (!work.ArtworkImages.length) work.ArtworkImages.push({ url: 'https://i.imgur.com/nVNO3Kj.png' })
      })

      // return res.json(result)
      return res.render('admin/exhibition', { exhibition: result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  putExhibitionImages: async (req, res, next) => {
    try {
      const { exhibitionId } = req.params
      const { files } = req
      const { type, description } = req.body
      if (!files.length) throw new Error('Please provide image files')
      if (!exhibitionId) throw new Error('Please provide valid exhibition ID')

      Promise.all([
        Exhibition.findByPk(exhibitionId),
        ...Array.from(files, file => imgurFileHandler(file))
      ])
        .then(async ([exhibition, ...filesPath]) => {
          if (!exhibition) throw new Error('Exhibition does not exist!')

          for (let i = 0; i < filesPath.length; i++) {
            await ExhibitionImage.create({
              ExhibitionId: exhibitionId,
              url: filesPath[i],
              type,
              description
            })
          }
          res.redirect('back')
        })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  editExhibition: async (req, res, next) => {
    try {
      const { exhibitionId } = req.params
      if (!exhibitionId) return res.render('admin/edit_exhibition')

      const exhibition = await Exhibition.findByPk(exhibitionId, {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        raw: true
      })
      if (!exhibition) throw new Error('Exhibition does not exist!')
      exhibition.date_start = exhibition.date_start.toISOString().slice(0, 10)
      exhibition.date_end = exhibition.date_end.toISOString().slice(0, 10)

      // return res.json(exhibitionData)
      return res.render('admin/edit_exhibition', { exhibition })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  postExhibition: async (req, res, next) => {
    try {
      const { name, date_start, date_end, location, introduction } = req.body
      if (!name || !date_start || !date_end || !location) throw new Error('請輸入完整資訊')

      const newExhData = await Exhibition.create({
        name, date_start, date_end, location, introduction,
        privacy: 0  // default-private
      })
      const newExh = newExhData.toJSON()

      return res.redirect(`/admin/exhibitions/${newExh.id}`)
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  putExhibition: async (req, res, next) => {
    try {
      const { exhibitionId } = req.params
      const { name, date_start, date_end, location, introduction } = req.body
      if (!exhibitionId || !name || !date_start || !date_end || !location) throw new Error('請輸入完整資訊')

      const exhibitionData = await Exhibition.findByPk(exhibitionId)
      if (!exhibitionData) throw new Error('Exhibition does not exist')
      await exhibitionData.update({
        name, date_start, date_end, location, introduction
      })
      return res.redirect(`/admin/exhibitions/${exhibitionId}`)
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  deleteExhibition: async (req, res, next) => {
    try {
      const { exhibitionId } = req.params
      if (!exhibitionId) throw new Error('Please provide valid exhibition ID')
      Promise.all([
        ExhibitionImage.destroy({ where: { ExhibitionId: exhibitionId }}),
        ExhibitionArtwork.destroy({ where: { ExhibitionId: exhibitionId }})
      ])
        .then(([images, artworks]) => {  // deleted numbers
          Exhibition.destroy({ where: { id: exhibitionId } })
            .then(() => {
              return res.redirect('back')
            })
        })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  deleteExhibitionImages: async (req, res, next) => {
    try {
      const { imageId } = req.body
      const image = await ExhibitionImage.findByPk(imageId)
      if (!image) throw new Error('Exhibition image does not exist!')
      await image.destroy()
      return res.redirect('back')
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getExhibitionArtworks: async (req, res) => {
    try {
      const { exhibitionId } = req.params
      if (!exhibitionId) throw new Error('Please provide valid exhibition ID')
      const exhibitionArtworks_rawData = await Exhibition.findByPk(exhibitionId, {
        attributes: ['id', 'name'],
        include: {
          model: Artwork, as: 'ContainedArtworks',
          attributes: { exclude: ['piecesNum', 'viewCount', 'createdAt', 'updatedAt', 'introduction'] },
          through: { attributes: [] },
          include: [
            { model: Medium, attributes: ['name'] },
            { model: ArtworkImage, attributes: ['id', 'url'] },
          ]
        },
      })

      if (!exhibitionArtworks_rawData) throw new Error('Exhibition artwork unavailable!')

      let result = exhibitionArtworks_rawData.toJSON()
      result.ContainedArtworks.forEach(work => {
        work.creationTime = work.creationTime ? work.creationTime.toISOString().slice(0, 4) : null
        if (!work.ArtworkImages.length) work.ArtworkImages.push({ url: 'https://i.imgur.com/nVNO3Kj.png' })  // if no image in DB, use "no image"
      })
      result.artwork_sum = result.ContainedArtworks.length

      // return res.json(result)
      return res.render('admin/exhibition_artworks', { exhibition: result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  selectExhibitionArtworks: async (req, res, next) => {
    try {
      const { exhibitionId } = req.params
      const exhibition = await Exhibition.findByPk(exhibitionId, {
        raw: true, attributes: ['id', 'name']
      })
      if (!exhibition) throw new Error('Exhibition does not exist')

      // find out selected artwork to be excluded
      const selected_artwork_rawData = await Artwork.findAll({
        raw: true, nest: true, attributes: ['id'],
        include: {
          model: Exhibition, as: 'JoinedExhibitions', attributes: [],
          through: { attributes: [] }, where: { id: exhibitionId }
        }
      })
      const selected_artworkId = selected_artwork_rawData.map(value => value.id)

      const artwork_rawData = await Artwork.findAll({
        attributes: { exclude: ['piecesNum', 'introduction', 'viewCount', 'createdAt', 'updatedAt'] },
        where: { id: { [Op.notIn]: selected_artworkId }},  // exclude originally selected artworks
        include: [
          { model: Medium, attributes: { exclude: ['createdAt', 'updatedAt'] } },
          { model: Subject, as: 'SubjectTags', attributes: ['id', 'name'], through: { attributes: [] } },
          {
            model: Exhibition, as: 'JoinedExhibitions', attributes: ['id', 'name'], through: { attributes: [] },
          }
        ]
      })
      if (!artwork_rawData) throw new Error('No other artwork has not been selected')
      const artworkData = JSON.parse(JSON.stringify(artwork_rawData))

      artworkData.forEach(work => {
        work.creationTime = work.creationTime ? new Date(work.creationTime).getFullYear() : ""
      })

      // return res.json({ exhibition , artworks: artworkData })
      return res.render('admin/select_artworks', { exhibition , artworks: artworkData })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  putExhibitionArtworks: async (req, res, next) => {
    try {
      const { exhibitionId } = req.params
      const artworks = Object.keys(req.body)  //eg. ['49','53','94','100']
      if (!artworks.length) throw new Error('Please select one work at least')
      if (!exhibitionId) throw new Error('Please provide valid exhibition ID')
      const addedWorks = await ExhibitionArtwork.bulkCreate(Array.from(artworks, id => {
        return { 
          ExhibitionId: exhibitionId,
          ArtworkId: id
        }
      }, { validate: true }))

      return res.redirect(`/admin/exhibitions/${exhibitionId}/artworks`)
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  deleteExhibitionArtworks: async (req, res, next) => {
    try {
      const { exhibitionId } = req.params
      const { artworkId } = req.body
      if (!exhibitionId || !artworkId) throw new Error('Please provide valid exhibition ID')
      await ExhibitionArtwork.destroy({
        where: {
          ExhibitionId: exhibitionId,
          ArtworkId: artworkId
        }
      })
      
      return res.redirect(`/admin/exhibitions/${exhibitionId}/artworks`)
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
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
  editArtworks: async (req, res, next) => {
    try {
      const { artworkId } = req.params
      Promise.all([
        Medium.findAll({ raw: true, attributes: ['id', 'name'] }),
        Artist.findAll({ raw: true, attributes: ['id', 'name'] }),
        Subject.findAll({ raw: true, attributes: ['id', 'name']})
      ])
        .then(async ([medium_selections, artist_selections, subject_selections]) => {
          if (!artworkId) return res.render('admin/edit_artwork', { medium_selections, artist_selections, subject_selections })
          
          const artwork_rawData = await Artwork.findByPk(artworkId, {
            include: [
              { model: Medium, attributes: ['name'] },
              { model: Artist, as: 'Creators', attributes: ['name'], through: { attributes: [] } },
              { model: ArtworkImage, attributes: { exclude: ['createdAt', 'updatedAt'] } },
              { model: Subject, as: 'SubjectTags', attributes: ['name'], through: { attributes: [] }}
            ]
          })

          const artwork = JSON.parse(JSON.stringify(artwork_rawData))

          artwork.creationTime = artwork.creationTime ? new Date(artwork.creationTime).getFullYear() : ""
          if (!artwork.ArtworkImages.length) artwork.ArtworkImages.push({ url: 'https://i.imgur.com/nVNO3Kj.png' })  // if no image in DB, use "no image"
          artwork.SubjectTags_text = artwork.SubjectTags.map(tag => tag.name).join(', ')

          // res.json({ medium_selections, artist_selections, subject_selections, artwork })
          return res.render('admin/edit_artwork', { medium_selections, artist_selections, subject_selections, artwork })

        })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
}

module.exports = adminController