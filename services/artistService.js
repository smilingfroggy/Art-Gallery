const db = require('../models')
const { Artwork, Subject, Medium, Artist, ArtistImage, ArtworkImage, Exhibition, ExhibitionImage } = db
const { IMAGE_NOT_AVAILABLE, getHeadImage } = require('../helpers/image-helpers')

const artistController = {
  getArtist: async (req, res) => {
    const artist_rawData = await Artist.findByPk(req.params.artistId, {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [
        { model: ArtistImage, attributes: { exclude: ['createdAt', 'updatedAt'] } },
        {
          model: Artwork, as: 'Creations', through: { attributes: [] },
          attributes: ['id', 'artistName', 'name', 'creationTime', 'height', 'width', 'depth'],
          include: [
            { model: ArtworkImage, attributes: { exclude: ['createdAt', 'updatedAt'] } },
            { model: Medium, attributes: { exclude: ['createdAt', 'updatedAt'] } },
            {
              model: Subject, as: 'SubjectTags', through: { attributes: [] },
              attributes: { exclude: ['createdAt', 'updatedAt'] }
            },
            {
              model: Exhibition, as: 'JoinedExhibitions', through: { attributes: [] },
              attributes: { exclude: ['createdAt', 'updatedAt', 'privacy', 'location'] },
              where: { privacy: 2 }, require: false,
              include: { model: ExhibitionImage, attributes: ['url', 'type'], where: { type: 'poster' }, require: false, limit: 1 }
            },
          ]
        }
      ]
    })

    if (!artist_rawData) {
      res.status(404)
      throw new Error('Artist unavailable')
    }
    let artist = artist_rawData.toJSON()

    // 整理藝術家資料介紹
    // put image url in artist.headImage if exists & delete artist.ArtistImages
    getHeadImage(artist)

    // get allMedium, allSubjects, allExhibitions
    const allMedium = new Map()
    const allSubjects = new Map()
    const allExhibitions = new Map()

    artist.Creations.forEach(work => {
      allMedium.set(work.Medium.id, {
        id: work.Medium.id,
        name: work.Medium.name,
        represent_work: allMedium.has(work.Medium.id) ? allMedium.get(work.Medium.id).represent_work : (work.ArtworkImages[0]?.url || IMAGE_NOT_AVAILABLE),
        count: allMedium.get(work.Medium.id) ? allMedium.get(work.Medium.id).count + 1 : 1
      })

      work.SubjectTags.forEach(tag => {
        allSubjects.set(tag.id, {
          id: tag.id,
          name: tag.name,
          represent_work: allSubjects.has(tag.id) ? allSubjects.get(tag.id).represent_work : (work.ArtworkImages[0]?.url || IMAGE_NOT_AVAILABLE),
          count: allSubjects.get(tag.id) ? allSubjects.get(tag.id).count + 1 : 1
        })
      })
      delete work.SubjectTags

      work.JoinedExhibitions.forEach(exh => {
        allExhibitions.set(exh.id, {
          id: exh.id,
          info: exh,
          count: allExhibitions.get(exh.id) ? allExhibitions.get(exh.id).count + 1 : 1
        })
      })
      delete work.JoinedExhibitions

      // 整理藝術品資料：add image default; adjust format of size, creationTime
      work.image = work.ArtworkImages[0] ? work.ArtworkImages[0].url : IMAGE_NOT_AVAILABLE  // if no image in DB, use "no image"
      work.size = (work.depth) ? (work.height + "x" + work.width + "x" + work.depth + " cm") : (work.height + "x" + work.width + " cm")
      work.creationTime = work.creationTime ? work.creationTime.getFullYear() : ""
    })

    // map轉換為array，再從大到小排序
    function compareCount(a, b) { b.count - a.count }
    artist.allMedium = [...allMedium.values()].sort(compareCount)
    artist.allSubjects = [...allSubjects.values()].sort(compareCount)
    artist.allExhibitions = [...allExhibitions.values()].sort(compareCount)

    // 整理展覽資料：date格式轉換、introduction
    artist.allExhibitions.forEach(exh => {
      exh.info.date_start = exh.info.date_start.toISOString().slice(0, 10)
      exh.info.date_end = exh.info.date_end.toISOString().slice(0, 10)
      exh.info.introduction = exh.info.introduction.slice(0, 55) + "..."
    })
    return artist
  },
  getArtistImages: async (req, res) => {
    const artistImages_raw = await Artist.findByPk(req.params.artistId, {
      attributes: ['id', 'name'],
      include: {
        model: ArtistImage, attributes: { exclude: ['createdAt', 'updatedAt'] }
      }
    })

    if (!artistImages_raw) {
      res.status(404)
      throw new Error('Artist Unavailable')
    }
    const artistImages = artistImages_raw.toJSON()

    if (!artistImages.ArtistImages.length) {
      res.status(404)
      throw new Error('Artist Images Unavailable')
    }

    return artistImages
  }
}


module.exports = artistController