const { checkSchema } = require("express-validator");

// validations for AlbumDetails using checkSchema using express-validator.
const validateAlbumDetails = checkSchema({
  "data.album_details.title": {
    exists: {
      errorMessage: "Title for an album is required.",
      options: { checkFalsy: true },
    },
    isString: { errorMessage: "Title of an album should be a String." },
  },
  "data.album_details.record_label": {
    exists: {
      errorMessage: "Record label for an album is required.",
      options: { checkFalsy: true },
    },
    isString: { errorMessage: "Record label of an album should be a String." },
  },
  "data.album_details.label_number": {
    exists: {
      errorMessage: "label number for an album is required.",
      options: { checkFalsy: true },
    },
    isString: { errorMessage: "label number of an album should be a String." },
  },
  "data.album_details.artists": {
    exists: {
      errorMessage: "Artists should be an array of artist/s.",
      options: { checkFalsy: true },
    },
    isArray: { errorMessage: "Artist/s of an album should be a String." },
  },
  "data.album_details.tags": {
    optional: { options: { nullable: true } },
    isArray: { errorMessage: "Tag/s should be an array of Strings" },
  },
});

module.exports = {
  validateAlbumDetails,
};
