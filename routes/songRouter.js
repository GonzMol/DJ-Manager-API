const express = require("express");
const songRouter = express.Router();
const songController = require("../controllers/songController");
const validateSongs = require("../validations/song.validation");

songRouter.get("/songs/search", songController.searchSongByProperty);

songRouter.get("/songs/album_id=:album_id", songController.searchSongByAlbumId);

module.exports = songRouter;
