const { Op } = require("sequelize");
const sequelize = require("sequelize");
const db = require('../models')
const Artwork = db.Artwork
const Subject = db.Subject
const Medium = db.Medium
const Artist = db.Artist
const ArtistImage = db.ArtistImage
const ArtworkImage = db.ArtworkImage

const artworkController = {
  getArtworks: async (req, res) => {
    try {
      // get selections
      const selections_artist = await Artist.findAll({ attributes: ['id', 'name'], raw: true, order: ['name'] })
      const selections_medium = await Medium.findAll({ attributes: ['id', 'name'], raw: true, order: ['name'] })
      const selections_subject = await Subject.findAll({ attributes: ['id', 'name'], raw: true, order: ['name'] })
      const selections = {
        artists: selections_artist,
        media: selections_medium,
        subjects: selections_subject
      }

      if (!Object.keys(req.query).length) {   // if req.query is empty
        // return res.json(selections)
        return res.render('artworks', { selections })
      }

      // organize query
      let { mediumId, subjectId, artistId, medium, subject, artist, artworkName,
        height_lower, height_upper, width_lower, width_upper, depth_lower, depth_upper, shape_portrait, shape_landscape } = req.query

      function sizeQueryText(dimension, lower, upper) {
        if (!lower && !upper) {
          return undefined
        }
        return `${dimension} ${lower ? lower : ''} - ${upper ? upper : ''}`
      }
      let shape = ""
      if (shape_portrait && !shape_landscape) shape = '直式'
      if (!shape_portrait && shape_landscape) shape = '橫式'

      let searching = {
        medium, subject, artist, artworkName,
        height_lower, height_upper, width_lower, width_upper, depth_lower, depth_upper,
        // length: length ? `長=${length}cm` : undefined, 
        // height: `長： ${height_lower ? height_lower : ''} - ${height_upper ? height_upper : ''}}`,
        height: sizeQueryText('長', height_lower, height_upper),
        width: sizeQueryText('寬', width_lower, width_upper),
        depth: sizeQueryText('深', depth_lower, depth_upper),
        shape, shape_portrait, shape_landscape
      }
      console.log('searching:', searching)
      // {
      //   medium: undefined,
      //   subject: undefined,
      //   artist: undefined,
      //   artworkName: '養鴨', ...
      // }

      let whereQuery = {}
      if (mediumId) whereQuery['$Medium.id$'] = Number(mediumId)
      if (subjectId) whereQuery['$SubjectTags.id$'] = Number(subjectId)
      if (artistId) whereQuery['$Creators.id$'] = Number(artistId)
      if (medium) whereQuery['$Medium.name$'] = { [Op.like]: `%${medium}%` }
      if (subject) whereQuery['$SubjectTags.name$'] = { [Op.like]: `%${subject}%` }
      if (artist) whereQuery['$Creators.name$'] = { [Op.like]: `%${artist}%` }
      if (artworkName) whereQuery['name'] = { [Op.like]: `%${artworkName}` }
      if (height_lower && height_upper) {
        whereQuery['height'] = { [Op.between]: [height_lower, height_upper] }
      } else {
        if (height_upper) whereQuery['height'] = { [Op.lte]: height_upper }
        if (height_lower) whereQuery['height'] = { [Op.gte]: height_lower }
      }
      
      if (width_lower && width_upper) {
        whereQuery['width'] = { [Op.between]: [width_lower, width_upper] }
      } else {
        if (width_upper) whereQuery['width'] = { [Op.lte]: width_upper }
        if (width_lower) whereQuery['width'] = { [Op.gte]: width_lower }
      }

      if (depth_lower && depth_upper) {
        whereQuery['depth'] = { [Op.between]: [depth_lower, depth_upper] }
      } else {
        if (depth_upper) whereQuery['depth'] = { [Op.lte]: depth_upper }
        if (depth_lower) whereQuery['depth'] = { [Op.gte]: depth_lower }
      }

      if (shape === "直式") whereQuery['height'] = { [Op.gte]: sequelize.col('width')}
      if (shape === "橫式") whereQuery['height'] = { [Op.lte]: sequelize.col('width')}

      console.log(' whereQuery: ', whereQuery)

      const artwork_rawData = await Artwork.findAndCountAll({
        nest: true,
        attributes: { exclude: ['MediumId', 'viewCount', 'createdAt', 'updatedAt', 'piecesNum'] },
        where: whereQuery,
        include: [
          { model: Subject, as: 'SubjectTags', attributes: ['id', 'name'], through: { attributes: [] }, required: true },
          { model: Medium, attributes: ['id', 'name'], required: true },
          { model: ArtworkImage, attributes: ['url', 'type'] },
          {
            model: Artist, as: 'Creators', through: { attributes: [] },
            attributes: ['id', 'name'],
            required: true
          }
        ],
        distinct: true   // count distinct pk 
      })

      let artwork_result = JSON.parse(JSON.stringify(artwork_rawData))
      // console.log(artwork_result)


      // 整理藝術品資料: medium, size
      artwork_result.rows.forEach(work => {
        work.creationTime = work.creationTime ? new Date(work.creationTime).getFullYear() : ""
        work.medium = work.Medium.name
        work.image = work.ArtworkImages[0] ? work.ArtworkImages[0].url : 'https://i.imgur.com/nVNO3Kj.png'  // if no image in DB, use "no image"
        delete work.Medium
        delete work.ArtworkImages
        work.size = (work.depth) ? (work.height + "x" + work.width + "x" + work.depth + " cm") : (work.height + "x" + work.width + " cm")
      })

      // return res.json({ selections, searching, artwork_result})
      return res.render('artworks', { selections, searching, artwork_result })
    } catch (error) {
      console.log(error)
    }

    
  },
  getArtwork: async (req, res) => {
    try {
      const artwork_rawData = await Artwork.findByPk(req.params.artworkId, {
        attributes: { exclude: ['MediumId', 'viewCount', 'createdAt', 'updatedAt', 'piecesNum'] },
        include: [
          { model: Subject, as: 'SubjectTags', attributes: ['id', 'name'], through: { attributes: [] } },
          { model: Medium, attributes: ['id', 'name'] },
          { model: ArtworkImage, attributes: ['url', 'type', 'description'] },
          {
            model: Artist, as: 'Creators', through: { attributes: [] },
            attributes: { exclude: ['updatedAt', 'createdAt'] },
            include: { model: ArtistImage, attributes: { exclude: ['createdAt', 'updatedAt'] } }
          }
        ]
      })
      let artwork = artwork_rawData.toJSON()
      // console.log(artwork)

      // 整理藝術品資料：medium, subject, size, creationTime
      artwork.image = artwork.ArtworkImages[0] ? artwork.ArtworkImages[0].url : 'https://i.imgur.com/nVNO3Kj.png'  // if no image in DB, use "no image"
      artwork.size = (artwork.depth) ? (artwork.height + "x" + artwork.width + "x" + artwork.depth + " cm") : (artwork.height + "x" + artwork.width + " cm")
      artwork.creationTime = artwork.creationTime ? artwork.creationTime.getFullYear() : ""

      // 整理藝術家資料介紹
      artwork.Creators.map(creator => {
        if (creator.ArtistImages.length === 0) {
          creator.ArtistImages = 'https://i.imgur.com/QJrNwMz.jpg'  //預設空白大頭照
        } else {
          const headImg = creator.ArtistImages.find(image => image.type === 'head')
          if (headImg) {  // imgur url + b => big thumbnail 
            creator.ArtistImages = headImg.url.split('.jpg')[0] + 'b.jpg'
          } else {
            creator.ArtistImages = creator.ArtistImages[0].url.split('.jpg')[0] + 'b.jpg'
          }
        }
        creator.introduction = creator.introduction.slice(0, 50) + "..."
      })

      // return res.json(artwork)
      if (artwork.height > artwork.width) {
        return res.render('artwork_portrait', { artwork })
      }
      return res.render('artwork_landscape', { artwork })

    } catch (error) {
      console.log(error)
    }
  }
}


module.exports = artworkController