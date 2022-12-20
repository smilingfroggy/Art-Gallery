const db = require('../models')
const { Artwork, Subject, Medium, Artist, ArtistImage, ArtworkImage, Exhibition, ExhibitionImage } = db

const artistController = {
  getArtist: async (req, res, next) => {
    try {
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
      
      if (!artist_rawData) throw new Error('Artist unavailable')
      let artist = artist_rawData.toJSON()

      // 整理藝術家資料介紹
      if (!artist.ArtistImages.length) {
        artist.headImage = 'https://i.imgur.com/QJrNwMz.jpg'  //預設空白大頭照
      } else {
        let headImage = artist.ArtistImages.find(imageData => imageData.type === 'head') || artist.ArtistImages[0]
        artist.headImage = headImage.url.split('.jpg')[0] + 'b.jpg'
      }
      delete artist.ArtistImages

      // get allMedium, allSubjects, allExhibitions
      const allMedium = new Map()
      const allSubjects = new Map()
      const allExhibitions = new Map()

      artist.Creations.forEach(work => {
        allMedium.set(work.Medium.id, {
          id: work.Medium.id,
          name: work.Medium.name,
          count: allMedium.get(work.Medium.id) ? allMedium.get(work.Medium.id).count + 1 : 1
        })

        work.SubjectTags.forEach(tag => {
          allSubjects.set(tag.id, {
            id: tag.id,
            name: tag.name,
            count: allSubjects.get(tag.id) ? allSubjects.get(tag.id).count + 1 : 1
          })
        })
        delete work.SubjectTags

        work.JoinedExhibitions.forEach(exh => {
          allExhibitions.set(exh.id, {
            'id': exh.id,
            'info': exh,
            'count': allExhibitions.get(exh.id) ? allExhibitions.get(exh.id).count + 1 : 1
          })
        })
        delete work.JoinedExhibitions

        // 整理藝術品資料：add image default; adjust format of size, creationTime
        work.image = work.ArtworkImages[0] ? work.ArtworkImages[0].url : 'https://i.imgur.com/nVNO3Kj.png'  // if no image in DB, use "no image"
        work.size = (work.depth) ? (work.height + "x" + work.width + "x" + work.depth + " cm") : (work.height + "x" + work.width + " cm")
        work.creationTime = work.creationTime ? work.creationTime.getFullYear() : ""
      })

      // map轉換為array，再從大到小排序
      // artist.allMedium = allMedium   // allMedium為map無法直接輸出json (console.log顯示可加入artist{}但是res.json不出來)
      function compareCount(a, b) { b.count - a.count }
      artist.allMedium = [...allMedium.values()].sort(compareCount)
      artist.allSubjects = [...allSubjects.values()].sort(compareCount)
      artist.allExhibitions = [...allExhibitions.values()].sort(compareCount)

      // 找出medium, subject, exhibition 各一件作品做為代表圖
      for (let i = 0; i < artist.allMedium.length; i++) {
        const id = artist.allMedium[i].id
        const select = await Artwork.findOne({
          raw: true,
          nest: true,
          attributes: ['id', 'name'],
          include: [
            { model: Artist, as: 'Creators', attributes: [], through: { attributes: [] }, where: { id: req.params.artistId } },
            { model: ArtworkImage, attributes: ['url'] },
            { model: Medium, where: { id: id }, attributes: [] }
          ]
        })
        artist.allMedium[i].represent_work = select
      }

      for (let i = 0; i < artist.allSubjects.length; i++) {
        const id = artist.allSubjects[i].id
        const select = await Artwork.findOne({
          raw: true,
          nest: true,
          attributes: ['id', 'name'],
          include: [
            { model: Artist, as: 'Creators', attributes: [], through: { attributes: [] }, where: { id: req.params.artistId } },
            { model: ArtworkImage, attributes: ['url'] },
            { model: Subject, as: 'SubjectTags', where: { id: id }, attributes: [], through: { attributes: [] } }
          ]
        })
        artist.allSubjects[i].represent_work = select
      }

      // 整理展覽資料：date格式轉換、introduction
      artist.allExhibitions.forEach(exh => {
        exh.info.date_start = exh.info.date_start.toISOString().slice(0, 10)
        exh.info.date_end = exh.info.date_end.toISOString().slice(0, 10)
        exh.info.introduction = exh.info.introduction.slice(0, 55) + "..."
      })

      // return res.json(artist)
      return res.render('artist', { artist })
    } catch(error) {
      console.log(error)
      next(error)
    }
  }
}


module.exports = artistController