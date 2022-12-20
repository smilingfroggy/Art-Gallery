# Art Collections

Inspired by Google Arts and Culture, this web application is a platform with artworks inventory for both art providers and audiences to search, collect, curate, and display.

The aim is to facilitate the exposure of artworks that mostly sit in a warehouse or studio, to increase the interaction between arts and the audience, and create the profile of a piece of work.

- Administrators can curate online-exhibitions, manage and organize artworks and creators introductions. 

- Users can create private or public collections, and add works into collections or favorite list, whenever visiting an exhibition or simply searching for the perfect works that match their taste.

## Demo
Online-demo https://art-gallery-01.herokuapp.com/artworks

![Imgur](https://i.imgur.com/pwk6YsP.jpg)
---
![Imgur](https://i.imgur.com/lI0YjSF.jpg)
---
![Imgur](https://i.imgur.com/1OibC3M.jpg)

## Installation
    

* Run locally

1. Clone this repository with terminal:

    ```$ git clone https://github.com/smilingfroggy/Art-Gallery.git```

2. Install packages:

    ```$ cd Art-Gallery```

    ```$ npm install ```

3. Create database and insert seeder 

    ```$ npm run rebuildDB```

4. Create `.env` file to set environment parameter


    ```$ touch .env```

    To upload image with admin account, login and create applications at https://imgur.com to get ClientID for `.env` file

5. Run it 

    ```$ npm run dev```

6. View the website at: http://localhost:3000

7. Register an account or use seed accounts to login
    - User 
        - Account：
        user1@example.com, 
        user2@example.com, 
        user3@example.com
        - PW: 12345678
    - Admin 
        - Account： admin@example.com
        - PW: root


## ERD
![ERD](https://i.imgur.com/HtdLzBY.jpg)
- The main content provided by administrator involves three main tables, Exhibition, Artwork, and Artist.
- Both Exhibition & Artwork, Artwork & Artist have many-to-many relationships, as works are allowed to display in different exhibition and artworks can be created by multiple artists.
- Table Exhibition, Artwork, and Artist all have multiple images belonging to them.
- Artwork table has additional relation with Subject and Media, belongs to many subjects and belongs to one media.
- Collection is another table created by and belongs to an user, with various works that can be added to different collections.


## Features

### User
- Browse public exhibitions's introduction and artworks
- Search works with name, artist, media, size, create year, subjects.
- Artwork introduction connects with related subjects, media, and creator.
- Browse other users' public collections. 
- Logged-in users can add works from websites mentioned above to their favorite list.
- Logged-in users can create their own collections with descriptions, manage privacy, edit description, and delete it.
- Add or remove artworks to their own collections wherever they spot the correct one.
- Guest users can only browse public exhibitions, collections, and search artworks.

### Admin
- Create, edit, and delete artwork information and images.
- Create, edit, and delete exhibitions information and image.
- Search and select artworks from inventory, and add to exhibitions.
 


## Future work

### User
- Edit own profile
- Collections can be set to allow only users with exclusive links to view. 
- Add ordering function to artworks searching page.
- Add exhibition records to individual artwork page.

### Admin
- Create, edit, and delete artist data and related images.
- Create, edit, and delete subject data.
- Read the summary table with viewCounts and total of joinedCollection and addedFavorite of each work.
- Create QRcode of artwork page, and export all QRcode of works joined in certain exhibition.
- Add ordering function to artwork inventory.

<!--

### Others
- API version with JWT authentication
- Cache artworks front page, top 20% viewCounts artwork, active users' collections. -->

<!-- ### Precautions? -->

## Packages 
- Node.js
- MySQL
- Sequelize, Sequelize-cli
- Express.js
- Express-handlebars
- Express-session
- bcryptjs
- connect-flash
- dotenv
- faker
- method-override
- multer
- imgur
- passport
- passport-local
- xlsx