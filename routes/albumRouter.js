const express = require("express");
const albumRouter = express.Router();
const albumDetailsController = require("../controllers/albumDetailsController");
const {
  validateAlbumDetails,
} = require("../validations/albumDetails.validation");
const validateSongs = require("../validations/song.validation");

// gets all albums details
albumRouter.get("/album-details", albumDetailsController.getAllAlbumDetails);
// search for album details by title
albumRouter.get(
  "/album-details/search",
  albumDetailsController.searchAlbumDetailsbyTitle
);
// search for album details by label number
albumRouter.get(
  "/album-details/search/label-number:num",
  albumDetailsController.getAlbumDetailsByLabelNumber
);
// get album by id
albumRouter.get(
  "/album-details/:id",
  albumDetailsController.getAlbumDetailsById
);

// creates new album details
albumRouter.post(
  "/album-details-with-songs",
  validateAlbumDetails,
  validateSongs,
  albumDetailsController.createNewAlbumDetails
);

//deletes an album by id
albumRouter.delete(
  "/album-details/:id",
  albumDetailsController.deleteAlbumDetailsbyId
);

module.exports = albumRouter;
