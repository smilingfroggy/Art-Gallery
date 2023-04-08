const ARTIST_AVATAR_NOT_AVAILABLE = 'https://i.imgur.com/QJrNwMz.jpg'  // default blank avatar image
const IMAGE_NOT_AVAILABLE = 'https://i.imgur.com/nVNO3Kj.png' 

// put image url in creator.headImage & delete creator.ArtistImages
// select artist's avatar image which type='head' first
function getHeadImage(artist) {
  if (!artist.ArtistImages.length) {
    artist.headImage = ARTIST_AVATAR_NOT_AVAILABLE
  } else {
    let headImage = artist.ArtistImages.find(imageData => imageData.type === 'head') || artist.ArtistImages[0]
    
    // use big square version of image
    artist.headImage = headImage.url.split('.jpg')[0] + 'b.jpg'
  }
  delete artist.ArtistImages
}


module.exports = {
  ARTIST_AVATAR_NOT_AVAILABLE,
  IMAGE_NOT_AVAILABLE,
  getHeadImage
}