const fs = require('fs')
const { ImgurClient } = require('imgur')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const client = new ImgurClient({ clientId: IMGUR_CLIENT_ID})

const imgurFileHandler = file => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)
    // file.path: temp\148db7d7d051a05cd00e22f240176d55
    return client.upload({
      image: fs.createReadStream(file.path),
      type: 'stream'
    })
      .then(img => {
        if (!img || img.success === false) return resolve(null)
        resolve(img?.data.link || null)
      })
      .catch(err => reject(err))
  })
}

const imgurErrorMsg = 'Some images failed to upload due to unsupported file type or large file sizes'

module.exports = {
  imgurFileHandler,
  imgurErrorMsg
}