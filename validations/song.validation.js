const { checkSchema } = require("express-validator");

// validations for AlbumDetails using checkSchema using express-validator.
const validatesongs = checkSchema({
  "data.songs": {
    exists: {
      errorMessage: "Songs array for request body is required",
      options: { checkFalsy: true },
    },
    isArray: {
      errorMessage: "Songs should be an array\
 that contains at least one element in it ." ,
      options: {min: 1},
    }
  },
  "data.songs.*.title": {
    exists: {
      errorMessage: "Title for a song is required.",
      options: { checkFalsy: true },
    },
      isString: { errorMessage: "Title of a song should be a String." },
    },
  "data.songs.*.artists": {
    exists: {
      errorMessage: "Artist/s for a song is required.",
      options: { checkFalsy: true },
    },
    isArray: { 
      errorMessage: "Artist/s of a song should be an array\
 that contains at least one element in it ." ,
      options: {min: 1},
    },
  }
});

module.exports = validatesongs;