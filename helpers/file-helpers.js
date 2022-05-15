const fs = require('fs')
const { ImgurClient } = require('imgur')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const client = new ImgurClient({ clientId: IMGUR_CLIENT_ID})

const imgurFileHandler = file => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)
    return client.upload({
      image: fs.createReadStream(file.path),
      type: 'stream'
    })
      .then(img => {
        resolve(img?.data.link || null)
      })
      .catch(err => reject(err))
  })
}


module.exports = {
  imgurFileHandler
}