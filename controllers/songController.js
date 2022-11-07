const songService = require("../services/songService");
const AlbumDetailsService = require("../services/albumDetailsService");
const { validationResult } = require("express-validator");

/**
 * Takes a POST request to upload new songs to the database.
 * Returns a payload with the new created document.
 * document.
 * @param {*} req request object - taken from http request.
 * @param {*} res response object - taken form http request.
 * @returns {*} payload - {success, data, errors}. success is
 * the status of the request, data contains data from database, errors
 * contains error messages if any exist.
 */
const insertNewSongs = async (req, res) => {
  let payload = {
    success: false,
    data: undefined,
    errors: undefined,
  };

  /* Validate the request body */

  // receives errors from validation if there is any
  let errors = validationResult(req);
  // if there errors from data validation we send back error messages
  if (!errors.isEmpty()) {
    payload.errors = errors.array();
    return res.status(400).json(payload);
  }

  /* The request body validated, now validate the album_id of songs */

  // firstly, check the consistency of the album_id of songs
  const album_id = req.body.data[0].album_id;
  for (let eachSong of req.body.data) {
    if (eachSong.album_id != album_id) {
      payload.errors = [{ msg: "inconsistent album_id in songs from request" }];
      return res.status(400).json(payload);
    }
  }
  // secondly, check the album_id exists in the database
  let { data: albumData, err: albumErr } =
    await AlbumDetailsService.getAlbumDetailsById(album_id);
  // if err raise, sent back err message
  if (albumErr) {
    payload.errors = [{ msg: albumPayload.err.message }];
    return res.status(500).json(payload);
  }

  // if data is null, then no album-details matching that id was found.
  if (!albumData) {
    payload.errors = [
      { msg: "album-details with id: " + album_id + " is not exitst." },
    ];
    return res.status(404).json(payload);
  }

  /* All validations are passed, now insert songs into database */

  // save songs into database
  let { data, err } = await songService.insertNewSongs(req.body.data);
  // errors from the database. if present, send back error message.
  if (err) {
    payload.errors = [{ msg: err.message }];
    return res.status(500).json(payload);
  }

  /* successful */
  payload.success = true;
  payload.data = data;
  return res.status(201).json(payload);
};


/**
 * Takes a GET request to find a song with a matching query.
 * Returns a payload with an array of songs matching query.
 * @param {*} req request object - taken from http request.
 * @param {*} res response object - taken form http request.
 * @returns {*} payload - {success, data, errors}. success is
 * the status of the request, data contains data from database, errors
 * contains error messages if any exist.
 */
 const searchSongByProperty = async (req, res) => {
  let payload = {
    success: false,
    data: undefined,
    errors: undefined,
  };
  // if there is no title query parameter, we get an empty
  // data: [] after calling service.
  const title = req.query.title;
  const artist = req.query.artist;
  const query = {
    title: title,
    artist: artist,
  }

  // fetching data from database
  const { data, err } = await songService.findSongsByProperty(query);
  // errors from the database. if present, send back error message.
  if (err) {
    payload.errors = [{ msg: err.message }];
    return res.status(500).json(payload);
  }

  // if there is no songs with the property in query was found, we get an empty
  // data: [] after calling service.
  // if data is null, then no matches were found
  if (data.length === 0) {
    payload.errors = [
      { msg: 'No songs with : "title = ' + query.title + ", " + "artist = " 
      + query.artist + '" was found.' },
    ];
    return res.status(404).json(payload);
  }

  // successful
  payload.success = true;
  payload.data = data;
  return res.status(200).json(payload);
};


/**
 * Takes a GET request to find a song with a matching query.
 * Returns a payload with an array of songs matching query.
 * @param {*} req request object - taken from http request.
 * @param {*} res response object - taken form http request.
 * @returns {*} payload - {success, data, errors}. success is
 * the status of the request, data contains data from database, errors
 * contains error messages if any exist.
 */
 const searchSongByAlbumId = async (req, res) => {
  let payload = {
    success: false,
    data: undefined,
    errors: undefined,
  };
  
  let album_id = req.params.album_id;

  // fetching data from database
  const { data, err } = await songService.getSongByAlbumId(album_id);
  // errors from the database. if present, send back error message.
  if (err) {
    payload.errors = [{ msg: err.message }];
    return res.status(500).json(payload);
  }

  // if there is no songs with album_id was found, we get an empty
  // data: [] after calling service.
  // if data is null, then no matches were found
  if (data.length === 0) {
    payload.errors = [
      { msg: 'No songs with : "album_id = ' + album_id  + '" was found.' },
    ];
    return res.status(404).json(payload);
  }

  // successful
  payload.success = true;
  payload.data = data;
  return res.status(200).json(payload);
};

module.exports = {
  insertNewSongs,
  searchSongByProperty,
  searchSongByAlbumId,
};
