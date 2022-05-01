const db = require('../models')
const Artwork = db.Artwork
const Subject = db.Subject
const Medium = db.Medium
const Artist = db.Artist
const ArtistImage = db.ArtistImage
const ArtworkImage = db.ArtworkImage

const artworkController = {
  getArtworks: async (req, res) => {
  },
  getArtwork: async (req, res) => {
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
    return res.render('artwork_landscape', { artwork })
  }
}


module.exports = artworkController